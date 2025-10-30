import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

import "dotenv/config";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  // Augmenter les limites
  limiter: Ratelimit.slidingWindow(1000000, "60 s"),
  analytics: true,
  prefix: "medremind-api",
});

export default ratelimit;