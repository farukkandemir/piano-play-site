"""
Extracts hero piano samples for getpianoplay.com from the piano.learn SoundFont
(salamander-8v.sf2, built by pianolearn-sounds/build_sf2.py from Salamander
Grand Piano V3 by Alexander Holm, CC BY 3.0). Stdlib only; encodes with macOS
afconvert.

usage: python3 extract-samples.py SF2 OUT_DIR [LAYER=5] [KBPS=104]

For one velocity layer (1 = softest of the bank's layers) it takes the stereo
L/R sample pair of each root from F#4 to C6, starts it 1 ms before the attack
(so the m4a has no leading silence of its own), keeps 3.0 s with a 0.8 s
cosine fade to silence, writes a 44.1 kHz stereo WAV and an AAC .m4a.
"""
import array, math, os, struct, subprocess, sys, wave

SF2, OUT = sys.argv[1], sys.argv[2]
LAYER = int(sys.argv[3]) if len(sys.argv) > 3 else 5
KBPS = int(sys.argv[4]) if len(sys.argv) > 4 else 104
ROOTS = {66: 'fs4', 69: 'a4', 72: 'c5', 75: 'ds5', 78: 'fs5', 81: 'a5', 84: 'c6'}
KEEP_SEC, FADE_SEC, PRE_SEC = 3.0, 0.8, 0.001

f = open(SF2, 'rb')
def read_at(off, n):
    f.seek(off); return f.read(n)

# ---- RIFF walk: remember where every chunk we need lives ----------------------------------
chunks = {}
def walk(off, end):
    while off + 8 <= end:
        cid, size = struct.unpack('<4sI', read_at(off, 8))
        cid = cid.decode('latin-1')
        if cid in ('RIFF', 'LIST'):
            walk(off + 12, off + 8 + size)
        else:
            chunks[cid] = (off + 8, size)
        off += 8 + size + (size & 1)
walk(0, os.path.getsize(SF2))
smpl_off = chunks['smpl'][0]
def records(cid, fmt):
    off, size = chunks[cid]; n = struct.calcsize(fmt)
    data = read_at(off, size)
    return [struct.unpack_from(fmt, data, i) for i in range(0, size, n)]

inst = records('inst', '<20sH')
ibag = records('ibag', '<HH')
igen = records('igen', '<HH')          # op, raw amount (ranges: lo | hi << 8)
shdr = records('shdr', '<20sIIIIIBbHH')

# ---- instrument zones (first instrument) ---------------------------------------------------
zones = []
for b in range(inst[0][1], inst[1][1]):
    z = {}
    for op, amt in igen[ibag[b][0]:ibag[b + 1][0]]:
        z[op] = amt
    if 53 in z:                          # sampleID: skip the global zone
        zones.append(dict(key=(z[43] & 255, z[43] >> 8), vel=(z[44] & 255, z[44] >> 8),
                          root=z.get(58, shdr[z[53]][6]), sid=z[53]))
vels = sorted({z['vel'] for z in zones})
print('velocity layers:', vels)
vel = vels[LAYER - 1]
print(f'using layer {LAYER}: velocity {vel[0]}-{vel[1]}')

def pcm(sid):
    name, start, end, *_ = shdr[sid]
    a = array.array('h'); a.frombytes(read_at(smpl_off + 2 * start, 2 * (end - start)))
    if sys.byteorder == 'big': a.byteswap()
    return a, shdr[sid][5]

os.makedirs(OUT, exist_ok=True)
for root, name in ROOTS.items():
    zs = [z for z in zones if z['root'] == root and z['vel'] == vel]
    Ls = [z for z in zs if shdr[z['sid']][9] == 4]
    assert Ls, (root, name)
    L, rate = pcm(Ls[0]['sid'])
    R, _ = pcm(shdr[Ls[0]['sid']][8])     # linked right sample
    n = min(len(L), len(R))
    peak = max(max(abs(x) for x in L[:rate]), max(abs(x) for x in R[:rate]))
    thr = max(peak * 0.02, 30)
    onset = next(i for i in range(n) if abs(L[i]) > thr or abs(R[i]) > thr)
    start = max(0, onset - int(PRE_SEC * rate))
    keep = min(int(KEEP_SEC * rate), n - start)
    fade = int(FADE_SEC * rate)
    pre = onset - start
    out = array.array('h', bytes(4 * keep))
    for i in range(keep):
        g = 1.0
        if i < pre: g = i / pre                                    # 1 ms ramp before the attack
        j = i - (keep - fade)
        if j >= 0: g *= 0.5 * (1 + math.cos(math.pi * (j + 1) / fade))  # ends at exactly 0
        out[2 * i] = int(L[start + i] * g); out[2 * i + 1] = int(R[start + i] * g)
    if sys.byteorder == 'big': out.byteswap()
    wav = os.path.join(OUT, name + '.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(rate); w.writeframes(out.tobytes())
    m4a = os.path.join(OUT, name + '.m4a')
    subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(KBPS * 1000), '-q', '127', '-s', '0', wav, m4a], check=True)
    print(f'{name}: root {root}, onset {onset / rate * 1000:.1f} ms, {keep / rate:.2f} s, '
          f'peak {20 * math.log10(peak / 32768):.1f} dBFS, {os.path.getsize(m4a) // 1024} KB')
