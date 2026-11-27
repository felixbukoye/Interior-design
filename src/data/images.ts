/**
 * Every image on the site lives here, with intrinsic dimensions and alt text,
 * so photography can be swapped in one place without touching components.
 *
 * These are locally stored editorial interior photographs. To use your own:
 * drop a file into `public/images/`, point `src` at it, and update `width`,
 * `height` and `alt`.
 */

export type SiteImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export const images = {
  heroLounge: {
    src: "/images/hero-lounge.jpg",
    width: 2000,
    height: 1143,
    alt: "A dramatic burnt-orange velvet sectional in a deep charcoal lounge, under a glowing ring chandelier, with a bronze abstract canvas above",
  },
  projectIvoryLiving: {
    src: "/images/project-ivory-living.jpg",
    width: 1376,
    height: 768,
    alt: "A calm living room in cream plaster and pale oak, with a low linen sofa and long afternoon light across the floor",
  },
  introDiningRoom: {
    src: "/images/intro-dining-room.jpg",
    width: 928,
    height: 1152,
    alt: "A warm dining room with a raw oak table, linen chairs, a woven rattan pendant and afternoon light across a limewash wall",
  },
  introConsoleBand: {
    src: "/images/intro-console-band.jpg",
    width: 1584,
    height: 672,
    alt: "A slim oak console in a sunlit hallway, holding a ceramic vase and books beneath a framed triangular artwork",
  },
  projectKitchen: {
    src: "/images/project-kitchen.jpg",
    width: 768,
    height: 1376,
    alt: "An oak kitchen with a monolithic travertine island and morning sun raking across the stone",
  },
  projectBedroom: {
    src: "/images/project-bedroom.jpg",
    width: 768,
    height: 1376,
    alt: "A quiet bedroom with rumpled oatmeal linen, a low oak bed and a limewash wall in soft daylight",
  },
  projectBathroom: {
    src: "/images/project-bathroom.jpg",
    width: 768,
    height: 1376,
    alt: "A stone bath in warm beige with aged brass fixtures and a folded linen towel on an oak stool",
  },
  projectStudio: {
    src: "/images/project-studio.jpg",
    width: 1376,
    height: 768,
    alt: "A designer's studio table with stone, timber and fabric samples under tall window light",
  },
  projectLounge: {
    src: "/images/project-lounge.jpg",
    width: 1376,
    height: 768,
    alt: "A boutique lounge at dusk with espresso walls, a curved cream bouclé sofa and a glowing paper lantern",
  },
  detailJoinery: {
    src: "/images/detail-joinery.jpg",
    width: 1024,
    height: 1024,
    alt: "Close detail of bespoke oak joinery with a slim brass finger pull and fine vertical grain",
  },
  detailLighting: {
    src: "/images/detail-lighting.jpg",
    width: 1024,
    height: 1024,
    alt: "A hand-thrown ceramic pendant glowing warmly against a cream limewash wall at dusk",
  },
} as const satisfies Record<string, SiteImage>;

export type ImageKey = keyof typeof images;
