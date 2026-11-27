"use client";

/**
 * The heavier interaction plugins are registered once when a component
 * actually needs them, rather than adding them to every page's first load.
 */
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { gsap } from "./gsap";

gsap.registerPlugin(Draggable, Flip);

export { Draggable, Flip };
