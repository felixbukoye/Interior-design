/**
 * The studio's identity, contact details and editorial placeholders.
 * Replace the bracketed values here when the real details are confirmed.
 */
export const site = {
  name: "Eden Interiors",
  studioNamePlaceholder: "[Studio Name]",
  descriptor: "Interior Architecture & Design",
  city: "[City]",
  country: "[Country]",
  founded: "[Year]",
  projectNames: ["[Project One]", "[Project Two]", "[Project Three]"],
  tagline: "Quiet, considered interiors for the way you actually live.",
  description:
    "Eden Interiors is an interior design studio in [City] creating calm, enduring homes, hospitality spaces and workplaces.",
  phone: "[Phone]",
  phoneHref: "tel:+10000000000",
  email: "hello@edeninteriors.com",
  emailHref: "mailto:hello@edeninteriors.com",
  address: {
    line1: "[Street Address]",
    line2: "[City], [Postcode]",
    line3: "[Country]",
  },
  hours: "Studio visits by appointment, [Days]",
  social: {
    instagram: "[Instagram URL]",
    pinterest: "[Pinterest URL]",
  },
  seo: {
    titleTemplate: "%s — Eden Interiors",
    defaultTitle: "Eden Interiors — Interior Architecture & Design, [City]",
  },
} as const;

export type Site = typeof site;
export const wordmark = site.name;
