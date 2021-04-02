/**
 * Created by claudio on 2021-03-30
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const ExtPairKey = require('../src/ExtPairKey');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [ExtPairKey]', function () {
    it('should fail to create new instance (invalid pathWildCard)', function () {
        expect(() => {
            new ExtPairKey(
                bitcoinLib.networks.testnet,
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ),
                undefined,
                'bla'
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[ExtPairKey]: invalid 'pathWildcard' argument/);
    });

    it('should successfully create new instance', function () {
        let expression;

        expect(() => {
            expression = new ExtPairKey(
                bitcoinLib.networks.testnet,
                '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ).derive(1),
                {
                    fingerprint: 'cc909d55',
                    path: '/1\'/0\''
                },
                ExtPairKey.WildcardType.unhardened
            );
        }).to.not.throw();
        expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
        expect(expression).to.have.property('type', Expression.Type.key);
        expect(expression).to.have.property('keyType', KeyExpression.Type.extPair);
        expect(expression).to.have.property(
            'text',
            '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*'
        );
        expect(expression).to.have.deep.property(
            'value',
            bitcoinLib.bip32.fromBase58(
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                bitcoinLib.networks.testnet
            ).derive(1)
        );
        expect(expression).to.have.deep.property('origin', {
            fingerprint: 'cc909d55',
            path: '/1\'/0\''
        });
        expect(expression).to.have.property('pathWildcard', ExtPairKey.WildcardType.unhardened);
        expect(expression).to.have.deep.property('keyRange', {
            startIdx: 0,
            count: 1001
        });
    });

    it('should fail if setting invalid key range', function () {
        const expression = new ExtPairKey(
            bitcoinLib.networks.testnet,
            '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
            bitcoinLib.bip32.fromBase58(
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                bitcoinLib.networks.testnet
            ).derive(1),
            {
                fingerprint: 'cc909d55',
                path: '/1\'/0\''
            },
            ExtPairKey.WildcardType.unhardened
        );

        expect(() => {
            expression.keyRange = {};
        }).to.throw(TypeError, /^Bitcoin output descriptor \[ExtPairKey#set\(keyRange\)]: invalid key range/);
    });
    it('should correctly set new key range', function () {
        const expression = new ExtPairKey(
            bitcoinLib.networks.testnet,
            '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
            bitcoinLib.bip32.fromBase58(
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                bitcoinLib.networks.testnet
            ).derive(1),
            {
                fingerprint: 'cc909d55',
                path: '/1\'/0\''
            },
            ExtPairKey.WildcardType.unhardened
        );

        expression.keyRange = {
            startIdx: 1,
            count: 5
        };

        expect(expression.keyRange).to.deep.equal({
            startIdx: 1,
            count: 5
        });
    });

    it('should correctly return public keys', function () {
        // Simulate non-existent derivation path index
        let prototype;
        let origMethod;
        const origFunc = bitcoinLib.bip32.fromBase58;
        const nonExistPath = {
            parentIndex: 1,
            index: 2
        }

        bitcoinLib.bip32.fromBase58 = function () {
            const res = origFunc.apply(this, Array.from(arguments));

            if (!prototype) {
                prototype = Object.getPrototypeOf(res);
                origMethod = prototype.derive;

                prototype.derive = function () {
                    let deriveRes = origMethod.apply(this, Array.from(arguments));

                    if ((this.index & ~0x80000000) === nonExistPath.parentIndex && (deriveRes.index & ~0x80000000) === nonExistPath.index) {
                        // Index should be considered non-existent. Derive again using next index
                        deriveRes = this.derive(deriveRes.index + 1);
                    }

                    return deriveRes;
                }
            }

            return res;
        };

        const testData = [
            // Single extended public key
            {
                key: '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                value: bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ),
                origin: {
                    fingerprint: 'cc909d55',
                    path: '/1\'/0\''
                },
                pathWildcard: undefined,
                keyRange: undefined,
                globalOptions: null,
                pubKeys: [
                    Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex')
                ]
            },
            // Extended public key range, ignore non-existent derivation path index
            {
                key: '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                value: bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ).derive(1),
                origin: {
                    fingerprint: 'cc909d55',
                    path: '/1\'/0\''
                },
                pathWildcard: ExtPairKey.WildcardType.unhardened,
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                pubKeys: [
                    Buffer.from('02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6', 'hex'),
                    Buffer.from('035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a', 'hex'),
                    Buffer.from('03d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec', 'hex'),
                    Buffer.from('03d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec', 'hex')
                ]
            },
            // Extended public key range, do not ignore non-existent derivation path index
            {
                key: '[cc909d55/1\'/0\']tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                value: bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ).derive(1),
                origin: {
                    fingerprint: 'cc909d55',
                    path: '/1\'/0\''
                },
                pathWildcard: ExtPairKey.WildcardType.unhardened,
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: false
                },
                pubKeys: [
                    Buffer.from('02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6', 'hex'),
                    Buffer.from('035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a', 'hex'),
                    undefined,
                    Buffer.from('03d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec', 'hex')
                ]
            },
            // Extended private key range, with hardened derivation
            {
                key: '[2ec78ba1/1\'/0\']tprv8frpuMJRyJJep6g57Ur3Xbz7668aLUrSY1wDAz1aBsLNWTxzLgbsSM6uJ35cLxzBYWPQSVqBJaqEHSummwkcP72kUPx6qM7sN15YvYhXwNa/*\'',
                value: bitcoinLib.bip32.fromBase58(
                    'tprv8frpuMJRyJJep6g57Ur3Xbz7668aLUrSY1wDAz1aBsLNWTxzLgbsSM6uJ35cLxzBYWPQSVqBJaqEHSummwkcP72kUPx6qM7sN15YvYhXwNa',
                    bitcoinLib.networks.testnet
                ),
                origin: {
                    fingerprint: '2ec78ba1',
                    path: '/1\'/0\''
                },
                pathWildcard: ExtPairKey.WildcardType.hardened,
                keyRange: {
                    startIdx: 0,
                    count: 2
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                pubKeys: [
                    Buffer.from('022ead479d2b958610efc2d4e727acc4e749a0281f2c6dbddf6991322db9e6ec2d', 'hex'),
                    Buffer.from('02950458837b3d935285c37511ecd919218b07566d66b956b1604a3a99fb246ea4', 'hex')
                ]
            }
        ];

        testData.forEach(data => {
            const expression = new ExtPairKey(
                bitcoinLib.networks.testnet,
                data.key,
                data.value,
                data.origin,
                data.pathWildcard
            );

            if (data.keyRange) {
                expression.keyRange = data.keyRange;
            }

            if (data.globalOptions) {
                Options.setOptions(data.globalOptions);
            }

            expect(expression.publicKeys).to.deep.equal(data.pubKeys);
        })

        // Reset global options
        Options.reset();

        // Reset BIP32 functionality
        if (prototype) {
            prototype.derive = origMethod;
        }

        bitcoinLib.bip32.fromBase58 = origFunc;
    });

    it('should have no effect trying to set key range for non-range key', function () {
        const expression = new ExtPairKey(
            bitcoinLib.networks.testnet,
            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
            bitcoinLib.bip32.fromBase58(
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                bitcoinLib.networks.testnet
            )
        );

        expect(expression.fromRange).to.be.false;
        expect(() => {
            expression.keyRange = {
                startIdx: 0,
                count: 10
            };
        }).to.not.throw();
        expect(expression._pubKeysFromRange()).to.deep.equal([]);
    });

    it('should fail getting public keys (extended key derivation error)', function () {
        // Simulate error when deriving extended key
        let prototype;
        let origMethod;
        const origFunc = bitcoinLib.bip32.fromBase58;

        bitcoinLib.bip32.fromBase58 = function () {
            const res = origFunc.apply(this, Array.from(arguments));

            if (!prototype) {
                prototype = Object.getPrototypeOf(res);
                origMethod = prototype.derive;

                prototype.derive = function () {
                    throw Error('Simulated error deriving extended key');
                }
            }

            return res;
        };

        const expression = new ExtPairKey(
            bitcoinLib.networks.testnet,
            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/*',
            bitcoinLib.bip32.fromBase58(
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                bitcoinLib.networks.testnet
            ),
            undefined,
            ExtPairKey.WildcardType.unhardened
        );

        expect(() => {
            expression.publicKeys;
        }).to.throw(Error, /^Bitcoin output descriptor \[ExtPairKey#_pubKeysFromRange]: error deriving extended key/);

        // Reset BIP32 functionality
        if (prototype) {
            prototype.derive = origMethod;
        }

        bitcoinLib.bip32.fromBase58 = origFunc;
    });
});
