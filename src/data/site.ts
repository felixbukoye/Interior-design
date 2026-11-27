/**
 * The studio's identity, contact details and editorial content.
 * Edit this file to change any detail shown across the site.
 */
export const site = {
  name: "Eden Interiors",
  descriptor: "Interior Architecture & Design",
  city: "Lagos",
  country: "Nigeria",
  founded: "2014",
  tagline: "Quiet, considered interiors for the way you actually live.",
  description:
    "Eden Interiors is an interior design studio in Lagos creating calm, enduring homes, hospitality spaces and workplaces.",
  phone: "+234 812 470 6612",
  phoneHref: "tel:+2348124706612",
  email: "hello@edeninteriors.com",
  emailHref: "mailto:hello@edeninteriors.com",
  address: {
    line1: "24 Cooper Road, Ikoyi",
    line2: "Lagos 101233",
    line3: "Nigeria",
  },
  hours: "Studio visits by appointment, Monday to Friday",
  /**
   * Home introduction figures. Placeholder values — replace with the studio's
   * real numbers. Counting is driven by `value`, so a non-numeric placeholder
   * would render without the count-up animation.
   */
  stats: [
    { value: 120, label: "projects completed" },
    { value: 12, label: "years of experience" },
  ],
  social: {
    instagram: "https://www.instagram.com/edeninteriors",
    pinterest: "https://www.pinterest.com/edeninteriors",
  },
  seo: {
    titleTemplate: "%s — Eden Interiors",
    defaultTitle: "Eden Interiors — Interior Architecture & Design, Lagos",
  },
} as const;

export type Site = typeof site;
export const wordmark = site.name;
