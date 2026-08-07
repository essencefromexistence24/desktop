// SPDX-License-Identifier: AGPL-3.0-only

import { createRoute, redirect } from "@tanstack/react-router";
import { clearAuthTokens } from "@/features/auth";
import { Route as rootRoute } from "./__root";

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    clearAuthTokens();
    throw redirect({ to: "/chat" });
  },
  component: () => null,
});
