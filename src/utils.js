
const searchPatterns = [
    {type: "share", pattern: /(\[.*?\])\s+accepted:\s+(\d+)\/(\d+)\s\(diff (\d+\.\d+)\).*?(\d+\.\d+)\s+((?:k|m|g)H\/s)\s(yes|booooo)/},
    {type: "deviceHash", pattern: /(\[.*?\])\s+(GPU\s#\d+):\s+(.*?),\s+(\d+.\d+)\s((?:g|m|k|h)H\/s)/},
    {type: "deviceInfo", pattern: /(\[.*?\])\s+(GPU\s#\d+):\s+(\d+ MHz)\s+((?:\d+.\d+)\s+.H\/W)\s+(\d+W)\s+(\d+C)\s+(FAN \d+%)/}
];


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
        this.processor = "";
        this.electricity = "";
        this.temp = "";
        this.fan = "";
    }

    //stores up to 1 million entries
    addHashrate(timestamp, hashrate) {
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
    //return an object,  {H/s, k/mH/s}
    getAverageHashrate() {
        let total = 0.0;
        this.rates.map((cur) => {
            total += cur.hashrate
        });
        total = (total / this.rates.length).toFixed(2);

        //now we need to convert to a kH/s or mH/s
        let human = null;
        let units = null;
        if(total / 1000000 > 0) { 
            human = (total / 1000000).toFixed(2);
            units = "mH/s";
        }else if (total / 1000 > 0){
            human = (total / 1000).toFixed(2);
            units = "kH/s";
        }else {
            human = total;
            units = "H/s";
        }
        let str = `${human} ${units}`;
        return [parseFloat(total), str];
    }
}
//hashrate should be a HashRate object
class Share {
    constructor(timestamp, acceptedShares, totalShares, diff, hashrate, valid) {
        this.timestamp = timestamp;
        this.acceptedShares = acceptedShares;
        this.totalShares = totalShares;
        this.diff = diff;
        (hashrate instanceof HashRate) ? this.hashrate = hashrate : this.hashrate = new HashRate(timestamp, hashrate);
        this.valid = valid;
    }

    isValid() {
        if(this.valid === "yes") {
            return true;
        }
        return false;
    }
}

class DeviceInfo {
    constructor(deviceId, timestamp, clockSpeed, efficiency, power, temp, fan){
        this.deviceId = deviceId;
        this.timestamp = timestamp;
        this.clockSpeed = clockSpeed;
        this.efficiency = efficiency;
        this.power = power;
        this.temp = temp;
        this.fan = fan;
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
//see end of file for regex info
function getInfoFromLine(line) {
    //we only care about speccific lines - shares and device updates
    //loop through all search patterns and return the appropriate information
    
    for(pattern of searchPatterns){
        let values = line.match(pattern.pattern);

        if(!values) { continue; }
        let type = pattern.type;

        //handle the different patterns
        switch(type){
            case "share":
                if( values.length == 8 ) {
                    return new Share(values[1], values[2], values[3], values[4], new HashRate(values[1], `${values[5]} ${values[6]}`),values[7]);
                }
                break;
            case "deviceHash":
                if( values.length == 6 ) {
                    return new Device(values[2], values[3], new HashRate(values[1], `${values[4]} ${values[5]}`));
                }
                break;
            case "deviceInfo":
                if( values.length == 8 ){
                    return new DeviceInfo(values[2],values[1], values[3],values[4],values[5],values[6],values[7]);
                }
                break;
        }
    }

    //no pattern found
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

module.exports = { Device, DeviceInfo, Share, HashRate, getInfoFromLine, getRateInHash};

/*
        share:
            Full match	1-73	`[2018-06-14 06:23:37] accepted: 1202/1203 (diff 0.050), 8997.73 kH/s yes`
            Group 1.	2-21	`2018-06-14 06:23:37`
            Group 2.	33-37	`1202`
            Group 3.	38-42	`1203`
            Group 4.	49-54	`0.050`
            Group 5.	57-64	`8997.73`
            Group 6.	65-69	`kH/s`
            Group 7.	70-73	`yes`

            return {
                timestamp: values[1],
                acceptedShares: values[2],
                totalShares: values[3],
                diff: values[4],
                hashRate: new HashRate(values[1], `${values[5]} ${values[6]}`),
                valid: values[7]
            }
  
        deviceHash:
            Full match	74-134	`[2018-06-14 20:22:39] GPU #0: GeForce GTX 1070, 8815.84 kH/s`
            Group 1.	n/a	`[2018-06-14 20:22:39]`
            Group 2.	n/a	`GPU #0`
            Group 3.	n/a	`GeForce GTX 1070`
            Group 4.	n/a	`8815.84`
            Group 5.	n/a	`kH/s`
            return {
                deviceId: values[2],
                name: values[3],
                hashRate: new HashRate(values[1], `${values[4]} ${values[5]}`),
            };


        deviceInfo:
            Full match	0-66	`[2018-06-19 12:57:19] GPU #0: 1702 MHz 81.41 kH/W 114W 81C FAN 54%`
            Group 1.	0-21	`[2018-06-19 12:57:19]`
            Group 2.	22-28	`GPU #0`
            Group 3.	30-38	`1702 MHz`
            Group 4.	39-49	`81.41 kH/W`
            Group 5.	50-54	`114W`
            Group 6.	55-58	`81C`
            Group 7.	59-66	`FAN 54%`
            return {
                deviceId: values[1],
                processor: values[2],
                elecUsage: values[3],
                elecDraw: values[4],
                temp: values[5],
                fan: values[6]
            }
*/