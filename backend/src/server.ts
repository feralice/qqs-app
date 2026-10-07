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
  logger.info(`QQS backend listening on http://${config.host}:${config.port} (docs em /docs)`);
});
