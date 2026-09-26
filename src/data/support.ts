import { site } from './site';

/**
 * Support page copy, verbatim from docs/spec.md §7.
 * Answers are drafts: confirm each against the app with the owner.
 */
export const support = {
  title: 'Support',
  intro:
    'Stuck on something? The answers to the usual questions are below. If yours isn’t there, write to us.',

  contact: {
    label: 'Write to us',
    email: site.supportEmail,
    button: 'Send an email',
  },

  groups: [
    {
      title: 'Your piano',
      items: [
        {
          q: 'How do I connect my piano?',
          a: 'Turn on Bluetooth on the piano, open the Connect tab and pick it from the list. A USB cable works too: plug it in and piano.play connects on its own. Any digital piano or keyboard with MIDI will do.',
        },
        {
          q: 'My piano isn’t in the list.',
          a: 'Make sure the piano’s Bluetooth MIDI is on (some pianos need a button held or a setting turned on) and that it isn’t connected to another app. Pianos without Bluetooth MIDI connect with a USB cable and Apple’s camera adapter.',
        },
        {
          q: 'Can I practise without a piano?',
          a: 'Yes: the on-screen keyboard plays along, and Listen lets you hear any passage.',
        },
      ],
    },
    {
      title: 'Your music',
      items: [
        {
          q: 'How do I add my own sheet music?',
          a: 'Export it as MusicXML (.musicxml, .xml or .mxl) from MuseScore, Sibelius, Finale or Dorico, then tap + in the Library and choose the file.',
        },
        {
          q: 'Why can’t I open a PDF?',
          a: 'A PDF is a picture of the music; piano.play needs the notes themselves. Many free scores on MuseScore can be downloaded as MusicXML.',
        },
        {
          q: 'Listen doesn’t make a sound.',
          a: 'The first time, the app downloads the piano sound, so it needs internet once. Also check that the phone isn’t on silent.',
        },
      ],
    },
    {
      title: 'Plus',
      items: [
        {
          q: 'How do I restore my purchase on a new phone?',
          a: 'Open Settings in the app and tap Restore purchases, signed in with the same Apple Account.',
        },
        {
          q: 'How do I cancel?',
          a: 'In your iPhone’s Settings, tap your name, then Subscriptions, then piano.play.',
        },
        {
          q: 'Will I be charged when the free week ends?',
          a: 'Only if you don’t cancel. The app reminds you two days before the trial ends.',
        },
      ],
    },
  ],
} as const;
