const {app, BrowserWindow, dialog, ipcMain} = require("electron");
const {exec} = require("child_process");

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

// Handle rsync push
ipcMain.on("sync-push", (event, {filePath, password}) => {

    const SOURCE = "/home/mehedi/Downloads/Rsync_Data"; // Local PC
    const DESTINATION = "joniyed@192.168.10.68:/home/joniyed/Downloads/Rsync_Data"; // Remote PC
    const rsyncCommand = `sshpass -p '${password}' rsync -avz ${SOURCE}/ ${DESTINATION}/`;

    exec(rsyncCommand, (error, stdout, stderr) => {
        if (error) {
            event.reply("sync-status", {success: false, message: error.message});
            return;
        }
        if (stderr) {
            console.error("Rsync Stderr:", stderr);
        }
        console.log("Rsync Output:", stdout);

        event.reply("sync-status", {success: true, message: ""});

        dialog.showMessageBox({
            type: "info",
            title: "Sync Completed",
            message: "File synced successfully!",
            buttons: ["OK"]
        });

    });
});

// Handle rsync pull
ipcMain.on("sync-pull", (event, {filePath, password}) => {

    const SOURCE = "joniyed@192.168.10.68:/home/joniyed/Downloads/Rsync_Data"; // Remote PC
    const DESTINATION = "/home/mehedi/Downloads/Rsync_Data"; // Local PC
    const rsyncPullCommand = `sshpass -p '${password}' rsync -avz ${SOURCE}/ ${DESTINATION}/`;

    exec(rsyncPullCommand, (error, stdout, stderr) => {
        if (error) {
            event.reply("sync-status", {success: false, message: error.message});
            return;
        }
        if (stderr) {
            console.error("Rsync Stderr:", stderr);
        }
        console.log("Rsync Output:", stdout);

        event.reply("sync-status", {success: true, message: ""});

        dialog.showMessageBox({
            type: "info",
            title: "Sync Completed",
            message: "File synced successfully!",
            buttons: ["OK"]
        });

    });
});

ipcMain.on("sync-both", (event, {password}) => {
    const PC1_FOLDER = "/home/mehedi/Downloads/Rsync_Data"; // Local folder
    const PC2_FOLDER = "joniyed@192.168.10.68:/home/joniyed/Downloads/Rsync_Data"; // Remote folder

    // Step 1: Pull latest files from PC2 → PC1
    const pullCommand = `sshpass -p '${password}' rsync -avz --delete ${PC2_FOLDER}/ ${PC1_FOLDER}/`;

    exec(pullCommand, (error, stdout, stderr) => {
        if (error) {
            event.reply("sync-status", {success: false, message: "Pull failed: " + error.message});
            return;
        }
        console.log("Pull Output:", stdout);

        // Step 2: Push latest files from PC1 → PC2
        const pushCommand = `sshpass -p '${password}' rsync -avz --delete ${PC1_FOLDER}/ ${PC2_FOLDER}/`;

        exec(pushCommand, (error, stdout, stderr) => {
            if (error) {
                event.reply("sync-status", {success: false, message: "Push failed: " + error.message});
                return;
            }
            console.log("Push Output:", stdout);
            event.reply("sync-status", {success: true, message: ""});
            dialog.showMessageBox({
                type: "info",
                title: "Sync Completed",
                message: "File synced successfully!",
                buttons: ["OK"]
            });
        });
    });
});