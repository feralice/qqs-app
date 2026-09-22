import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3333);
const host = process.env.HOST ?? "0.0.0.0";

createApp().listen(port, host, () => {
  console.log(`QQS backend listening on http://${host}:${port}`);
});

