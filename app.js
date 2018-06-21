const path = require('path');
const electron = require('electron');
const { app, ipcMain, Menu } = electron;
const AppTray = require('./app/AppTray');
const MainWindow = require('./app/MainWindow');
const Miner = require('./src/miner');
global.appRootDir = path.resolve(__dirname);

const { Device, HashRate, getInfoFromLine, getRateInHash} = require('./src/utils');

const mainConfig = {
    height:640,
    width:720, 
    frame: true, 
    resizable: true, 
    show: true, //doin't show on start
    webPreferences: { backgroundThrottling: false },  //dont allow chromium to send with full cpu
    icon: path.join(__dirname, 'assets/icons/png/pigeon.png'),
    title: "Pigeon-OCM"
}

let minerConfig = {
    algo:"x16s",
    intensity: "18",
    url: "pool.pigeoncoin.org:3663",
    user: null, //PDiZ89gk5HMqwrcGp6Hs9WdgFALzLbD4HG
    pass:"x",
    donate:"7.0"
}; 


let mainWindow;
let tray;
let hashrate = {}
let miner;
let sender = null;

app.on('ready', () => {
    miner = new Miner(minerConfig, sender);
    //app.dock.hide(); //hide the dock idon
    //frame removes the window border and title bar
    //resizable
    mainWindow =  new MainWindow(mainConfig, path.join(__dirname, '/src/index.html'));
    //const mainMenu = Menu.buildFromTemplate(menuTemplate);
    //Menu.setApplicationMenu(mainMenu);

    //get icon, create tray icon
    const iconName = process.platform === 'win32' ? 'windows-icon.png' : 'iconTemplate.png';
    const iconPath = path.join(__dirname, `/src/assets/${iconName}`);
    tray = new AppTray(iconPath, mainWindow);
});

const menuTemplate = [{
}];

ipcMain.on('start-mining', (event, run) => {
    //validate miner address?
    miner.sender = event.sender;
    console.log("Current state: " + run)
    if(run){
        miner.startMinerInstance();
        //miner.startDebugInstance();
    }else {
        miner.stopMinerInstance();
    }
});

ipcMain.on('update-miner-address', (event, address) => {
    miner.minerConfig.user = address;
});

ipcMain.on('update-pool-selection', (event, url) => {
    miner.minerConfig.url = url;
});