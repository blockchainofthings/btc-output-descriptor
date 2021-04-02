/**
 * Created by claudio on 2021-04-01
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const ScriptExpression = require('../src/ScriptExpression');
const PkScript = require('../src/PkScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [PkScript]', function () {
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
                new PkScript(
                    bitcoinLib.networks.testnet,
                    'pk(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[PkScript]: inconsistent child expressions; wrong number and\/or type/);
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
                script: 'pk(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                keyParamText: '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac', 'hex')
                ]
            },
            // Extended public key range, ignore non-existent derivation key path
            {
                script: 'pk(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyParamText: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                outputScripts: [
                    Buffer.from('2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac', 'hex'),
                    Buffer.from('21035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41aac', 'hex'),
                    Buffer.from('2103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afecac', 'hex')
                ]
            },
            // Extended public key range, do not ignore non-existent derivation key path
            {
                script: 'pk(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyParamText: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: false
                },
                outputScripts: [
                    Buffer.from('2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac', 'hex'),
                    Buffer.from('21035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41aac', 'hex'),
                    Buffer.from('2103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afecac', 'hex')
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

            expect(expression).to.be.an.instanceOf(PkScript);
            expect(expression).to.have.property('keyParam')
            .that.is.an.instanceOf(KeyExpression)
            .and.have.property('text', data.keyParamText);
            expect(expression).to.have.deep.property('outputScripts', data.outputScripts);
            expect(expression).to.have.deep.property('addresses', []);
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
        // Simulate error instantiating P2PK payment
        const origFunc = bitcoinLib.payments.p2pk;

        bitcoinLib.payments.p2pk = function () {
            throw Error('Simulated error instantiating bitcoinJS payment object');
        }

        const expression = ScriptExpression.parse(
            bitcoinLib.networks.testnet,
            'pk(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
        );

        expect(() => {
            expression.outputScripts;
        }).to.throw(Error, /^Bitcoin output descriptor \[PkScript#_payments]: error deriving P2PK payment from public key/);

        // Reset bitcoinJS functionality
        bitcoinLib.payments.p2pk = origFunc;
    });
});
