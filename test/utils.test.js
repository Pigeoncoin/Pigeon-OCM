const assert = require('assert');
const Utils = require('../src/utils.js');



const shareLine = "[2018-06-14 06:23:37] accepted: 1202/1203 (diff 0.050), 8997.73 kH/s yes!";
const shareObject = {
    type: 'share',
    timestamp: "[2018-06-14 06:23:37]",
    acceptedShares: "1202",
    totalShares: "1203",
    diff: "0.050",
    hashRate: {
        timestamp:"[2018-06-14 06:23:37]", 
        hashrate:8997730
    },
    valid: "yes"
};
const deviceLine = "[2018-06-14 06:24:24] GPU #0: GeForce GTX 1070, 8795.55 kH/s";
const deviceObject =  {
    type: 'device',
    deviceId: "GPU #0",
    name: "GeForce GTX 1070",
    hashRate: {
        timestamp: "[2018-06-14 06:24:24]", 
        hashrate: 8795550
    }
};

const hashRateObject = {
    timestamp: "[2018-06-14 06:24:24]",
    hashrate: 8795550
};

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


describe('Test Utils.js', function () {
    it('should return the proper hash in H/s from given inputs', function () {
        assert.equal(Utils.getRateInHash(hash1[0], hash1[1]), hash1a);
        assert.equal(Utils.getRateInHash(hash2[0], hash2[1]), hash2a);
        assert.equal(Utils.getRateInHash(hash3[0], hash3[1]), hash3a);
        assert.equal(Utils.getRateInHash(hash4[0], hash4[1]), hash4a);
        assert.equal(Utils.getRateInHash(hash5[0], hash5[1]), hash5a);
    });
    describe('Test HashRate class', function () {
        it('should return a valid HashRate object', function () {
            assert.deepEqual(hashRateObject, new Utils.HashRate("[2018-06-14 06:24:24]", "8795.55 kH/s"));
        });
    });
    
    describe('Test getInfoFromLine method', function () {
        it('should return an object for a share line', function (){
            assert.deepEqual(shareObject, Utils.getInfoFromLine(shareLine, Utils.MINER_SHARE));
        });
        it('should return a device object for a device update line', function () {
            assert.deepEqual(deviceObject, Utils.getInfoFromLine(deviceLine, Utils.MINER_DEVICE_INFO));
        });
    });
    
});
