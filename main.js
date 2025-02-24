/**
 * Created by WebStorm.
 * User: Mehedi Hasan
 * Date: 24 Feb 2025
 * Time: 9:58 AM
 * Email: mdmehedihasanroni28@gmail.com
 */

const { app } = require("electron");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

// Set your sync source and target (Update these paths)
const SOURCE_DIR = "/path/to/source"; // Update with your local folder
const DESTINATION = "user@server:/path/to/destination"; // Update with your remote storage

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
    console.log("Electron Background Service Started...");

    // Run rsync immediately
    syncFiles();

    // Schedule sync every 10 minutes (adjust as needed)
    setInterval(syncFiles, 10 * 60 * 1000);

    // Prevent Electron from creating a window
    app.dock?.hide(); // Hide from macOS dock
    app.quit(); // Quit the app after scheduling (runs in background)
});

// Prevent app from closing
app.on("window-all-closed", (e) => {
    e.preventDefault();
});