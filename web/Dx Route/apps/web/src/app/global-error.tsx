"use client";

export default function GlobalError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Critical error</h2>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  );
}
