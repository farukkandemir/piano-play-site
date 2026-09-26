# getpianoplay.com: site spec

Written 25 September 2026, from the design session in the app repo. This file is meant to be enough
to plan and build the site in a fresh session. Read it fully before planning.

## 1. What this is

The public website for **piano.play**, an iPhone app for practising the piano: import MusicXML sheet
music, connect a digital piano over Bluetooth or USB MIDI, and play along in Wait Mode (the sheet waits
for the right notes). Plus is the paid tier (monthly $5.99, yearly $34.99 with 7 days free, lifetime
$69.99) and unlocks unlimited pieces and every level.

The site has three jobs:
1. **Convince, briefly.** A short landing page that tells a small story and shows how practice feels.
2. **Privacy policy.** Required by Apple before submission; its URL also goes into the app
   (`PRIVACY_URL` in the app repo's `src/plus/plus.ts`) and App Store Connect.
3. **Support page.** Required by Apple; the App Store links to it.

Domain: **getpianoplay.com** (bought at Cloudflare, 25 Sep 2026). Pages: `/`, `/privacy`, `/support`.

The owner's other product, pianolearn.app, is a separate brand. Never link the two.

## 2. The owner and how we work

- The owner is an experienced web developer. Explain briefly, no long write-ups.
- Every change starts on its own branch. Commit, merge and push only when the owner says so.
- Research before adding any dependency (maintenance, licence, size). No speculative installs.
- The owner runs system-level installs (brew etc.) themselves; give the command.
- The bar is high: modern, considered, "not AI slop". Motion explains, it never decorates.
  Screens are calm and plain; every interaction answers with a small natural response.
- Design lives in Paper (see section 4). Build from the frames there, reading exact values with the
  Paper tools, never guessing from screenshots.

## 3. Tech (decided)

- **Astro**, static output. Plain HTML and CSS per page; a little TypeScript only where motion needs it.
  No UI framework islands unless a later need proves it.
- **Cloudflare Pages**, deploy on push to `main`. The domain is already at Cloudflare.
- **Its own repo**: this folder, `~/Desktop/piano-play-site`, a private GitHub repo (not created yet).
- **Fonts:** Outfit (the app's font), self-hosted as WOFF2, variable weight. No Google Fonts request
  at runtime (privacy page says no tracking).
- **No analytics, no cookies, no third-party scripts.** If that ever changes, the privacy page changes first.
- **Motion:** CSS transitions and the Web Animations API. `IntersectionObserver` for "comes into view".
  No animation library unless a real need appears.
- Hosting the images: WebP, served by Pages with long cache headers.

## 4. Design source

Paper file **"xylophone"**, page **"Site · getpianoplay.com"**. Use the Paper tools (`get_jsx`,
`get_computed_styles`, `get_fill_image`) for exact values.

| Frame | What it is |
|---|---|
| **D · The music room** | **The landing page to build.** |
| D · /privacy | Privacy page |
| D · /support | Support page |
| E · The music room · keys | Same as D with a keyboard hero. Not chosen; kept for later |
| Hero exploration · Keys / · One bar, magnified | Hero alternatives, not chosen |
| A, B, C | Earlier directions, not chosen |

Only desktop (1440) frames exist. **Mobile is not drawn**: build mobile-first with the rules in
section 8 and show the owner on a phone before calling a page done.

### Tokens (from the app, keep identical)

| Token | Value | Use |
|---|---|---|
| bg | `#FCFBFD` | page |
| surface | `#FFFFFF` | cards |
| paper | `#F3F0F6` | sheet paper, quiet panels |
| border | `#E9E5EE` | hairlines |
| ink | `#1E2433` | text, dark panels |
| ink-muted | `#6E6480` | secondary text |
| ink-faint | `#AFA6BB` | faint text |
| accent (plum) | `#6A4C7C` | the one expressive colour |
| accent-lifted | `#C7ACDD` | plum on dark |
| accent-tint | `#EFE7F2` | plum panels |
| right hand | `#3B6FE0` | cursor band at 12% alpha |
| left hand | `#E8853A` | keyboard only |

Type: Outfit. Display 96/92 SemiBold, tracking -0.045em. Section titles 64/64 SemiBold, -0.04em.
Body 19–20/29–30 Regular in ink-muted. Labels 14 Medium in plum. Radii: 22 (covers), 36 (big panels).

## 5. Landing page `/` (frame "D · The music room")

Top to bottom:

1. **Nav.** "piano.play" wordmark left; "Coming soon to the App Store" right (quiet text, no link).
2. **Hero.** Headline "That piece you always wanted to play." Sub: "Connect your piano, open any
   piece, and practise at your own pace." Under it, a **full-width grand staff** (treble and bass)
   running off both edges: three bars of chords, the played notes plum, a blue cursor band on the
   current chord, the rest ink.
   - Build it as inline SVG. Clefs: use the same glyph outlines the app uses (app repo
     `src/components/library/clefPaths.ts`, from VexFlow 1.2.93, MIT). Noto Music in Paper was only a stand-in.
   - Make it **its own component** (`Hero.astro` or similar): the owner may swap the hero later.
   - Motion: the cursor steps chord to chord (~900 ms per chord, `cubic-bezier(0.77,0,0.175,1)` for the
     move), each chord turns plum as it's reached. Loops slowly; pauses when off screen.
3. **01 · Choose — "Any piece you want."** Text: "Bring your own sheet music from MuseScore, or start
   with free pieces from Bach to Satie. Each one gets a painted cover." Below: a row of six covers at
   staggered heights (Clair de Lune, Gymnopédie No. 1, Prelude in C, Für Elise, Nocturne Op. 9 No. 2,
   Liebestraum No. 3) with title and composer.
   - Images: copy from the app repo `piano-play/assets/catalog/covers/<id>.webp` (1024 px WebP).
     Ids: `clair-de-lune-easy`, `gymnopedie-1`, `bach-prelude-c`, `fur-elise`, `chopin-nocturne-op9-2`,
     `liszt-liebestraum-3`. Serve at 2× the displayed size.
   - Motion: covers arrive one after another as the row comes into view (opacity 0→1, translateY 16→0,
     400 ms ease-out, 60 ms stagger). Once.
4. **02 · Listen and 03 · Play — one pinned phone.** Headline changes with the chapter:
   Listen: "Hear it before you play it." / "A real grand piano plays the passage, and every note lights up
   as it sounds." Play: title and line to be written with the owner (idea: "Your piano listens." /
   "The sheet waits until you play the right notes, then moves on.").
   - The phone: **Apple's official iPhone bezel** (Apple Design Resources, landscape), upright, no
     tilt, no added shadow or reflection, never animated itself (Apple marketing rules). Only the screen
     content moves.
   - Screen: the app's practice screen (title bar, grand staff, on-screen keyboard), rebuilt as SVG/HTML
     so it can animate. Values from Paper frame "Practice V1 · default" (page 1).
   - Listen state: the cursor runs across the bar, notes light up in turn, matching keys light on the
     keyboard.
   - Play state: the keyboard becomes interactive (mouse, touch, and computer keys A S D F …). The
     highlighted key must be pressed; wrong key = a small shake, right key = the note turns plum and the
     cursor moves on. Silent in v1 (no audio).
   - **Chapter bar** pinned at the bottom of the viewport while this section is on screen: Choose ·
     Listen · Play, the current one filled ink. Tapping a chapter scrolls to it.
5. **Ending.** The painted piano room under an ink gradient (left 92% → right 35%), "Whenever you're
   ready." and a light "Coming soon to the App Store" button. Image: app repo
   `piano-play/assets/images/hero-piano.jpg` (placeholder art the owner likes here; do not re-crop or
   "improve" it without asking).
6. **Footer.** "piano.play · made for iPhone" left; Privacy, Support right.

### Coming soon → launch

The download button is text until launch. On launch day it becomes Apple's official "Download on the
App Store" badge linking to the App Store page. Make the swap one config value.

## 6. Privacy `/privacy` (frame "D · /privacy")

720 px reading column. Text is final draft; build it verbatim, then re-check each fact (section 10).

- **Privacy** · Updated 25 September 2026
- Plum box: THE SHORT VERSION / **Your music stays on your phone.** / No account, no ads, no tracking.
  Here's the little that does leave, and why.
- **What leaves your phone** (label column + text):
  - **Covers:** The title and composer of a piece you import, so we can paint its cover, with a random ID
    that caps covers per day. Never the music itself. Covers are kept, so the next person adding the same
    piece gets it instantly.
  - **Purchases:** Handled by Apple. RevenueCat confirms your Plus with an anonymous ID, for as long as you
    subscribe. We never see your name or card.
  - **Crash reports:** When the app crashes, Sentry gets the error, the app version and the phone model.
    Nothing personal. Stored in the US and deleted after 30 days.
  - **Piano sound:** Downloaded once, the first time you tap Listen. Like any download, our file host sees
    your IP address. We don't keep it.
- Small line: These services use the data only for the job above and protect it as carefully as we do.
  Some are based in the United States.
- **Your rights:** Delete the app and everything it stored goes with it. You can also ask us what we hold,
  or to delete it: write to us and name the pieces you imported, since we don't know who you are. If
  you're not happy with our answer, you can complain to your local data protection authority.
- Small print, three columns:
  - **Children:** We never ask for a name, age or email, and don't knowingly collect personal information
    from children.
  - **Who we are:** Faruk Kandemir, an independent developer in the United States. support@getpianoplay.com
  - **Changes:** If anything here changes, we update this page and the date at the top.

Written against Apple guideline 5.1.1(i), GDPR Art. 13 and COPPA basics. Not legal advice.

## 7. Support `/support` (frame "D · /support")

- **Support** / "Stuck on something? The answers to the usual questions are below. If yours isn't
  there, write to us."
- Dark card: "Write to us" / **support@getpianoplay.com** / button "Send an email" (`mailto:`).
- Accordion, three groups (use `<details>`/`<summary>`; animate height with care, respect reduced motion).
  Answers are drafts; confirm each against the app with the owner.
  - **YOUR PIANO**
    - *How do I connect my piano?* Turn on Bluetooth on the piano, open the Connect tab and pick it from
      the list. A USB cable works too: plug it in and piano.play connects on its own. Any digital piano
      or keyboard with MIDI will do.
    - *My piano isn't in the list.* Make sure the piano's Bluetooth MIDI is on (some pianos need a button
      held or a setting turned on) and that it isn't connected to another app. Pianos without Bluetooth
      MIDI connect with a USB cable and Apple's camera adapter.
    - *Can I practise without a piano?* Yes: the on-screen keyboard plays along, and Listen lets you hear
      any passage.
  - **YOUR MUSIC**
    - *How do I add my own sheet music?* Export it as MusicXML (.musicxml, .xml or .mxl) from MuseScore,
      Sibelius, Finale or Dorico, then tap + in the Library and choose the file.
    - *Why can't I open a PDF?* A PDF is a picture of the music; piano.play needs the notes themselves.
      Many free scores on MuseScore can be downloaded as MusicXML.
    - *Listen doesn't make a sound.* The first time, the app downloads the piano sound, so it needs
      internet once. Also check that the phone isn't on silent.
  - **PLUS**
    - *How do I restore my purchase on a new phone?* Open Settings in the app and tap Restore purchases,
      signed in with the same Apple Account.
    - *How do I cancel?* In your iPhone's Settings, tap your name, then Subscriptions, then piano.play.
    - *Will I be charged when the free week ends?* Only if you don't cancel. The app reminds you two days
      before the trial ends.

## 8. Mobile and responsive (not drawn; rules)

- Content column 20 px side padding under 768 px.
- Hero headline scales with `clamp()` (about 44 px on a 390 px phone). The staff stays full-bleed and
  scrolls sideways slowly with the cursor instead of shrinking the notes.
- Cover wall: horizontal scroll-snap row on phones, staggered heights kept.
- Listen/Play: phone stays upright landscape bezel, full width; the chapter bar stays pinned.
- Privacy small print: one column.
- Test on a real iPhone (the owner's) before "done".

## 9. Quality bar

- **Reduced motion:** no movement; opacity changes only. The hero shows a still frame with one chord
  plum.
- **Accessibility:** real headings in order, alt text for covers ("Cover painting for Clair de Lune"),
  the staff and phone are decorative (`aria-hidden`) with a text equivalent nearby, focus rings visible,
  contrast AA.
- **Performance:** Lighthouse 95+ on mobile; LCP under 2 s; total JS under 20 KB gzipped.
- **Meta:** title, description, Open Graph image (a still of the hero), favicon from the app icon,
  `apple-itunes-app` smart banner meta once the app is live, a quiet 404 page in the same style.

## 10. Open items (owner)

1. **support@getpianoplay.com does not exist yet.** Cloudflare Email Routing can forward it for free.
2. **The app's piano sound downloads from `sounds.pianolearn.app`** (app repo `src/sound/soundfont.ts`).
   Move it to a getpianoplay.com subdomain before launch (same R2 bucket, new custom domain).
3. **Verify privacy facts:** Sentry retention on the owner's plan (30 days assumed); the cover server
   keeps the install ID forever today, next to title and composer (clearing it after 24 h was discussed,
   owner deferred it); Supabase region.
4. **Play chapter copy** to write with the owner.
5. **Hero** may be replaced later; see the Keys and magnified-bar explorations in Paper.
6. After the site is live: put `https://getpianoplay.com/privacy` into the app's `PRIVACY_URL` and into
   App Store Connect, and the support URL into App Store Connect.

## 11. Out of scope for v1

Email list, blog, analytics, cookies, languages other than English, Android, a web version of the app,
audio on the site, iPad frames.
