const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const path = require('path');
const electron = require('electron');
const { app, ipcMain } = electron;
const AppTray = require('./app/AppTray');
const MainWindow = require('./app/MainWindow');

const mainConfig = {
    height:720,
    width:1080, 
    frame: true, 
    resizable: true, 
    show: true, //doin't show on start
    webPreferences: { backgroundThrottling: false },  //dont allow chromium to send with full cpu
    icon: path.join(__dirname, 'assets/icons/png/pigeon.png'),
    title: "Pigeon-OCM"
}

let minerConfig = {
    algo:"x16s",
    url:"stratum+tcp://pool.pigeoncoin.org:3663",
    user: null, //PDiZ89gk5HMqwrcGp6Hs9WdgFALzLbD4HG
    pass:"x",
    donate:"7.0"
}

let mainWindow;
let tray;

app.on('ready', () => {
    //app.dock.hide(); //hide the dock idon
    //frame removes the window border and title bar
    //resizable
    mainWindow =  new MainWindow(mainConfig, path.join(__dirname, '/src/index.html'));

    //get icon, create tray icon
    const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png';
    const iconPath = path.join(__dirname, `/src/assets/${iconName}`);
    tray = new AppTray(iconPath, mainWindow);
});

let sender = null;

ipcMain.on('start-mining', (event, run) => {
    console.log('received start-mining message');

    //validate miner address?

    sender = event.sender;
    if(run){
        startMinerInstance();
    }
});

ipcMain.on('update-miner-address', (event, address) => {
    minerConfig.user = address;
    console.log('received new miner address: ' + address);
    console.log('new miner config: ' + convertToMinerArgs(minerConfig));
});

function asciiToString(data){
    return String.fromCharCode.apply(null, data);
};

function convertToMinerArgs(config) {
    let args = Object.keys(config).map((key) => {
        return `--${key}=${config[key]}`;
    });
    console.log("args: " + args);
    return args;
}

function startMinerInstance () {
    console.log("Attempting to start miner...")
    //get the proper OS miner exe
    let exe = null;
    switch(process.platform) {
        case 'darwin':
            
            break;
        case 'linux':
            exe = "pigeonminer";        
            break;
        case 'win32':
            exe = "pigeonminer.exe"
            break;
    }
     /*
    let args = [
        '--algo=x16s',
        '--url=stratum+tcp://pool.pigeoncoin.org:3663', 
        '--user=PMvTkNxxJqyXb83uiDsMtEm4UGRgbn4z5e',
        '--pass=x',
        '--donate=7.0'
    ];
    */
    let args = convertToMinerArgs(minerConfig);
    const { spawn } = require('child_process');
    daemon = spawn(__dirname+`/${exe}`, args);

    //listen for data fromt eh miner
    daemon.stdout.on('data', (data) => {
        console.log(`Received new miner data: ${data}`);
        //if we still have an active sender, send it a reply
        if(sender) {
            //convert data from ascii to text
            sender.send('update-miner-output', asciiToString(data));
        }
    });

    daemon.stderr.on('data', (err) => {
        console.log(`Received miner error: ${err}`);
    });

    daemon.on('close', (code) => {
        console.log(`Miner closed with code: ${code}`);
    });
/*
    daemon = execFile(__dirname+`/${exe}`,
     args, (err, stdout, stderr) => {
        if(err) { 
            console.log("Error of errory nature: " + err)
            console.log("ERROR STARTING OR RUNNING MINER: " + stderr)
        }
        console.log(`Data: ${stdout}`);
        ipcRenderer.send("update-miner-output", stdout);
    });
    */
}