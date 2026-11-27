import { images } from "@/data/images";
import type { SiteImage } from "@/data/images";

/**
 * The project library. Every entry gets its own page, so a project is added
 * once here and appears in the menus, the project archive and its case study.
 */
export type Project = {
  slug: string;
  name: string;
  /** Must match one of the project categories in `navigation.ts`. */
  type: string;
  location: string;
  year: string;
  /** One line for cards and menus. */
  summary: string;
  /** The lede on the project's own page. */
  description: string;
  image: SiteImage;
};

export const projects: Project[] = [
  {
    slug: "lekki-residence",
    name: "Lekki Residence",
    type: "Homes",
    location: "Lekki Phase 1, Lagos",
    year: "2024",
    summary: "Burnt velvet, bronze and low evening light.",
    description:
      "A family home built around a long, low sectional in burnt orange — panelled charcoal walls, a single bronze canvas and a ring of warm light holding the whole room together.",
    image: images.heroLounge,
  },
  {
    slug: "ikoyi-courtyard-house",
    name: "Ikoyi Courtyard House",
    type: "Homes",
    location: "Ikoyi, Lagos",
    year: "2023",
    summary: "Pale oak, limewash and afternoon sun.",
    description:
      "A courtyard house replanned around daylight: limewash walls, a low linen sofa and joinery drawn to the millimetre so the rooms stay calm as the family grows.",
    image: images.projectIvoryLiving,
  },
  {
    slug: "bourdillon-penthouse",
    name: "Bourdillon Penthouse",
    type: "Apartments",
    location: "Bourdillon Road, Ikoyi",
    year: "2025",
    summary: "An evening apartment in espresso and bouclé.",
    description:
      "A penthouse turned inward for the evenings — espresso walls, a curved bouclé sofa and layers of dimmable light that make the Lagos skyline a quiet backdrop.",
    image: images.projectLounge,
  },
  {
    slug: "eko-atlantic-apartment",
    name: "Eko Atlantic Apartment",
    type: "Apartments",
    location: "Eko Atlantic, Lagos",
    year: "2024",
    summary: "Oatmeal linen and a wall of soft light.",
    description:
      "A two-bedroom apartment for a young family: rumpled linen, oak and a limewash wall that holds the light from the sea-facing windows all afternoon.",
    image: images.projectBedroom,
  },
  {
    slug: "adeola-odeku-studio",
    name: "Adeola Odeku Studio",
    type: "Offices",
    location: "Victoria Island, Lagos",
    year: "2023",
    summary: "A workplace that reads like a good home.",
    description:
      "A workspace for a Lagos design agency, planned around focus and hospitality — material samples, soft acoustics and a long table that doubles as a lunch room.",
    image: images.projectStudio,
  },
  {
    slug: "olosa-street-kitchen",
    name: "Olosa Street Kitchen",
    type: "Restaurants and Cafés",
    location: "Victoria Island, Lagos",
    year: "2025",
    summary: "Travertine, oak and morning sun.",
    description:
      "A twenty-four seat restaurant with a monolithic travertine counter, warm oak and lighting that flatters both the food and the guests at 8am and 8pm.",
    image: images.projectKitchen,
  },
  {
    slug: "the-ikoyi-house",
    name: "The Ikoyi House",
    type: "Hotels",
    location: "Ikoyi, Lagos",
    year: "2024",
    summary: "Twelve suites with a strong sense of place.",
    description:
      "A boutique stay of twelve suites: stone bathrooms, aged brass and linen, designed to feel like the guest is staying in a well-kept Lagos home.",
    image: images.projectBathroom,
  },
  {
    slug: "admiralty-way-store",
    name: "Admiralty Way Store",
    type: "Retail",
    location: "Lekki Phase 1, Lagos",
    year: "2022",
    summary: "A showroom that lets the product speak.",
    description:
      "A concept store laid out as a sequence of small rooms, with bespoke fixtures and lighting tuned so the product is the loudest thing in the space.",
    image: images.projectStudio,
  },
];

export const featuredProjects = projects.slice(0, 3);

export const projectByName = new Map(projects.map((project) => [project.name, project]));
