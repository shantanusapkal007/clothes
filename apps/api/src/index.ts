import { buildApp } from "./app.js";

const port = Number(process.env.PORT || 4000);
const host = "0.0.0.0";

const app = buildApp();

app
  .listen({ port, host })
  .then(() => {
    app.log.info(`API ready on http://${host}:${port}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
