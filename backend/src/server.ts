import "dotenv/config";

import { createApp } from "./presentation/app.js";
import { loadServerConfig } from "./config.js";
import { openDatabase } from "./infrastructure/db/database.js";
import { seedDevelopmentData } from "./infrastructure/db/seed.js";
import { createLogger } from "./infrastructure/logging/logger.js";

const config = loadServerConfig(process.env);
const { db } = await openDatabase({ url: config.databaseUrl, dataDir: config.pgliteDataDir });
if (config.seedDevelopmentData) {
  await seedDevelopmentData(db);
}

const logger = createLogger();
createApp({ db, jwtSecret: config.jwtSecret, logger }).listen(config.port, config.host, () => {
  // 0.0.0.0 é endereço de escuta; o navegador não abre esse endereço.
  const host = config.host === "0.0.0.0" ? "localhost" : config.host;
  logger.info(`QQS backend listening on ${config.host}:${config.port} · docs em http://${host}:${config.port}/docs/`);
});
