
const MINER_SHARE_PATTERN = /\[(.*?)\]\s+accepted:\s+(\d+)\/(\d+).*?(\d+\.\d+)\s+((?:k|m|g)H\/s)\s(yes|booooo)/;
const MINER_DEVICE_INFO = /\[(.*?)\]\s+(GPU\s#\d+):\s+(.*?),\s+(\d+.\d+)\s((?:g|m|k|h)H\/s)/;

class Device {
    constructor(deviceId, deviceName) {
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.rates = [];  //array of hashrate objects
    }

    //stores up to 1 million entries
    addHashRate(hashRate) {
        //remove the first 10000 aka oldest
        if(this.rates.length == 1000000) {
            for(let i = 0; i< 10000; i++)
            {
                this.rates.shift();
            }
        }
        this.rates = [...this.rates, new HashRate(time, hash)]
    }

    // average all the hash amounts.  we might need a large number
    getAverageHashRate() {
        let total = 0;
        return this.rates.map((cur) => {
            total += cur.rate
        });
    }
}

class HashRate {
    constructor(time, rate) {
        this.time = time;
        this.rate = getRateInHash(rate);
    }
}

//returns array of capture groups
function getInfoFromLine(line, regex) {
    let match = regex.exec(line);
    let values=[];
    while(match !=null) {
        values.push(match[0]);
        match = regex.exec(line);
    }
    //we only care about speccific lines - shares and device updates
    if(values.length == 0) { return null;}
    //optionally return an object if we can determine what line type it is
    /*
        Full match	0-72	`[2018-06-14 20:22:31] accepted: 3668/3670 (diff 0.026), 8717.35 kH/s yes`
        Group 1.	n/a	`2018-06-14 20:22:31`
        Group 2.	n/a	`3668`
        Group 3.	n/a	`3670`
        Group 4.	n/a	`0.026`
        Group 5.	n/a	`8717.35`
        Group 6.	n/a	`kH/s`
        Group 7.	n/a	`yes`
    */
    //this is a share
    if(line.contains("accepted: ") && values.length == 7) {
        return {
            type: 'share',
            timestamp: values[0],
            acceptedShares: values[1],
            totalShares: values[2],
            diff: values[3],
            hashRate: new HashRate(values[0], `${values[4]} ${values[5]}`),
            valid: values[6]
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
    if(line.contains("GPU #") && values.length == 5) {
        return {
            type: 'device',
            deviceId: values[1],
            name: values[2],
            hashRate: new HashRate(values[0], `${values[3]} ${values[4]}`),
        };
    }

    return values;
}

//should be supplied the rate and units,  19999 kH/s,  1023 mH/s, etc
function getRateInHash(rate, units) {
    switch(units) {
        case "gH/s":
            return rate * 1000000000;
        case "mH/s":
            return rate * 1000000;
        case "kH/s":
            return rate * 1000;
        case "H/s":
            return rate;
    }
}

module.exports = { Device, HashRate, getInfoFromLine, getRateInHash, MINER_DEVICE_INFO};