"use client";

/**
 * Core motion plugins are registered exactly once here. The heavier Flip and
 * Draggable plugins live in gsap-advanced so pages that do not use them do
 * not pay their download and startup cost.
 */
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase);

/** A restrained in-out for spatial moves. */
CustomEase.create("luxe", "0.65, 0, 0.35, 1");
/** An exponential settle for reveals. */
CustomEase.create("soft", "0.16, 1, 0.3, 1");

gsap.defaults({ ease: "soft", duration: 1 });
ScrollTrigger.config({ ignoreMobileResize: true });


export { gsap, useGSAP, ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase };
