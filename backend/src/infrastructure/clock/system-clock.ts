import type { Clock } from "../../application/common/clock.js";

export const systemClock: Clock = { now: () => new Date() };
