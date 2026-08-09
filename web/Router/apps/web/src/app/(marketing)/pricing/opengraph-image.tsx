import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      DX Platform - Pricing
    </div>,
    size,
  );
}
