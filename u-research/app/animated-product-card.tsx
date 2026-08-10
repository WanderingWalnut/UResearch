"use client";

import {
  motion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { motionTokens } from "@/lib/motion";

type ProductPreviewMotion = {
  order: number;
};

type AnimatedProductCardProps = Omit<
  HTMLMotionProps<"article">,
  "custom" | "initial" | "variants" | "viewport" | "whileInView"
> & {
  order: number;
};

const productPreviewVariants: Variants = {
  hidden: {
    opacity: 0,
    transform: "translateY(8px)",
  },
  visible: ({ order }: ProductPreviewMotion) => ({
    opacity: 1,
    transform: "translateY(0)",
    transition: {
      delay: order * motionTokens.stagger.productPreview,
      duration: motionTokens.duration.fast,
      ease: motionTokens.ease.out,
    },
  }),
};

export function AnimatedProductCard({
  order,
  children,
  ...props
}: AnimatedProductCardProps) {
  return (
    <motion.article
      {...props}
      custom={{ order }}
      initial="hidden"
      variants={productPreviewVariants}
      viewport={{ once: true, margin: "-100px" }}
      whileInView="visible"
    >
      {children}
    </motion.article>
  );
}
