// SPDX-License-Identifier: AGPL-3.0-only

import { AspectRatio as AspectRatioPrimitive } from "radix-ui";

function AspectRatio({
  ...props
}: React.ComponentProps<typeof AspectRatioPrimitive.Root>) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio };
