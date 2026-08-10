import "../styles/theme.css";
import "../styles/dx-shader.css";
import "../styles/globals.css";

type RootLayoutProps = {
  children: any;
};

export const metadata = {
  title: "Shader",
  description: "Create and explore real-time generative WebGL shaders.",
} as const;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link
          rel="preload"
          href="/dx-shader/fonts/jetbrains-mono-latin-400-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
