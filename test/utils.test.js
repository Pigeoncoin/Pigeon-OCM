const assert = require('assert');
const Utils = require('../src/utils.js');


//miner output - share line
const shareLine = "[2018-06-14 06:23:37] accepted: 1202/1203 (diff 0.050), 8997.73 kH/s yes!";
const shareObject = {
    timestamp: "[2018-06-14 06:23:37]",
    acceptedShares: "1202",
    totalShares: "1203",
    diff: "0.050",
    hashrate: {
        timestamp:"[2018-06-14 06:23:37]", 
        hashrate:8997730
    },
    valid: "yes"
};

//miner output - device info line
const deviceLine = "[2018-06-14 06:24:24] GPU #0: GeForce GTX 1070, 8795.55 kH/s";
const deviceLineObject =  {
    deviceId: "GPU #0",
    deviceName: "GeForce GTX 1070",
    rates: [
        {
            timestamp: "[2018-06-14 06:24:24]", 
            hashrate: 8795550
        }
    ]
};
//HashRate object
const hashRateObj1 = {
    timestamp: "[2018-06-14 06:24:24]",
    hashrate: 8795550
};


//test hashes
const hash1 = [323, "H/s"];
const hash1a = 323;
const hash2 = [400, "kH/s"];
const hash2a = 400000;
const hash3 = [8795.55, "kH/s"];
const hash3a = 8795550;
const hash4 = [85.55, "mH/s"];
const hash4a = 85550000;
const hash5 = [8795.55,"mH/s"];
const hash5a = 8795550000;
const hash6 = "8795.55 kH/s";
const hash7 = "235.55 H/s";


//blank device object
const deviceObject = {
    deviceId: "GPU #0",
    deviceName: "GeForce GTX 1070",
    rates: []
};

//device object with rates
const deviceObjectRates = {
    deviceId: "GPU #0",
    deviceName: "GeForce GTX 1070",
    rates: [
        {
            timestamp: "[2018-06-14 06:24:24]",
            hashrate: 8795550
        },
        {
            timestamp: "[2018-06-14 06:34:24]",
            hashrate: 8895250
        },
        {
            timestamp: "[2018-06-14 07:24:24]",
            hashrate: 9995860
        }
    ]
};

describe('Test Utils.js', function () {
    describe('Test getRateInHash method', function() {
        it('should return the proper hash in H/s from given inputs', function () {
            assert.equal(Utils.getRateInHash(hash1[0], hash1[1]), hash1a);
            assert.equal(Utils.getRateInHash(hash2[0], hash2[1]), hash2a);
            assert.equal(Utils.getRateInHash(hash3[0], hash3[1]), hash3a);
            assert.equal(Utils.getRateInHash(hash4[0], hash4[1]), hash4a);
            assert.equal(Utils.getRateInHash(hash5[0], hash5[1]), hash5a);
            assert.equal(Utils.getRateInHash(hash6), 8795550);
            assert.equal(Utils.getRateInHash(hash7), 235.55);

        });
    });
    
    describe('Test HashRate class', function () {
        it('should return a valid HashRate object', function () {
            assert.deepEqual(hashRateObj1, new Utils.HashRate("[2018-06-14 06:24:24]", "8795.55 kH/s"));
        });
    });
    
    describe('Test getInfoFromLine method', function () {
        it('should return an object for a share line', function (){
            assert.deepEqual(shareObject, Utils.getInfoFromLine(shareLine));
        });
        it('should return a device object for a device update line', function () {
            assert.deepEqual(deviceLineObject, Utils.getInfoFromLine(deviceLine));
        });
    });

    describe('Test Device Class', function() {
        it('should return a new Device object', function () {
            assert.deepEqual(deviceObject, new Utils.Device("GPU #0", "GeForce GTX 1070"));
        });

        it('should return a Device object with 3 hash rates', function () {
            let dev1 = new Utils.Device("GPU #0", "GeForce GTX 1070");
            dev1.addHashRate("[2018-06-14 06:24:24]", "8795.55 kH/s");
            dev1.addHashRate("[2018-06-14 06:34:24]", "8895.25 kH/s");
            dev1.addHashRate("[2018-06-14 07:24:24]", "9995.86 kH/s");
            
            assert.deepEqual(dev1, deviceObjectRates);
        });

    });
    
});
