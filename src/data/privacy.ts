import { site } from './site';

/**
 * Privacy policy copy, verbatim from docs/spec.md §6.
 * Written against Apple guideline 5.1.1(i), GDPR Art. 13 and COPPA basics. Not legal advice.
 * Change `updated` whenever any fact below changes (the page says so).
 */
export const privacy = {
  title: 'Privacy',
  updatedLabel: 'Updated',
  /** ISO date; rendered as "25 September 2026". */
  updated: '2026-09-26',

  short: {
    label: 'The short version',
    title: 'Your music stays on your phone.',
    text: 'No account, no ads, no tracking. Here’s the little that does leave, and why.',
  },

  leaves: {
    title: 'What leaves your phone',
    items: [
      {
        term: 'Covers',
        text: 'The title and composer of a piece you import, so we can paint its cover, with a random ID that caps covers per day. Never the music itself. Covers are painted by Google’s Gemini image model, which receives only the title and composer. Covers are kept, so the next person adding the same piece gets it instantly.',
      },
      {
        term: 'Purchases',
        text: 'Handled by Apple. RevenueCat confirms your Plus with an anonymous ID, for as long as you subscribe. We never see your name or card.',
      },
      {
        term: 'Crash reports',
        text: 'When the app crashes, Sentry gets the error, the app version and the phone model. Nothing personal. Stored in the US and deleted after 30 days.',
      },
      {
        term: 'Piano sound',
        text: 'Downloaded once, the first time you tap Listen. Like any download, our file host sees your IP address. We don’t keep it.',
      },
    ],
    note: 'These services use the data only for the job above and protect it as carefully as we do. Some are based in the United States.',
  },

  rights: {
    title: 'Your rights',
    text: 'Delete the app and everything it stored goes with it. You can also ask us what we hold, or to delete it: write to us and name the pieces you imported, since we don’t know who you are. If you’re not happy with our answer, you can complain to your local data protection authority.',
  },

  smallPrint: {
    /** Visually hidden heading so the three columns sit under their own h2. */
    title: 'The small print',
    items: [
      {
        title: 'Children',
        text: 'We never ask for a name, age or email, and don’t knowingly collect personal information from children.',
      },
      {
        title: 'Who we are',
        text: 'Faruk Kandemir, an independent developer in the United States.',
        email: site.supportEmail,
      },
      {
        title: 'Changes',
        text: 'If anything here changes, we update this page and the date at the top.',
      },
    ],
  },
} as const;
