import { createApp } from "./app.js";

const port = Number(process.env.PORT ?? 3333);

createApp().listen(port, () => {
  console.log(`QQS backend listening on port ${port}`);
});
