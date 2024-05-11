// src/index.ts
import express from "express";

const app = express();
const port = 3002;

const RESOLVE_PATH = "/resolve/:sender/:data.json";

app.get(RESOLVE_PATH, (req: express.Request, res: express.Response) => {});

app.post(RESOLVE_PATH, (req: express.Request, res: express.Response) => {});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
