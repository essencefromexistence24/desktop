/**
 * OmniRoute logo SVG — the route R-mark.
 * Matches the favicon (route.svg) and light/dark logo variants.
 * Inherits color via currentColor so callers can style it (e.g. text-white).
 */
type OmniRouteLogoProps = {
  size?: number;
  className?: string;
};

const ROUTE_MARK_PATH =
  "M355.5 725.5H110V174H522.5C610.313 174 681.5 245.187 681.5 333V485.5L789 725.5H528.5L421 485.5V261.5H355.5V725.5Z";

export default function OmniRouteLogo({ size = 20, className = "" }: OmniRouteLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 900 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="OmniRoute logo"
    >
      <path d={ROUTE_MARK_PATH} fill="currentColor" />
    </svg>
  );
}
