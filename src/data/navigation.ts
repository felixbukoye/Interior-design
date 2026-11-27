import { images } from "@/data/images";
import { featuredProjects, projects } from "@/data/projects";

/** One source for the desktop mega menus, mobile accordions and footer. */
export type NavLink = {
  label: string;
  href: string;
};

export type DescribedNavLink = NavLink & {
  description: string;
};

export type MegaMenuName = "services" | "projects" | "studio";

type PrimaryNavLink = NavLink & {
  menu?: MegaMenuName;
};

export const primaryNav: PrimaryNavLink[] = [
  { label: "Services", href: "/services", menu: "services" },
  { label: "Projects", href: "/projects", menu: "projects" },
  { label: "Studio", href: "/studio/about", menu: "studio" },
  { label: "Journal", href: "/journal" },
  { label: "Contact", href: "/contact" },
];

export const serviceGroups: { label: string; links: DescribedNavLink[] }[] = [
  {
    label: "Residential",
    links: [
      { label: "Full-Home Design", href: "/services/full-home-design", description: "One vision, every room." },
      { label: "Kitchens and Bathrooms", href: "/services/kitchens-and-bathrooms", description: "Spaces that work as beautifully as they look." },
      { label: "Living and Bedroom Design", href: "/services/living-and-bedroom-design", description: "Rooms made for rest and gathering." },
      { label: "Renovation and Space Planning", href: "/services/renovation-and-space-planning", description: "Better bones, better flow." },
    ],
  },
  {
    label: "Commercial",
    links: [
      { label: "Office and Workspace Design", href: "/services/office-and-workspace-design", description: "Environments that elevate how teams work." },
      { label: "Retail and Showroom Design", href: "/services/retail-and-showroom-design", description: "Spaces that turn visitors into loyal customers." },
    ],
  },
  {
    label: "Hospitality",
    links: [
      { label: "Restaurants and Cafés", href: "/services/restaurants-and-cafes", description: "Atmosphere worth returning to." },
      { label: "Hotels and Boutique Stays", href: "/services/hotels-and-boutique-stays", description: "Design that guests remember." },
    ],
  },
  {
    label: "Specialist",
    links: [
      { label: "Bespoke Furniture and Joinery", href: "/services/bespoke-furniture-and-joinery", description: "Made for your space, made to last." },
      { label: "Lighting Design", href: "/services/lighting-design", description: "Light as a design material." },
      { label: "Art and Styling", href: "/services/art-and-styling", description: "The finishing layer that makes it yours." },
      { label: "Turnkey Project Management", href: "/services/turnkey-project-management", description: "We design it. We deliver it." },
    ],
  },
];

export const servicesNav: DescribedNavLink[] = serviceGroups.flatMap((group) => group.links);

export const projectTypes: NavLink[] = [
  { label: "Homes", href: "/projects/homes" },
  { label: "Apartments", href: "/projects/apartments" },
  { label: "Offices", href: "/projects/offices" },
  { label: "Restaurants and Cafés", href: "/projects/restaurants-and-cafes" },
  { label: "Hotels", href: "/projects/hotels" },
  { label: "Retail", href: "/projects/retail" },
];

/** The three most recent projects, drawn from the project library. */
export const featuredProjectCards = featuredProjects.map((project) => ({
  label: project.name,
  href: `/projects/${project.slug}`,
  image: project.image,
}));

/** Every project, for the archive page and the wide menus. */
export const projectCards = projects.map((project) => ({
  label: project.name,
  href: `/projects/${project.slug}`,
  image: project.image,
}));

export const featuredCaseStudy = {
  description: "See how we turned a Lekki family home into a warm, low-lit retreat.",
  href: `/projects/${featuredProjects[0].slug}`,
  image: featuredProjects[0].image,
};

export const studioNav: DescribedNavLink[] = [
  { label: "About Us", href: "/studio/about", description: "Who we are and why we design the way we do." },
  { label: "Our Process", href: "/studio/process", description: "From first conversation to final reveal." },
  { label: "Team", href: "/studio/team", description: "The people behind the work." },
  { label: "Press and Awards", href: "/studio/press-and-awards", description: "Recognition we are proud of." },
  { label: "Careers", href: "/studio/careers", description: "Join a studio that sweats the details." },
];
