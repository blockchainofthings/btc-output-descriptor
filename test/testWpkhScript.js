/**
 * Created by claudio on 2021-04-01
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const ScriptExpression = require('../src/ScriptExpression');
const WpkhScript = require('../src/WpkhScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [WpkhScript]', function () {
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
                        Expression.Type.key
                    ),
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.key
                    )
                ]
            },
            // Child expression of the wrong type
            {
                children: [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.hex
                    )
                ]
            }
        ];

        testData.forEach(data => {
            expect(() => {
                new WpkhScript(
                    bitcoinLib.networks.testnet,
                    'wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[WpkhScript]: inconsistent child expressions; wrong number and\/or type/);
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
            // Single public key
            {
                script: 'wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                keyParamText: '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex')
                ],
                addresses: [
                    'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0'
                ]
            },
            // Extended public key range, ignore non-existent derivation key path
            {
                script: 'wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyParamText: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                outputScripts: [
                    Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex'),
                    Buffer.from('0014a42a092852883618fe975c0ea2cb1f83ea16ec1c', 'hex'),
                    Buffer.from('0014ec048633355f373856392aa94ed08f3ac07c00de', 'hex')
                ],
                addresses: [
                    'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                    'tb1q5s4qj2zj3qmp3l5hts829jcls04pdmqu7ffcqj',
                    'tb1qaszgvve4tumns43e9255a5y08tq8cqx7c7qc46'
                ]
            },
            // Extended public key range, do not ignore non-existent derivation key path
            {
                script: 'wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyParamText: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: false
                },
                outputScripts: [
                    Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex'),
                    Buffer.from('0014a42a092852883618fe975c0ea2cb1f83ea16ec1c', 'hex'),
                    Buffer.from('0014ec048633355f373856392aa94ed08f3ac07c00de', 'hex')
                ],
                addresses: [
                    'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                    'tb1q5s4qj2zj3qmp3l5hts829jcls04pdmqu7ffcqj',
                    'tb1qaszgvve4tumns43e9255a5y08tq8cqx7c7qc46'
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

            expect(expression).to.be.an.instanceOf(WpkhScript);
            expect(expression).to.have.property('keyParam')
            .that.is.an.instanceOf(KeyExpression)
            .and.have.property('text', data.keyParamText);
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
        // Simulate error instantiating P2WPKH payment
        const origFunc = bitcoinLib.payments.p2wpkh;

        bitcoinLib.payments.p2wpkh = function () {
            throw Error('Simulated error instantiating bitcoinJS payment object');
        }

        const expression = ScriptExpression.parse(
            bitcoinLib.networks.testnet,
            'wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
        );

        expect(() => {
            expression.outputScripts;
        }).to.throw(Error, /^Bitcoin output descriptor \[WpkhScript#_payments]: error deriving P2WPKH payment from public key/);

        // Reset bitcoinJS functionality
        bitcoinLib.payments.p2wpkh = origFunc;
    });
});
