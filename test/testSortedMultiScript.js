/**
 * Created by claudio on 2021-04-01
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const KeyExpression = require('../src/KeyExpression');
const NumberExpression = require('../src/NumberExpression');
const ScriptExpression = require('../src/ScriptExpression');
const SortedMultiScript = require('../src/SortedMultiScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [SortedMultiScript]', function () {
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
                script: 'sortedmulti(1,02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6,0278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d)',
                nSigParamText: '1',
                keyParamTexts: [
                    '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                    '0278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d'
                ],
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('51210278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb652ae', 'hex')
                ]
            },
            // Set of two extended public key range, ignore non-existent derivation key path
            {
                script: 'sortedmulti(1,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
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
                    Buffer.from('51210278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb652ae', 'hex'),
                    Buffer.from('5121035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a2103affd0d722f345a32fed0131e9204219cfd2b4130257e0f1fa60da95564d4027752ae', 'hex'),
                    Buffer.from('512102b4b48682860d79a93635e775182c58c012dce5041c6d2b9a732413ff158ec5642103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec52ae', 'hex'),
                    Buffer.from('5121030fb3ce30056970cfe1a9b077de804acd30722f50a037109e6c5ae084ccf242d22103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec52ae', 'hex')
                ]
            },
            // Set of two extended public key range, do not ignore non-existent derivation key path
            {
                script: 'sortedmulti(1,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
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
                    Buffer.from('51210278545fdc052121222e21d403276f0dd7811578e53852c151997777da88c4a37d2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb652ae', 'hex'),
                    Buffer.from('5121035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a2103affd0d722f345a32fed0131e9204219cfd2b4130257e0f1fa60da95564d4027752ae', 'hex'),
                    Buffer.from('5121030fb3ce30056970cfe1a9b077de804acd30722f50a037109e6c5ae084ccf242d22103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afec52ae', 'hex')
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

            expect(expression).to.be.an.instanceOf(SortedMultiScript);
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

    it('should fail if set of public keys include uncompressed key', function () {
        expect(() => {
            ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                'sortedmulti(1,02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6,044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0)'
            );
        }).to.throw(Error, /^Bitcoin output script \[SortedMultiScript]: unsupported key format/);
    });
});
