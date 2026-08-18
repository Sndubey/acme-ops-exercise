import { app } from "./app";
import { apiPort } from "./lib/env";

const port = apiPort();

app.listen(port, () => {
  console.log(`api listening on http://localhost:${port}`);
});
