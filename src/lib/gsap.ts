"use client";

/**
 * GSAP is registered exactly once, here. Import `gsap`, the plugins and the
 * custom eases from this module everywhere else so no component has to think
 * about registration order.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";
import { Draggable } from "gsap/Draggable";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip, Draggable, DrawSVGPlugin, CustomEase);

/** A restrained in-out for spatial moves. */
CustomEase.create("luxe", "0.65, 0, 0.35, 1");
/** An exponential settle for reveals. */
CustomEase.create("soft", "0.16, 1, 0.3, 1");

gsap.defaults({ ease: "soft", duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });


export { gsap, useGSAP, ScrollTrigger, SplitText, Flip, Draggable, DrawSVGPlugin, CustomEase };
