import "dotenv/config";

import { createApp } from "./app.js";
import { loadServerConfig } from "./config.js";
import { openDatabase } from "./shared/db/database.js";
import { seedDevelopmentData } from "./shared/db/seed.js";

const config = loadServerConfig(process.env);
const { db } = await openDatabase({ url: config.databaseUrl, dataDir: config.pgliteDataDir });
if (config.seedDevelopmentData) {
  await seedDevelopmentData(db);
}

createApp({ db, jwtSecret: config.jwtSecret }).listen(config.port, config.host, () => {
  console.log(`QQS backend listening on http://${config.host}:${config.port}`);
});
