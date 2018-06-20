const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const path = require('path');
const { spawn } = require('child_process');
const { Device, DeviceInfo, Share, HashRate, getInfoFromLine } = require('./utils');
const stripAnsi = require('strip-ansi');

module.exports = class Miner {
    constructor(config, sender) {
        this.minerConfig = config;
        this.sender = sender;
        let daemon;
    }

    asciiToString(data){
        return String.fromCharCode.apply(null, data);
    };
    
    convertToMinerArgs() {
        let args = Object.keys(this.minerConfig).map((key) => {
            return `--${key}=${this.minerConfig[key]}`;
        });
        return args;
    }
    
    //return object from a device update line - [2018-06-14 06:24:24] GPU #0: GeForce GTX 1070, 8795.55 kH/s
    getDeviceInfo(line) {
        let hash = getInfoFromLine(line);

        if(hash) { return hash;}
        return null;
    }

    //debug function for testing
    startDebugInstance() {
        const lines = require('./testdata');

        let i = 0;
        let send = this.sender;
        let bob = this.asciiToString;
        let joe = this.getDeviceInfo;
        setInterval(function (){
            if(i<lines.length-1) {
                //if we still have an active sender, send it a reply
                if(send) {
                    //convert data from ascii to text
                    //is this a device info line?  if so update
                    //let line = bob(lines[i]);
                    let line = lines[i];
                    let update = getInfoFromLine(line);
                    if(update instanceof Device) {
                        send.send('device-update', update);
                    }else if(update instanceof DeviceInfo){
                        send.send('device-info-update', update);
                    }else if(update instanceof Share){
                        //do something maybe
                    }
    
                    // send the new output to listeners
                    send.send('update-miner-output', lines[i]);
                }
                i++;
            } else { i=0; }
            
        }, 1000);
    }

    stopMinerInstance() {
        this.daemon.kill();
    }

    startMinerInstance () {
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

        let args = this.convertToMinerArgs();
        this.daemon = spawn(path.join(global.appRootDir+`/${exe}`), args);
    
        //listen for data fromt eh miner
        this.daemon.stdout.setEncoding('utf8');
        this.daemon.stdout.on('data', (data) => {
            //if we still have an active sender, send it a reply
            if(this.sender) {
                //convert data from ascii to text
                //is this a device info line?  if so update
                let line = stripAnsi(data.toString());
                let update = getInfoFromLine(line);
                if(update instanceof Device) {
                    this.sender.send('device-update', update);
                }else if(update instanceof DeviceInfo){
                    this.sender.send('device-info-update', update);
                }else if(update instanceof Share){
                    //do something maybe
                }

                // send the new output to listeners
                this.sender.send('update-miner-output', line);
            }
        });
    
        this.daemon.stderr.on('data', (err) => {
            console.log(`Received miner error: ${err}`);
        });
    
        this.daemon.on('close', (code) => {
            console.log(`Miner closed with code: ${code}`);
            // send the new output to listeners
            this.sender.send('update-miner-output', "Miner has been stopped.");
        });
    }
}
