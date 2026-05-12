const { app, BrowserWindow, dialog } = require("electron");
const { spawn } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const WEB_PORT = 3000;
const API_PORT = 4000;
const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;

let webProcess = null;
let apiProcess = null;
let mainWindow = null;

function isReadyUrl(url) {
  return fetch(url, { method: "GET" })
    .then((response) => response.ok)
    .catch(() => false);
}

async function waitFor(url, timeoutMs = 45000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (await isReadyUrl(url)) return true;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

function spawnNodeProcess(entryFile, extraEnv = {}) {
  const command = process.execPath;
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    ...extraEnv
  };

  return spawn(command, [entryFile], {
    env,
    stdio: "inherit",
    windowsHide: true
  });
}

function spawnNodeCommand(args, extraEnv = {}) {
  const command = process.execPath;
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    ...extraEnv
  };

  return spawn(command, args, {
    env,
    stdio: "inherit",
    windowsHide: true
  });
}

function startApi() {
  if (apiProcess) return apiProcess;

  if (app.isPackaged) {
    const entry = path.join(app.getAppPath(), "apps", "server", "dist", "src", "index.js");
    if (!fs.existsSync(entry)) {
      throw new Error(`Server build not found at ${entry}`);
    }

    apiProcess = spawnNodeProcess(entry, {
      PORT: String(API_PORT),
      WEB_ORIGIN: WEB_URL,
      NEXT_PUBLIC_API_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_SOCKET_URL: `http://127.0.0.1:${API_PORT}`
    });
    return apiProcess;
  }

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  apiProcess = spawn(npmCommand, ["run", "dev", "--workspace", "@yowl/server"], {
    env: {
      ...process.env,
      PORT: String(API_PORT),
      WEB_ORIGIN: WEB_URL
    },
    stdio: "inherit",
    shell: true,
    windowsHide: true
  });
  return apiProcess;
}

function startWeb() {
  if (webProcess) return webProcess;

  if (app.isPackaged) {
    const nextCli = require.resolve("next/dist/bin/next");
    webProcess = spawnNodeCommand([nextCli, "start", "-p", String(WEB_PORT)], {
      NODE_ENV: "production",
      PORT: String(WEB_PORT),
      HOSTNAME: "127.0.0.1",
      NEXT_PUBLIC_API_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_SOCKET_URL: `http://127.0.0.1:${API_PORT}`
    });
    return webProcess;
  }

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  webProcess = spawn(npmCommand, ["run", "dev", "--workspace", "@yowl/web"], {
    env: {
      ...process.env,
      NEXT_PUBLIC_API_URL: `http://127.0.0.1:${API_PORT}`,
      NEXT_PUBLIC_SOCKET_URL: `http://127.0.0.1:${API_PORT}`
    },
    stdio: "inherit",
    shell: true,
    windowsHide: true
  });
  return webProcess;
}

async function createWindow() {
  const ready = await waitFor(WEB_URL);
  if (!ready) {
    await dialog.showErrorBox(
      "YowlChat couldn't start",
      "The desktop shell started, but the web app never became ready."
    );
    app.quit();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 960,
    minWidth: 1180,
    minHeight: 780,
    title: "YowlChat",
    backgroundColor: "#050507",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  await mainWindow.loadURL(WEB_URL);
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function stopChildren() {
  for (const child of [webProcess, apiProcess]) {
    if (child && !child.killed) {
      child.kill();
    }
  }
  webProcess = null;
  apiProcess = null;
}

app.whenReady().then(async () => {
  startApi();
  startWeb();
  await createWindow();
});

app.on("window-all-closed", () => {
  stopChildren();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopChildren();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
