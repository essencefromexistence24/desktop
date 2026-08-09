// Inspired by departuremono.com

"use client";

import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
// import p5 from "p5" // moved to dynamic import inside useEffect
import type p5Default from "p5";
import { useEffect, useRef } from "react";

type p5Type = p5Default & {
  [key: string]: unknown;
};

import { cn } from "@/lib/utils";

import { Ball } from "./ball";
import { resetGame } from "./brick";
import { Colors, loadColors } from "./colors";
import {
  BALL_DARK_URL,
  BALL_LIGHT_URL,
  FONT_URL,
  PADDLE_DARK_URL,
  PADDLE_LIGHT_URL,
  SOUND_BOUNCE_URL,
  SOUND_BREAK_URL,
  SOUND_GAME_OVER_URL,
} from "./constants";
import { getLogoIndex } from "./logos";
import { Paddle } from "./paddle";
import type { GameState } from "./types";
import { UI } from "./ui";

export function Daikanoid({
  className,
  defaultLogo,
  ...props
}: Omit<React.ComponentPropsWithRef<"div">, "children"> & {
  defaultLogo?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const p5Ref = useRef<any>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    loadColors();

    const el = containerRef.current!;

    const state: GameState = {
      canvas: null,

      enableGame: false,
      enableSounds: !shouldReduceMotion,

      score: 0,
      bricks: [],
      logoIndex: getLogoIndex(defaultLogo),

      soundBounce: null,
      soundBreak: null,
      soundGameOver: null,

      ballImage: null,
      paddleImage: null,
    };

    let font: any;
    let sketch: p5Type;
    let paddle: Paddle;
    let ball: Ball;
    let ui: UI;

    function game(p: any) {
      sketch = p;

      p.preload = () => {
        try {
          font = p.loadFont(FONT_URL);

          state.soundBounce = p.createAudio(SOUND_BOUNCE_URL);
          state.soundBreak = p.createAudio(SOUND_BREAK_URL);
          state.soundGameOver = p.createAudio(SOUND_GAME_OVER_URL);

          state.ballImage = p.loadImage(resolvedTheme === "dark" ? BALL_DARK_URL : BALL_LIGHT_URL);
          state.paddleImage = p.loadImage(
            resolvedTheme === "dark" ? PADDLE_DARK_URL : PADDLE_LIGHT_URL,
          );
        } catch (err) {
          console.error("p5 preload error:", err);
        }
      };

      p.setup = () => {
        try {
          if (!isMounted) {
            p.remove();
            return;
          }
          state.canvas = p.createCanvas(800, 600, p.P2D);
          state.canvas.parent(el);
          paddle = new Paddle(p, state);
          ball = new Ball(p, state);
          ui = new UI(p, state);

          p.imageMode(p.CENTER);
          p.textFont(font);
          p.background(Colors.background);
          p.fill(Colors.foreground);
          p.noStroke();

          resetGame(p, state);

          state.canvas.mouseClicked(() => {
            state.enableGame = true;
            ball.reset();
            return false;
          });

          state.canvas.touchStarted(() => {
            state.enableGame = true;
            return false;
          });
        } catch (err) {
          console.error("p5 setup error:", err);
        }
      };

      p.draw = () => {
        try {
          if (!isMounted) return;
          p.background(Colors.background);

          if (state.bricks.length === 0) {
            p.fill(Colors.foreground);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(80);
            p.text("404", p.width / 2, p.height / 2 - 11);
            return;
          }

          paddle.show();
          paddle.move();

          ball.show();
          if (state.enableGame) {
            ball.move();
            ball.checkEdges();
            ball.checkPaddle(paddle);
          }

          for (const brick of state.bricks) {
            brick.show();
          }
          p.noStroke();

          ball.checkBricks(state.bricks);
          ui.show();
        } catch (err) {
          console.error("p5 draw error:", err);
          p.noLoop();
        }
      };
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " ") {
        if (state.bricks.length === 0) {
          state.enableGame = false;
          ball.reset();
          resetGame(sketch, state);
          return;
        }

        state.enableGame = true;
        ball.reset();
      }
    };
    window.addEventListener("keypress", handleKeyPress);

    let isMounted = true;
    // Dynamically import p5 to avoid SSR issues
    const initP5 = async () => {
      if (p5Ref.current) return; // already initialized
      try {
        const p5Module = await import("p5");
        if (!isMounted) return;
        const p5Lib = p5Module.default || p5Module;
        p5Ref.current = new p5Lib(game);
      } catch (err) {
        console.error("Failed to initialize p5 sketch:", err);
      }
    };
    initP5();

    // Cleanup function
    return () => {
      isMounted = false;
      window.removeEventListener("keypress", handleKeyPress);
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("h-150 w-200 ring-1 ring-border overflow-hidden", className)}
      {...props}
    />
  );
}
