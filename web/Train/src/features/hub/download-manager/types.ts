// SPDX-License-Identifier: AGPL-3.0-only

import type { TransportMode } from "./constants";

export interface TransportConflictInfo {
  previous: TransportMode;
  next: TransportMode;
  resumable: boolean;
}
