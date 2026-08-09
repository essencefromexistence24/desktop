import type { Brick } from "./brick";

export interface GameState {
  canvas: any;

  enableGame: boolean;
  enableSounds: boolean;

  score: number;
  bricks: Brick[];
  logoIndex: number;

  soundBounce: any;
  soundBreak: any;
  soundGameOver: any;
  ballImage: any;
  paddleImage: any;
}
