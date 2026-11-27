import { projectTypes } from "@/data/navigation";
import { projects } from "@/data/projects";
import type { Project } from "@/data/projects";
import { site } from "@/data/site";

export type RouteMeta = {
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  /** A quiet line of context under the description. */
  note: string;
  /** Two onward links, so placeholder pages are never dead ends. */
  onward: { label: string; href: string }[];
  /** Set on project pages so the case study can show its photograph. */
  project?: Project;
};

export const routeMeta: RouteMeta[] = [
  {
    href: "/services",
    title: "Services",
    eyebrow: "What we do",
    description:
      "From a single room to a full home, we shape interiors around the life happening inside them — with the drawings, joinery and lighting detail to make it last.",
    note: `Full-service design, renovation and turnkey delivery across ${site.city}.`,
    onward: [
      { label: "Full home design", href: "/services/full-home-design" },
      { label: "See our projects", href: "/projects" },
    ],
  },
  {
    href: "/services/full-home-design",
    title: "Full Home Design",
    eyebrow: "Service",
    description:
      "A complete interior for your home: spatial planning, material palette, joinery, lighting and furnishing, delivered as one continuous thought.",
    note: "Typically 6–12 months, from concept to final styling.",
    onward: [
      { label: "Renovation & space planning", href: "/services/renovation-and-space-planning" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/kitchens-and-bathrooms",
    title: "Kitchens & Bathrooms",
    eyebrow: "Service",
    description:
      "The hardest-working rooms in the house, treated with the most care — stone, timber, brass and light resolved down to the millimetre.",
    note: "Bespoke joinery, stone detailing and specification.",
    onward: [
      { label: "Bespoke furniture & joinery", href: "/services/bespoke-furniture-and-joinery" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/living-and-bedroom-design",
    title: "Living & Bedroom Design",
    eyebrow: "Service",
    description:
      "Rooms for gathering and rooms for rest, layered with texture, considered lighting and furniture that earns its place.",
    note: "Room-by-room design and furnishing.",
    onward: [
      { label: "Art & styling", href: "/services/art-and-styling" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/renovation-and-space-planning",
    title: "Renovation & Space Planning",
    eyebrow: "Service",
    description:
      "Rethinking how a space works before deciding how it looks — circulation, light, storage and structure resolved into a clear plan.",
    note: "Drawings, planning and coordination with your contractor.",
    onward: [
      { label: "Turnkey project management", href: "/services/turnkey-project-management" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/office-and-workspace-design",
    title: "Office & Workspace Design",
    eyebrow: "Service",
    description:
      "Workplaces that feel like somewhere worth being: acoustics, light, focus and hospitality, held in the same quiet register as a good home.",
    note: "Studios, offices and creative workspaces.",
    onward: [
      { label: "Retail & showroom design", href: "/services/retail-and-showroom-design" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/retail-and-showroom-design",
    title: "Retail & Showroom Design",
    eyebrow: "Service",
    description:
      "Spaces that guide a customer gently and make the product the loudest thing in the room — material, light and circulation in service of the brand.",
    note: "Concept, fixture design and rollout documentation.",
    onward: [
      { label: "Restaurants & cafés", href: "/services/restaurants-and-cafes" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/restaurants-and-cafes",
    title: "Restaurants & Cafés",
    eyebrow: "Service",
    description:
      "Hospitality interiors built around atmosphere, acoustics and the choreography of service — designed to look better at year three than on opening night.",
    note: "Front of house, bar design and lighting.",
    onward: [
      { label: "Hotels & boutique stays", href: "/services/hotels-and-boutique-stays" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/hotels-and-boutique-stays",
    title: "Hotels & Boutique Stays",
    eyebrow: "Service",
    description:
      "Guest rooms, suites and public spaces with a strong sense of place — calm, tactile and quietly memorable.",
    note: "Room prototypes, FF&E and lighting strategy.",
    onward: [
      { label: "Lighting design", href: "/services/lighting-design" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/bespoke-furniture-and-joinery",
    title: "Bespoke Furniture & Joinery",
    eyebrow: "Service",
    description:
      "Pieces drawn for a specific wall, a specific hand, a specific room — made by joiners and makers we have worked with for years.",
    note: "Design, prototyping and installation.",
    onward: [
      { label: "Kitchens & bathrooms", href: "/services/kitchens-and-bathrooms" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/lighting-design",
    title: "Lighting Design",
    eyebrow: "Service",
    description:
      "Layered light for the hours you actually live in them — warm, dimmable, and designed to make texture do the talking.",
    note: "Lighting plans, fixtures and controls.",
    onward: [
      { label: "Art & styling", href: "/services/art-and-styling" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/art-and-styling",
    title: "Art & Styling",
    eyebrow: "Service",
    description:
      "The final five per cent that changes everything: art, objects, textiles and the quiet discipline of leaving space empty.",
    note: "Sourcing, commissioning and hand-styling.",
    onward: [
      { label: "Full home design", href: "/services/full-home-design" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/services/turnkey-project-management",
    title: "Turnkey Project Management",
    eyebrow: "Service",
    description:
      "One point of contact from demolition to the last cushion — programme, budget, trades and quality, held together so you don't have to hold it.",
    note: "Available with any design engagement.",
    onward: [
      { label: "Renovation & space planning", href: "/services/renovation-and-space-planning" },
      { label: "All services", href: "/services" },
    ],
  },
  {
    href: "/projects",
    title: "Projects",
    eyebrow: "Selected work",
    description:
      "Homes, hospitality and workplaces from the last few years — each one photographed in the light it was designed for.",
    note: "Eight recent projects across Lagos, from Lekki to Eko Atlantic.",
    onward: [
      { label: "Services", href: "/services" },
      { label: "The studio", href: "/studio/about" },
    ],
  },
  ...projectTypes.map((type) => {
    const matching = projects.filter((project) => project.type === type.label);
    return {
      href: type.href,
      title: type.label,
      eyebrow: "Projects by type",
      description: matching.length
        ? `${matching.map((project) => project.name).join(", ")}. Each one designed, drawn and delivered by the studio from first conversation to final styling.`
        : "This collection is being prepared. In the meantime, explore the wider project archive or learn more about our services.",
      note: matching.length
        ? `${matching.length} ${matching.length === 1 ? "project" : "projects"} in Lagos.`
        : "Project collection coming soon.",
      onward: [
        { label: "All projects", href: "/projects" },
        { label: "Our services", href: "/services" },
      ],
      project: matching[0] as Project | undefined,
    };
  }),
  ...projects.map((project) => ({
    href: `/projects/${project.slug}`,
    title: project.name,
    eyebrow: `${project.type} · ${project.year}`,
    description: project.description,
    note: `${project.location}.`,
    onward: [
      { label: "All projects", href: "/projects" },
      { label: "Our process", href: "/studio/process" },
    ],
    project,
  })),
  {
    href: "/studio/about",
    title: "About the Studio",
    eyebrow: "Studio",
    description:
      `A small team of designers and makers working from ${site.city}, with a belief that the best interiors are the calmest ones.`,
    note: `Founded in ${site.founded}.`,
    onward: [
      { label: "Our process", href: "/studio/process" },
      { label: "The team", href: "/studio/team" },
    ],
  },
  {
    href: "/studio/process",
    title: "Process",
    eyebrow: "Studio",
    description:
      "Four unhurried stages — listen, plan, make, finish — with clear decisions at each one and no surprises in between.",
    note: "Written up in full shortly.",
    onward: [
      { label: "About the studio", href: "/studio/about" },
      { label: "Start a project", href: "/contact" },
    ],
  },
  {
    href: "/studio/team",
    title: "Team",
    eyebrow: "Studio",
    description:
      "Designers, technical drawers and a small production team, all in one room, all on the same drawing.",
    note: "Profiles coming soon.",
    onward: [
      { label: "Careers", href: "/studio/careers" },
      { label: "About the studio", href: "/studio/about" },
    ],
  },
  {
    href: "/studio/press-and-awards",
    title: "Press & Awards",
    eyebrow: "Studio",
    description:
      "A record of the publications, listings and awards that have followed the work, kept here as a reference.",
    note: "Archive in preparation.",
    onward: [
      { label: "Projects", href: "/projects" },
      { label: "Press enquiries", href: "/contact" },
    ],
  },
  {
    href: "/studio/careers",
    title: "Careers",
    eyebrow: "Studio",
    description:
      "We hire slowly and keep people for a long time. If you draw beautifully and care about how things are made, we would like to meet you.",
    note: "No open roles listed at present — speculative applications welcome.",
    onward: [
      { label: "The team", href: "/studio/team" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    href: "/journal",
    title: "Journal",
    eyebrow: "Notes",
    description:
      "Occasional writing on materials, light and the slow business of making rooms that age well.",
    note: "First entries coming soon.",
    onward: [
      { label: "Projects", href: "/projects" },
      { label: "The studio", href: "/studio/about" },
    ],
  },
  {
    href: "/contact",
    title: "Contact",
    eyebrow: "Start a project",
    description:
      "Tell us where you are, what you're working with, and what you would like the space to feel like. We reply to every enquiry within two working days.",
    note: `${site.hours}.`,
    onward: [
      { label: "Our process", href: "/studio/process" },
      { label: "Services", href: "/services" },
    ],
  },
];

export const routeMetaByHref = new Map(routeMeta.map((route) => [route.href, route]));
