/**
 * Created by claudio on 2021-03-18
 */

const util = require('util');
const bitcoinLib = require('bitcoinjs-lib');

module.exports = {
    isNullArg(arg) {
        return arg === undefined || arg === null;
    },
    isValidBtcNetwork(network) {
        return Object.values(bitcoinLib.networks).some(item => item === network);
    },
    isHexText(text) {
        return /^(?:[A-Fa-f0-9]{2})+$/.test(text);
    },
    concatRegExp(/*re...*/) {
        return new RegExp(Array.from(arguments).map(re => re.source).join(''));
    },
    isValidKeyRange(obj) {
        return typeof obj === 'object' && obj !== null && obj.hasOwnProperty('startIdx')
            && obj.hasOwnProperty('count') && Number.isInteger(obj.startIdx) && obj.startIdx >= 0
            && Number.isInteger(obj.count) && obj.count >0;
    },
    keyRangeEquals(obj1, obj2) {
        return module.exports.isValidKeyRange(obj1) && module.exports.isValidKeyRange(obj2)
            && obj1.startIdx === obj2.startIdx && obj1.count === obj2.count;
    },
    inspect: util.inspect,
    /**
     * Check if two public keys are equal.
     * @param {Buffer} pk1
     * @param {Buffer} pk2
     * @return {boolean}
     */
    pubKeyEquals(pk1, pk2) {
        return pk1.equals(pk2);
    },
    /**
     * Check if two public key sets are equal.
     * @param {Buffer[]} s1
     * @param {Buffer[]} s2
     */
    pubKeySetEquals(s1, s2) {
        let setLength;

        return (setLength = s1.length) === s2.length
            && s1.every((pk1, idx) => pk1.equals(s2[idx]));
    }
};