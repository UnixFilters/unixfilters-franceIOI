import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());

const TEMP_BASE = path.join(__dirname, "temp");
if (!fs.existsSync(TEMP_BASE)) fs.mkdirSync(TEMP_BASE);

app.post("/run", async (req, res) => {
  console.log("route post");
  const { command } = req.body;

  if (!command || typeof command !== "string") {
    return res.status(400).json({ error: "Missing or invalid command" });
  }
  // split command by pipe
  const parts = command.split("|").map((s) => s.trim());

  // pre load files needed
  const files = {
    "fruits.txt": `pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n`,
  };

  const sessionId = uuidv4();
  const sessionPath = path.join(TEMP_BASE, sessionId);
  fs.mkdirSync(sessionPath);

  for (const [filename, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(sessionPath, filename), content);
  }
  const steps = [];

  try {
    for (let i = 0; i < parts.length; i++) {
      const cmd = parts.slice(0, i + 1).join(" | ");
      console.log(`step ${i} running ${cmd}`);
      const dockerCommand = `docker run --rm -v ${sessionPath}:/data unix-tools sh -c "cd /data && ${cmd}"`;

      const result = await new Promise((resolve, reject) => {
        exec(dockerCommand, { timeout: 2000 }, (err, stdout, stderr) => {
          resolve({
            return: err ? err.code : 0,
            stderr,
            output: stdout.trim(),
          });
        });
      });

      steps.push({
        number: i,
        command_string: cmd,
        output: result.output,
        stderr: result.stderr,
        return: result.return,
      });
    }
    console.log("STEPs", steps);
  } catch (err) {
    res.status(500).json({ error: "Docker execution failed" });
    return;
  } finally {
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }
  res.json({ steps });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
