/**
 * Created by claudio on 2021-03-29
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Util = require('../src/Util');

describe('Bitcoin output descriptor [Util]', function () {
    it('should correctly identify null args (undefined)', function () {
        expect(Util.isNullArg()).to.be.true;
    });

    it('should correctly identify null args (null)', function () {
        expect(Util.isNullArg(null)).to.be.true;
    });

    it('should correctly identify a non-null arg', function () {
        expect(Util.isNullArg({})).to.be.false;
    });

    it('should correctly identify an invalid Bitcoin network', function () {
        expect(Util.isValidBtcNetwork({})).to.be.false;
    });

    it('should correctly identify a valid Bitcoin network', function () {
        expect(Util.isValidBtcNetwork(bitcoinLib.networks.testnet)).to.be.true;
    });

    it('should correctly identify a (minimal length) valid hex text', function () {
        expect(Util.isHexText('0a')).to.be.true;
    });

    it('should correctly identify a valid hex text', function () {
        expect(Util.isHexText('01a5Bc')).to.be.true;
    });

    it('should correctly identify an invalid hex text (odd number of characters)', function () {
        expect(Util.isHexText('01a5B')).to.be.false;
    });

    it('should correctly identify an invalid hex text (invalid characters)', function () {
        expect(Util.isHexText('01a5BG')).to.be.false;
    });

    it('should correctly concatenate regular expressions (2)', function () {
        expect(Util.concatRegExp(/^[a-z]{4}/, /-\d{3}$/)).to.deep.equal(/^[a-z]{4}-\d{3}$/);
    });

    it('should correctly concatenate regular expressions (2+)', function () {
        expect(Util.concatRegExp(/^[a-z]{4}/, /-\d{3}/, /-[A-Z]{2}$/)).to.deep.equal(/^[a-z]{4}-\d{3}-[A-Z]{2}$/);
    });

    it('should correctly identify an invalid key range (non-object)', function () {
        expect(Util.isValidKeyRange('')).to.be.false;
    });

    it('should correctly identify an invalid key range (missing startIdx)', function () {
        expect(Util.isValidKeyRange({
            count: 1
        })).to.be.false;
    });

    it('should correctly identify an invalid key range (missing count)', function () {
        expect(Util.isValidKeyRange({
            startIdx: 0
        })).to.be.false;
    });

    it('should correctly identify an invalid key range (negative start index)', function () {
        expect(Util.isValidKeyRange({
            startIdx: -1,
            count: 1
        })).to.be.false;
    });

    it('should correctly identify an invalid key range (zero count)', function () {
        expect(Util.isValidKeyRange({
            startIdx: 0,
            count: 0
        })).to.be.false;
    });

    it('should correctly identify a valid key range (zero count)', function () {
        expect(Util.isValidKeyRange({
            startIdx: 0,
            count: 1
        })).to.be.true;
    });

    it('should correctly identify different key ranges (different start index)', function () {
        expect(Util.keyRangeEquals({
            startIdx: 0,
            count: 1
        }, {
            startIdx: 1,
            count: 1
        })).to.be.false;
    });

    it('should correctly identify different key ranges (different count)', function () {
        expect(Util.keyRangeEquals({
            startIdx: 0,
            count: 1
        }, {
            startIdx: 0,
            count: 2
        })).to.be.false;
    });

    it('should correctly identify different key ranges (different start index & count)', function () {
        expect(Util.keyRangeEquals({
            startIdx: 0,
            count: 1
        }, {
            startIdx: 1,
            count: 2
        })).to.be.false;
    });

    it('should correctly identify equal key ranges', function () {
        expect(Util.keyRangeEquals({
            startIdx: 0,
            count: 1
        }, {
            startIdx: 0,
            count: 1
        })).to.be.true;
    });

    it('should correctly identify different public keys', function () {
        expect(Util.pubKeyEquals(
            Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
            Buffer.from('0214bf6eb7e5d473eb3b8f9cf68e63f971e744202d7114a219df305aed0cfa1c47', 'hex')
        )).to.be.false;
    });

    it('should correctly identify equal public keys', function () {
        expect(Util.pubKeyEquals(
            Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
            Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex')
        )).to.be.true;
    });

    it('should correctly identify different public key sets (different lengths)', function () {
        expect(Util.pubKeySetEquals(
            [
                Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
                Buffer.from('0214bf6eb7e5d473eb3b8f9cf68e63f971e744202d7114a219df305aed0cfa1c47', 'hex')
            ],
            [
                Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex')
            ]
        )).to.be.false;
    });

    it('should correctly identify different public key sets', function () {
        expect(Util.pubKeySetEquals(
            [
                Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
                Buffer.from('0214bf6eb7e5d473eb3b8f9cf68e63f971e744202d7114a219df305aed0cfa1c47', 'hex')
            ],
            [
                Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
                Buffer.from('02cfbdd5c7f584e254564ea159e552d9b02ffb846b26227aa7096d75dbdcf693e5', 'hex')
            ]
        )).to.be.false;
    });

    it('should correctly identify equal public key sets', function () {
        expect(Util.pubKeySetEquals(
            [
                Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
                Buffer.from('0214bf6eb7e5d473eb3b8f9cf68e63f971e744202d7114a219df305aed0cfa1c47', 'hex')
            ],
            [
                Buffer.from('03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42', 'hex'),
                Buffer.from('0214bf6eb7e5d473eb3b8f9cf68e63f971e744202d7114a219df305aed0cfa1c47', 'hex')
            ]
        )).to.be.true;
    });
});
