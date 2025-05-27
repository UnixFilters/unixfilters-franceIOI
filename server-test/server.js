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
  // check if the command run is authorized?
  const { command } = req.body;

  if (!command || typeof command !== "string") {
    return res.status(400).json({ error: "Missing or invalid command" });
  }
  // split command by pipe
  const parts = command.split("|").map((s) => s.trim());

  // pre load files needed
  const files = {
    "fruits.txt": `pêche\npomme\npoire\nabricot\nbanane\nfraise\nkiwi\n`,
    "wages.txt": `alice 7200
bob 4800
claire 9100
daniel 3150
eve 6700
frank 10000
george 9999
hannah 5500
irene 4300
jack 7800`,
    "lengths.txt": `20 cubane.pdb
12 ethane.pdb
9 methane.pdb
30 octane.pdb
21 pentane.pdb
15 propane.pdb
107 total`,
    "animals.csv": `2012-11-05,deer,5
2012-11-05,rabbit,22
2012-11-05,raccoon,7
2012-11-06,rabbit,19
2012-11-06,deer,2
2012-11-06,fox,4
2012-11-07,rabbit,16
2012-11-07,bear,1`,
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
      // one env per command sent
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
    console.log("STEPS: ", steps);
  } catch (err) {
    res.status(500).json({ error: "Docker execution failed" });
    return;
  } finally {
    // delete session when it's done
    fs.rmSync(sessionPath, { recursive: true, force: true });
  }
  res.json({ steps });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
