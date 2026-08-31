// Service worker intentionally disabled for the desktop dx preview.
// The preview server serves live on-disk files (Cache-Control: no-store), so a
// stale service-worker cache only causes stale/incorrect rendering. Here we
// unregister any previously-installed service worker and skip registration.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (regs) {
    regs.forEach(function (reg) { reg.unregister(); });
  });
}
