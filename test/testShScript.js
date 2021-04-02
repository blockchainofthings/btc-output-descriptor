/**
 * Created by claudio on 2021-04-02
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const ScriptExpression = require('../src/ScriptExpression');
const ShScript = require('../src/ShScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [ShScript]', function () {
    it('should fail to create new instance (inconsistent child expressions)', function () {
        const testData = [
            // No child expressions
            {
                children: undefined
            },
            // Too many child expressions
            {
                children: [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.script
                    ),
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.script
                    )
                ]
            },
            // Child expression of the wrong type
            {
                children: [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.key
                    )
                ]
            },
            // Child script expression of unexpected script type
            {
                children: [
                    new ScriptExpression(
                        bitcoinLib.networks.testnet,
                        ScriptExpression.Type.combo
                    )
                ]
            }
        ];

        testData.forEach(data => {
            expect(() => {
                new ShScript(
                    bitcoinLib.networks.testnet,
                    'sh(wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[ShScript]: inconsistent child expressions; wrong number and\/or type/);
        });
    });

    it('parsed instance should have expected behavior', function () {
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
            // Script w/single public key
            {
                script: 'sh(wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))',
                scriptParamText: 'wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('a914b53b74876b178a295caa2e91870ccb32b0b43fb787', 'hex')
                ],
                addresses: [
                    '2N9mVX2NF5ix7UmspqzwcAzzAUqeydV6Ype'
                ]
            },
            // Script w/extended public key range, ignore non-existent derivation key path
            {
                script: 'sh(wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*))',
                scriptParamText: 'wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                outputScripts: [
                    Buffer.from('a914b53b74876b178a295caa2e91870ccb32b0b43fb787', 'hex'),
                    Buffer.from('a9141436dfcf531d23d3301b5cb2368a773e323d8cc387', 'hex'),
                    Buffer.from('a9148aad0244bc405234434a53ad74411d56bb5185b787', 'hex')
                ],
                addresses: [
                    '2N9mVX2NF5ix7UmspqzwcAzzAUqeydV6Ype',
                    '2Mu67ErJLVyzEMa5HbCPSsPNmbtucsZwB5z',
                    '2N5tUVd5wUJFuNvRt6qyueXKddBsWvFhfDm'
                ]
            },
            // Script w/extended public key range, do not ignore non-existent derivation key path
            {
                script: 'sh(wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*))',
                scriptParamText: 'wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: false
                },
                outputScripts: [
                    Buffer.from('a914b53b74876b178a295caa2e91870ccb32b0b43fb787', 'hex'),
                    Buffer.from('a9141436dfcf531d23d3301b5cb2368a773e323d8cc387', 'hex'),
                    Buffer.from('a9148aad0244bc405234434a53ad74411d56bb5185b787', 'hex')
                ],
                addresses: [
                    '2N9mVX2NF5ix7UmspqzwcAzzAUqeydV6Ype',
                    '2Mu67ErJLVyzEMa5HbCPSsPNmbtucsZwB5z',
                    '2N5tUVd5wUJFuNvRt6qyueXKddBsWvFhfDm'
                ]
            }
        ];

        testData.forEach(data => {
            const expression = ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                data.script
            );

            if (data.keyRange) {
                expression.keyRange = data.keyRange;
            }

            if (data.globalOptions) {
                Options.setOptions(data.globalOptions);
            }

            expect(expression).to.be.an.instanceOf(ShScript);
            expect(expression).to.have.property('scriptParam')
            .that.is.an.instanceOf(ScriptExpression)
            .and.have.property('text', data.scriptParamText);
            expect(expression).to.have.deep.property('outputScripts', data.outputScripts);
            expect(expression).to.have.deep.property('addresses', data.addresses);
        });

        // Reset global options
        Options.reset();

        // Reset BIP32 functionality
        if (prototype) {
            prototype.derive = origMethod;
        }

        bitcoinLib.bip32.fromBase58 = origFunc;
    });

    it('should fail when getting output scripts (error deriving payment from public key)', function () {
        // Simulate error instantiating P2SH payment
        const origFunc = bitcoinLib.payments.p2sh;

        bitcoinLib.payments.p2sh = function () {
            throw Error('Simulated error instantiating bitcoinJS payment object');
        }

        const expression = ScriptExpression.parse(
            bitcoinLib.networks.testnet,
            'sh(wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))'
        );

        expect(() => {
            expression.outputScripts;
        }).to.throw(Error, /^Bitcoin output descriptor \[ShScript#_payments]: error deriving P2SH payment from redeem script/);

        // Reset bitcoinJS functionality
        bitcoinLib.payments.p2sh = origFunc;
    });
});
