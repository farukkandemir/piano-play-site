/**
 * Site-wide settings. `launched` is the one switch for launch day:
 * false shows "Coming soon" text, true shows Apple's App Store badge
 * linking to `appStoreUrl` and adds the smart app banner meta.
 */
export const site = {
  name: 'piano.play',
  domain: 'getpianoplay.com',
  url: 'https://getpianoplay.com',
  description:
    'piano.play is an iPhone app for practising the piano. Connect your piano, open any piece, and practise at your own pace.',
  supportEmail: 'support@getpianoplay.com',
  launched: false,
  appStoreUrl: '',
  appStoreId: '',
  comingSoon: 'Coming soon to the App Store',
  footerLine: 'piano.play · made for iPhone',
  credits: {
    text: 'Piano sound: Salamander Grand Piano by Alexander Holm, CC BY 3.0',
    href: 'https://creativecommons.org/licenses/by/3.0/',
  },
  footerLinks: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Support', href: '/support' },
  ],
} as const;
