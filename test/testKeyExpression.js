/**
 * Created by claudio on 2021-03-30
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const EcPairKey = require('../src/EcPairKey');
const ExtPairKey = require('../src/ExtPairKey');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [KeyExpression]', function () {
    it('should fail to create new instance (invalid key type)', function () {
        expect(() => {
            new KeyExpression(
                bitcoinLib.networks.testnet,
                'bla',
                '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[KeyExpression]: invalid 'keyType' argument/);
    });

    it('should fail to create new instance (invalid origin)', function () {
        expect(() => {
            new KeyExpression(
                bitcoinLib.networks.testnet,
                KeyExpression.Type.ecPair,
                '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                null,
                {}
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[KeyExpression]: invalid 'origin' argument/);
    });

    it('should fail parsing key expression (invalid key expression)', function () {
        expect(() => {
            KeyExpression.parse(bitcoinLib.networks.testnet, '');
        }).to.throw(Error, /^Bitcoin output descriptor \[KeyExpression#parse]: invalid key expression/);
    });

    it('should fail parsing key expression (invalid extended key)', function () {
        expect(() => {
            KeyExpression.parse(bitcoinLib.networks.testnet, 'tpubxxx');
        }).to.throw(Error, /^Bitcoin output descriptor \[KeyExpression#parse]: invalid extended key/);
    });

    it('should fail parsing key expression (invalid public key)', function () {
        const testData = [
            // Invalid hex string
            {
                key: '0201030'
            },
            // Non-public key hex string
            {
                key: '02010304'
            }
        ];

        testData.forEach(data => {
            expect(() => {
                KeyExpression.parse(bitcoinLib.networks.testnet, data.key);
            }).to.throw(Error, /^Bitcoin output descriptor \[KeyExpression#parse]: invalid public key/);
        })
    });

    it('should fail parsing key expression (invalid WIF)', function () {
        expect(() => {
            KeyExpression.parse(bitcoinLib.networks.testnet, 'xyz123');
        }).to.throw(Error, /^Bitcoin output descriptor \[KeyExpression#parse]: invalid \(WIF formatted\) private key/);
    });

    it('should fail parsing key expression (extended key derivation error)', function () {
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

        expect(() => {
            KeyExpression.parse(
                bitcoinLib.networks.testnet,
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/2'
            );
        }).to.throw(Error, /^Bitcoin output descriptor \[KeyExpression#parse]: error deriving extended key/);

        // Reset BIP32 functionality
        if (prototype) {
            prototype.derive = origMethod;
        }

        bitcoinLib.bip32.fromBase58 = origFunc;
    });

    it('should fail parsing key expression (non-existent derivation path index)', function () {
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

        const testData = [{
            key: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/2'
        }, {
            key: 'tprv8frpuMJRyJJep6g57Ur3Xbz7668aLUrSY1wDAz1aBsLNWTxzLgbsSM6uJ35cLxzBYWPQSVqBJaqEHSummwkcP72kUPx6qM7sN15YvYhXwNa/1\'/2\''
        }];

        // Set global option to not ignore non-existent derivation path index
        Options.setOptions({
            ignoreNonexistentPathIndex: false
        });

        testData.forEach(data => {
            expect(() => {
                KeyExpression.parse(
                    bitcoinLib.networks.testnet,
                    data.key
                );
            }).to.throw(Error, /^Bitcoin output descriptor \[KeyExpression#parse]: error deriving extended key: nonexistent index/);
        });

        // Reset global options
        Options.reset();

        // Try again. This time, though, it should not fail, since non-existent derivation path index
        //  is being ignored
        testData.forEach(data => {
            expect(() => {
                KeyExpression.parse(
                    bitcoinLib.networks.testnet,
                    data.key
                );
            }).to.not.throw();
        });

        // Reset BIP32 functionality
        if (prototype) {
            prototype.derive = origMethod;
        }

        bitcoinLib.bip32.fromBase58 = origFunc;
    });

    it('should correctly parse key expression', function () {
        const testData = [
            // Private extended key on testnet, w/origin and (hardened) derivation path
            {
                class: ExtPairKey,
                network: bitcoinLib.networks.testnet,
                key: '[2ec78ba1/1\'/0\']tprv8frpuMJRyJJep6g57Ur3Xbz7668aLUrSY1wDAz1aBsLNWTxzLgbsSM6uJ35cLxzBYWPQSVqBJaqEHSummwkcP72kUPx6qM7sN15YvYhXwNa/1h/2\'',
                keyType: KeyExpression.Type.extPair,
                value: function () {
                    return bitcoinLib.bip32.fromBase58(this.key.slice(16, -6), this.network)
                    .deriveHardened(1)
                    .deriveHardened(2);
                },
                origin: {
                    fingerprint: '2ec78ba1',
                    path: '/1\'/0\''
                },
                isCompressed: true,
                fromRange: false
            },
            // Private extended key on testnet, w/origin and derivation path with hardened wildcard
            {
                class: ExtPairKey,
                network: bitcoinLib.networks.testnet,
                key: '[2ec78ba1/1\'/0\']tprv8frpuMJRyJJep6g57Ur3Xbz7668aLUrSY1wDAz1aBsLNWTxzLgbsSM6uJ35cLxzBYWPQSVqBJaqEHSummwkcP72kUPx6qM7sN15YvYhXwNa/*\'',
                keyType: KeyExpression.Type.extPair,
                value: function () {
                    return bitcoinLib.bip32.fromBase58(this.key.slice(16, -3), this.network);
                },
                origin: {
                    fingerprint: '2ec78ba1',
                    path: '/1\'/0\''
                },
                isCompressed: true,
                fromRange: true
            },
            // Public extended key on testnet, without origin and w/derivation path with wildcard
            {
                class: ExtPairKey,
                network: bitcoinLib.networks.testnet,
                key: '[07ccf394]tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                keyType: KeyExpression.Type.extPair,
                value: function () {
                    return bitcoinLib.bip32.fromBase58(this.key.slice(10, -4), this.network)
                    .derive(1);
                },
                origin: {
                    fingerprint: '07ccf394'
                },
                isCompressed: true,
                fromRange: true
            },
            // Public extended key on bitcoin main, without origin and derivation path
            {
                class: ExtPairKey,
                network: bitcoinLib.networks.bitcoin,
                key: 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8',
                keyType: KeyExpression.Type.extPair,
                value: function () {
                    return bitcoinLib.bip32.fromBase58(this.key, this.network);
                },
                origin: undefined,
                isCompressed: true,
                fromRange: false
            },
            // Compressed public key on testnet, without origin
            {
                class: EcPairKey,
                network: bitcoinLib.networks.testnet,
                key: '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                keyType: KeyExpression.Type.ecPair,
                value: function () {
                    return bitcoinLib.ECPair.fromPublicKey(
                        Buffer.from(this.key, 'hex'),
                        {
                            compressed: this.isCompressed,
                            network: this.network
                        }
                    );
                },
                origin: undefined,
                isCompressed: true,
                fromRange: false
            },
            // Uncompressed public key on testnet, without origin
            {
                class: EcPairKey,
                network: bitcoinLib.networks.testnet,
                key: '044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0',
                keyType: KeyExpression.Type.ecPair,
                value: function () {
                    return bitcoinLib.ECPair.fromPublicKey(
                        Buffer.from(this.key, 'hex'),
                        {
                            compressed: this.isCompressed,
                            network: this.network
                        }
                    );
                },
                origin: undefined,
                isCompressed: false,
                fromRange: false
            },
            // Private key (WIF format, compressed) on testnet, without origin
            {
                class: EcPairKey,
                network: bitcoinLib.networks.testnet,
                key: 'cVtQQE3Y8jHRk58Pet8BUXiFhcKmJkBGFXPtiNQ2m8Hy8CAL9Rvk',
                keyType: KeyExpression.Type.ecPair,
                value: function () {
                    return bitcoinLib.ECPair.fromWIF(this.key, this.network);
                },
                origin: undefined,
                isCompressed: true,
                fromRange: false
            }
        ];

        testData.forEach(data => {
            let expression;

            expect(() => {
                expression = KeyExpression.parse(data.network, data.key);
            }).to.not.throw();
            expect(expression).to.be.an.instanceOf(data.class);
            expect(expression).to.have.deep.property('network', data.network);
            expect(expression).to.have.property('type', Expression.Type.key);
            expect(expression).to.have.property('keyType', data.keyType);
            expect(expression).to.have.property('text', data.key);
            expect(expression).to.have.deep.property('value', data.value());
            expect(expression).to.have.deep.property('origin', data.origin);
            expect(expression).to.have.property('isCompressedPubKey', data.isCompressed);
            expect(expression).to.have.property('fromRange', data.fromRange);
        });
    });

    it('should correctly return real derivation path', function () {
        const testData = [{
            index: 0,
            isHardened: false,
            realIndex: 0
        }, {
            index: 1,
            isHardened: true,
            realIndex: 0x80000001
        }];

        testData.forEach(data => {
            expect(KeyExpression.realPathIndex(data.index, data.isHardened)).to.equal(data.realIndex);
        });
    });
});
