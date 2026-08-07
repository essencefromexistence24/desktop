// SPDX-License-Identifier: AGPL-3.0-only

import type { ReactNode } from "react";

export function HubTopBar({ children }: { children: ReactNode }) {
  return (
    <div className="hub-canvas shrink-0">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-5 pb-3 pt-6 sm:px-8">
        {children}
      </div>
    </div>
  );
}
