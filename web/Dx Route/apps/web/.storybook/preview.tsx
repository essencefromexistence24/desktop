import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/, date: /Date$/ } },
  },
};

export default preview;
