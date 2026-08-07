// SPDX-License-Identifier: AGPL-3.0-only

const EXTERNAL_URL_RE = /^https?:\/\//;

export function ReadMore({ href = "#" }: { href?: string }) {
  const isExternal = EXTERNAL_URL_RE.test(href);
  return (
    <a
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (href === "#") e.preventDefault();
      }}
      className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
    >
      Read more
    </a>
  );
}
