/**
 * Created by WebStorm.
 * User: Mehedi Hasan
 * Date: 24 Feb 2025
 * Time: 9:58 AM
 * Email: mdmehedihasanroni28@gmail.com
 */

const { ipcMain } = require("electron");
const { app, BrowserWindow } = require("electron");
const { exec } = require("child_process");
const path = require("path");

// Set your sync source and target (Update these paths)
const SOURCE_DIR = "/path/to/source"; // Update with your local folder
const DESTINATION = "user@server:/path/to/destination"; // Update with your remote storage

let mainWindow;

ipcMain.on("sync-files", (event) => {
    syncFiles();
    event.reply("sync-status", "Sync started successfully!");
});

// Function to create the Home Page window
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // Enable if you need to use Node.js in the frontend
        },
    });

    // Load an HTML file (frontend)
    mainWindow.loadFile("index.html");

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

// Function to run rsync
function syncFiles() {
    const rsyncCommand = `rsync -avz ${SOURCE_DIR} ${DESTINATION}`;

    exec(rsyncCommand, (error, stdout, stderr) => {
        if (error) {
            console.error("Rsync Error:", error.message);
            return;
        }
        if (stderr) {
            console.error("Rsync Stderr:", stderr);
            return;
        }
        console.log("Rsync Output:", stdout);
    });
}

// Run on startup
app.whenReady().then(() => {
    console.log("Electron App Started...");

    // Show Home Page
    createWindow();

    // Run rsync immediately
    syncFiles();

    // Schedule sync every 10 minutes (adjust as needed)
    setInterval(syncFiles, 10 * 60 * 1000);
});

// Prevent app from closing
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});