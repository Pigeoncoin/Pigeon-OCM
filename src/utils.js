
const MINER_SHARE = /(\[.*?\])\s+accepted:\s+(\d+)\/(\d+)\s\(diff (\d+\.\d+)\).*?(\d+\.\d+)\s+((?:k|m|g)H\/s)\s(yes|booooo)/;
const MINER_DEVICE_INFO = /(\[.*?\])\s+(GPU\s#\d+):\s+(.*?),\s+(\d+.\d+)\s((?:g|m|k|h)H\/s)/;

//GPU #0, GTX NVidia 1070, HashRate object
class Device {
    constructor(deviceId, deviceName, hashrate) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.rates = [];  //array of hashrate objects
        //if we were provided a hashrate we can add it in
        if(hashrate instanceof HashRate){
            this.rates = [...this.rates,hashrate];
        }
    }

    //stores up to 1 million entries
    addHashRate(timestamp, hashrate) {
        //remove the first 10000 aka oldest
        if(this.rates.length == 1000000) {
            for(let i = 0; i< 10000; i++)
            {
                this.rates.shift();
            }
        }
        this.rates = [...this.rates, new HashRate(timestamp, hashrate)]
    }

    // average all the hash amounts.  we might need a large number
    getAverageHashRate() {
        let total = 0;
        return this.rates.map((cur) => {
            total += cur.rate
        });
    }
}

//accepts timestamp string and hashrate + units string
class HashRate {
    constructor(timestamp, hashrate) {
        this.timestamp = timestamp;
        this.hashrate = getRateInHash(hashrate);
    }
}

//returns array of capture groups
function getInfoFromLine(line, regex) {
    //we only care about speccific lines - shares and device updates
    let values = line.match(regex);
    if(values.length == 0) { return null;}
    //optionally return an object if we can determine what line type it is
    /*
        Full match	1-73	`[2018-06-14 06:23:37] accepted: 1202/1203 (diff 0.050), 8997.73 kH/s yes`
        Group 1.	2-21	`2018-06-14 06:23:37`
        Group 2.	33-37	`1202`
        Group 3.	38-42	`1203`
        Group 4.	49-54	`0.050`
        Group 5.	57-64	`8997.73`
        Group 6.	65-69	`kH/s`
        Group 7.	70-73	`yes`
    */
    //this is a share
    if(line.indexOf("accepted: ") >= 0 && values.length == 8) {
        return {
            type: 'share',
            timestamp: values[1],
            acceptedShares: values[2],
            totalShares: values[3],
            diff: values[4],
            hashRate: new HashRate(values[1], `${values[5]} ${values[6]}`),
            valid: values[7]
        };
    }

    /*
    Full match	74-134	`[2018-06-14 20:22:39] GPU #0: GeForce GTX 1070, 8815.84 kH/s`
        Group 1.	n/a	`2018-06-14 20:22:39`
        Group 2.	n/a	`GPU #0`
        Group 3.	n/a	`GeForce GTX 1070`
        Group 4.	n/a	`8815.84`
        Group 5.	n/a	`kH/s`
    */
    // device status
    // returns a Device object
    if(line.indexOf("GPU #") >= 0 && values.length == 6) {
        return {
            type: 'device',
            deviceId: values[2],
            name: values[3],
            hashRate: new HashRate(values[1], `${values[4]} ${values[5]}`),
        };
        let dev = new Device(values[2], values[3]);
        dev.addHashRate(values[1], `${values[4]} ${values[5]}`);
        return dev;
    }

    //something didnt work...
    return null;
}

//looks for case where only a single string containing rate and units is passed
// but handles separate as well,  19999 kH/s,  1023 mH/s, etc
//this should be called whenever creating a new HashRate
function getRateInHash(rate, units) {
    //if we are only passed 1 arg lets assume its the amount and units
    let hashrate = null;
    let unitStr = null;

    //they passed a rate number and no units
    if(!units){
        if(!isNaN(rate)) { //they passes in a number, so just return it
            return rate;
        } else {
            let parts = rate.split(" ");
            if(parts.length!=2) { return -2; } //can't proceed
            hashrate = parseFloat(parts[0]);
            unitStr = parts[1];
        }
    } else {
        hashrate = parseFloat(rate);
        unitStr = units;
    }

    switch(unitStr) {
        case "gH/s":
            return hashrate * 1000000000;
        case "mH/s":
            return hashrate * 1000000;
        case "kH/s":
            return hashrate * 1000;
        case "H/s":
            return hashrate;
    }

    //if we somehow made it to here, fail
    //return null;
}

module.exports = { Device, HashRate, getInfoFromLine, getRateInHash, MINER_SHARE,MINER_DEVICE_INFO};