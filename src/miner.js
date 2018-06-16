const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const path = require('path');
const { spawn } = require('child_process');

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
                this.sender.send('update-miner-output', this.asciiToString(data));
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
