/**
 * Created by claudio on 2021-04-01
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const NumberExpression = require('../src/NumberExpression');
const ScriptExpression = require('../src/ScriptExpression');
const MultiScript = require('../src/MultiScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [MultiScript]', function () {
    it('should fail to create new instance (inconsistent child expressions)', function () {
        const testData = [
            // No child expressions
            {
                children: undefined
            },
            // Too few child expressions
            {
                children: [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.number
                    )
                ]
            },
            // First child expression of the wrong type
            {
                children: [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.hex
                    ),
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
            // Any of subsequent child expression of the wrong type
            {
                children: [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.number
                    ),
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.key
                    ),
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.hex
                    )
                ]
            }
        ];

        testData.forEach(data => {
            expect(() => {
                new MultiScript(
                    bitcoinLib.networks.testnet,
                    'multi(1,02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6,0278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d)',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[MultiScript]: inconsistent child expressions; wrong number and\/or type/);
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
            // Set of two single public keys
            {
                script: 'multi(1,02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6,0278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d)',
                nSigParamText: '1',
                keyParamTexts: [
                    '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                    '0278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d'
                ],
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6210278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d52ae', 'hex')
                ]
            },
            // Set of two extended public key range, ignore non-existent derivation key path
            {
                script: 'multi(1,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
                nSigParamText: '1',
                keyParamTexts: [
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*'
                ],
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                outputScripts: [
                    Buffer.from('512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6210278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d52ae', 'hex'),
                    Buffer.from('5121035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a2103affd0d722f345a32fed0131e9204219cfd2b4130257e0f1fa60da95564d4027752ae', 'hex'),
                    Buffer.from('512103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec2102b4b48682860d79a93635e775182c58c012dce5041c6d2b9a732413ff158ec56452ae', 'hex'),
                    Buffer.from('512103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec21030fb3ce30056970cfe1a9b077de804acd30722f50a037109e6c5ae084ccf242d252ae', 'hex')
                ]
            },
            // Set of two extended public key range, do not ignore non-existent derivation key path
            {
                script: 'multi(1,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
                nSigParamText: '1',
                keyParamTexts: [
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*'
                ],
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: false
                },
                outputScripts: [
                    Buffer.from('512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6210278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d52ae', 'hex'),
                    Buffer.from('5121035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a2103affd0d722f345a32fed0131e9204219cfd2b4130257e0f1fa60da95564d4027752ae', 'hex'),
                    Buffer.from('512103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec21030fb3ce30056970cfe1a9b077de804acd30722f50a037109e6c5ae084ccf242d252ae', 'hex')
                ]
            },
            // Set of one extended public key range, ignore non-existent derivation key path
            {
                script: 'multi(1,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                nSigParamText: '1',
                keyParamTexts: [
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*'
                ],
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                outputScripts: [
                    Buffer.from('512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb651ae', 'hex'),
                    Buffer.from('5121035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a51ae', 'hex'),
                    Buffer.from('512103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec51ae', 'hex')
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

            expect(expression).to.be.an.instanceOf(MultiScript);
            expect(expression).to.have.property('nSigParam')
            .that.is.an.instanceOf(NumberExpression)
            .and.have.property('text', data.nSigParamText);
            expect(expression).to.have.property('keyParams')
            .that.is.an('array')
            .with.lengthOf(data.keyParamTexts.length);
            expression.keyParams.forEach((keyParam, idx) =>
                expect(keyParam).to.be.an.instanceOf(KeyExpression)
                .and.have.property('text', data.keyParamTexts[idx])
            );
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
        // Simulate error instantiating P2MS payment
        const origFunc = bitcoinLib.payments.p2ms;

        bitcoinLib.payments.p2ms = function () {
            throw Error('Simulated error instantiating bitcoinJS payment object');
        }

        const expression = ScriptExpression.parse(
            bitcoinLib.networks.testnet,
            'multi(1,02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6,0278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d)'
        );

        expect(() => {
            expression.outputScripts;
        }).to.throw(Error, /^Bitcoin output descriptor \[MultiScript#_payments]: error deriving P2MS payment from public key/);

        // Reset bitcoinJS functionality
        bitcoinLib.payments.p2ms = origFunc;
    });
});
