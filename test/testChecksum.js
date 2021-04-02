/**
 * Created by claudio on 2021-03-29
 */

const expect = require('chai').expect;
const {
    descriptorChecksum,
    isValidChecksum
} = require('../src/Checksum');

describe('Bitcoin output descriptor [Checksum]', function () {
    it('should correctly calculate output descriptor checksum', function () {
        const testData = [
            {
                descriptor: 'wpkh([cc909d55/0\'/0\'/10\']03484581a96934d1ee62da5bc575a5b4091edd2945ad60fd1c8edf5255fe1cbf42)',
                checksum: 'mlqvq72k'
            },
            {
                descriptor: 'sh(multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*))',
                checksum: 'yec8ldgv'
            },
            // Invalid descriptor with invalid character
            {
                descriptor: 'ãbcedfg',
                checksum: ''
            }
        ];

        testData.forEach(data => {
            expect(descriptorChecksum(data.descriptor)).to.equal(data.checksum);
        });
    });

    it('should correctly identify an invalid checksum', function () {
        const testData = [
            // Too short
            {
                checksum: 'mlqvq72'
            },
            // Too long
            {
                checksum: 'mlqvq72ks'
            },
            // Invalid character
            {
                checksum: 'mlqvq72b'
            }
        ];

        testData.forEach(data => {
            expect(isValidChecksum(data.checksum)).to.be.false;
        });
    });

    it('should correctly identify a valid checksum', function () {
        expect(isValidChecksum('mlqvq72k')).to.be.true;
    });
});
