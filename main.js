const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const { exec } = require("child_process");

let mainWindow;

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    mainWindow.loadFile("index.html"); // Load your frontend
});

// Handle file selection from renderer process
ipcMain.on("select-file", async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ["openFile"], // Allow selecting only one file
    });

    if (!result.canceled && result.filePaths.length > 0) {
        event.reply("file-selected", result.filePaths[0]);
    }
});

// Handle rsync transfer from GUI
ipcMain.on("sync-file", (event, { filePath, password }) => {
    const DESTINATION = "joniyed@192.168.10.68:/home/joniyed/Downloads/"; // Remote PC
    const rsyncCommand = `sshpass -p '${password}' rsync -avz '${filePath}' ${DESTINATION}`;

    exec(rsyncCommand, (error, stdout, stderr) => {
        if (error) {
            event.reply("sync-status", { success: false, message: error.message });
            return;
        }
        if (stderr) {
            console.error("Rsync Stderr:", stderr);
        }
        console.log("Rsync Output:", stdout);
        event.reply("sync-status", { success: true, message: "File synced successfully!" });
    });
});