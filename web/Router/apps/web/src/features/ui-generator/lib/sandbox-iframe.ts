export function createSandboxIframe(html: string): string {
  return `<iframe sandbox="allow-scripts" srcdoc="${encodeURIComponent(html)}" />`;
}
