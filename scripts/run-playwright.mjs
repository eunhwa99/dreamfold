import { mkdtemp, rm } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Failed to resolve a free port for Playwright")));
        return;
      }

      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForExit(processHandle) {
  return new Promise((resolve) => {
    if (processHandle.exitCode !== null) {
      resolve();
      return;
    }

    processHandle.once("exit", () => resolve());
  });
}

async function waitForServer(url, serverProcess, timeoutMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (serverProcess.exitCode !== null) {
      throw new Error(`DreamFold dev server exited early with code ${serverProcess.exitCode}`);
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      await sleep(250);
      continue;
    }

    await sleep(250);
  }

  throw new Error(`Timed out waiting for DreamFold dev server at ${url}`);
}

async function main() {
  const port = await getFreePort();
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "dreamfold-e2e-"));
  const baseUrl = `http://localhost:${port}`;
  const nextCommand =
    process.platform === "win32" ? path.join("node_modules", ".bin", "next.cmd") : path.join("node_modules", ".bin", "next");
  const serverProcess = spawn(nextCommand, ["dev", "--port", String(port)], {
    stdio: "inherit",
    env: {
      ...process.env,
      DREAMFOLD_DATA_DIR: dataDir
    }
  });

  try {
  await waitForServer(baseUrl, serverProcess);

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["playwright", "test", ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: baseUrl
      }
    }
  );

    const exitCode = await new Promise((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", (code, signal) => {
        if (signal) {
          resolve(1);
          return;
        }
        resolve(code ?? 0);
      });
    });

    return exitCode;
  } finally {
    serverProcess.kill("SIGTERM");
    await waitForExit(serverProcess);
    await rm(dataDir, { recursive: true, force: true });
  }
}

process.exitCode = await main();
