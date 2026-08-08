self.onmessage = () => {
  self.postMessage({ ready: true });
};
