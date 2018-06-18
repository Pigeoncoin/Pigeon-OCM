const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const path = require('path');
const { spawn } = require('child_process');
const { Device, Share, HashRate, getInfoFromLine } = require('./utils');

module.exports = class Miner {
    constructor(config, sender) {
        this.minerConfig = config;
        this.sender = sender;
    }

    asciiToString(data){
        return String.fromCharCode.apply(null, data);
    };
    
    convertToMinerArgs() {
        let args = Object.keys(this.minerConfig).map((key) => {
            return `--${key}=${this.minerConfig[key]}`;
        });
        console.log("args: " + args);
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
        console.log("starting debug instance instead of miner");
        let lines = [
            "[2018-06-14 06:22:57] accepted: 1200/1200 (diff 0.201), 9005.54 kH/s yes!",
            "[2018-06-14 06:24:24] accepted: 1204/1205 (diff 0.194), 9003.83 kH/s yes!",
            "[2018-06-14 06:24:27] accepted: 1205/1206 (diff 0.059), 8993.78 kH/s yes!",
            "[2018-06-14 06:25:06] GPU #0: GeForce GTX 1070, 8749.92 kH/s",
            "[2018-06-14 06:25:06] accepted: 1206/1207 (diff 0.071), 8994.42 kH/s yes!",
            "[2018-06-14 06:25:12] hash order CBA54289D3EF0167 (5b225096)",
            "[2018-06-14 06:25:24] GPU #0: GeForce GTX 1070, 8766.23 kH/s",
            "[2018-06-14 06:25:25] accepted: 1207/1208 (diff 0.070), 8993.19 kH/s yes!",
            "[2018-06-14 06:26:15] hash order CBA54289D3EF0167 (5b2250d5)",
            "[2018-06-14 06:26:25] x16s block 90236, diff 1049.954",
            "[2018-06-14 06:26:25] hash order 35C91F64E0278ABD (5b2250e0)",
            "[2018-06-14 06:26:30] GPU #0: GeForce GTX 1070, 8704.82 kH/s",
            "[2018-06-17 14:04:54] GPU #0: 1908 MHz 11.52 kH/W 56W 64C FAN 42%"        
        ];

        let i = 0;
        let send = this.sender;
        let bob = this.asciiToString;
        let joe = this.getDeviceInfo;
        setInterval(function (){
            if(i<lines.length-1) {
                console.log(`Received new miner data: ${lines[i]}`);
                //if we still have an active sender, send it a reply
                if(send) {
                    //convert data from ascii to text
                    //is this a device info line?  if so update
                    //let line = bob(lines[i]);
                    let deviceUpdate = joe(lines[i]);
                    if(deviceUpdate instanceof Device) {
                        send.send('device-update', deviceUpdate);
                    }
    
                    // send the new output to listeners
                    send.send('update-miner-output', lines[i]);
                }
                i++;
            } else { i=0; }
            
        }, 1000);
    }

    startMinerInstance () {
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

        let args = this.convertToMinerArgs();
        let daemon = spawn(path.join(global.appRootDir+`/${exe}`), args);
    
        //listen for data fromt eh miner
        daemon.stdout.on('data', (data) => {
            console.log(`Received new miner data: ${data}`);
            //if we still have an active sender, send it a reply
            if(this.sender) {
                //convert data from ascii to text
                //is this a device info line?  if so update
                let line = this.asciiToString(data);
                let deviceUpdate = this.getDeviceInfo(line);
                if(deviceUpdate instanceof Device) {
                    this.sender.send('device-update', deviceUpdate);
                }

                // send the new output to listeners
                this.sender.send('update-miner-output', line);
            }
        });
    
        daemon.stderr.on('data', (err) => {
            console.log(`Received miner error: ${err}`);
        });
    
        daemon.on('close', (code) => {
            console.log(`Miner closed with code: ${code}`);
        });
    }
}
