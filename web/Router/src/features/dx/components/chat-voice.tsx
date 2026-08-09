"use client";

import { motion } from "framer-motion";

export function VoiceBar({ delay, height }: { delay: string; height: number }) {
  return (
    <motion.div
      className="w-[3px] rounded-full bg-primary"
      style={{ height: `${height}%` }}
      animate={{
        scaleY: [0.4, 1, 0.4],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: parseFloat(delay) * 0.01,
      }}
    />
  );
}
