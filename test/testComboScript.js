/**
 * Created by claudio on 2021-04-02
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const ScriptExpression = require('../src/ScriptExpression');
const ComboScript = require('../src/ComboScript');
const PkScript = require('../src/PkScript');
const PkhScript = require('../src/PkhScript');
const WpkhScript = require('../src/WpkhScript');
const ShScript = require('../src/ShScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [ComboScript]', function () {
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
                new ComboScript(
                    bitcoinLib.networks.testnet,
                    'combo(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[ComboScript]: inconsistent child expressions; wrong number and\/or type/);
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
            // Single uncompressed public key
            {
                script: 'combo(044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0)',
                keyParamText: '044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0',
                derivedScripts: [{
                    class: PkScript,
                    text: 'pk(044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0)'
                }, {
                    class: PkhScript,
                    text: 'pkh(044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0)'
                }],
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('41044278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2e11d944d19694960765ec7b7efe9d829dcf5de2fb8c074edf2b04206c36ae1c0ac', 'hex'),
                    Buffer.from('76a91435ba08cc221f45aeaac2d6a341f438311f21acbb88ac', 'hex')
                ],
                addresses: [
                    'mkR2y7e9Z6DCD2ERa9GFrdA1HxZVhcQ22G'
                ]
            },
            // Single compressed public key
            {
                script: 'combo(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                keyParamText: '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                derivedScripts: [{
                    class: PkScript,
                    text: 'pk(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
                }, {
                    class: PkhScript,
                    text: 'pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
                }, {
                    class: WpkhScript,
                    text: 'wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
                }, {
                    class: ShScript,
                    text: 'sh(wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))'
                }],
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac', 'hex'),
                    Buffer.from('76a9145dc930210dd88ac6372f0e71318d565eefe72bf288ac', 'hex'),
                    Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex'),
                    Buffer.from('a914b53b74876b178a295caa2e91870ccb32b0b43fb787', 'hex')
                ],
                addresses: [
                    'mp4r9gW2LDGdh3xa3gYjJY9MG7ZDo4eKv8',
                    'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                    '2N9mVX2NF5ix7UmspqzwcAzzAUqeydV6Ype'
                ]
            },
            // Extended public key range, ignore non-existent derivation key path
            {
                script: 'combo(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyParamText: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                derivedScripts: [{
                    class: PkScript,
                    text: 'pk(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)'
                }, {
                    class: PkhScript,
                    text: 'pkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)'
                }, {
                    class: WpkhScript,
                    text: 'wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)'
                }, {
                    class: ShScript,
                    text: 'sh(wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*))'
                }],
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
                    Buffer.from('2103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afecac', 'hex'),
                    Buffer.from('76a9145dc930210dd88ac6372f0e71318d565eefe72bf288ac', 'hex'),
                    Buffer.from('76a914a42a092852883618fe975c0ea2cb1f83ea16ec1c88ac', 'hex'),
                    Buffer.from('76a914ec048633355f373856392aa94ed08f3ac07c00de88ac', 'hex'),
                    Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex'),
                    Buffer.from('0014a42a092852883618fe975c0ea2cb1f83ea16ec1c', 'hex'),
                    Buffer.from('0014ec048633355f373856392aa94ed08f3ac07c00de', 'hex'),
                    Buffer.from('a914b53b74876b178a295caa2e91870ccb32b0b43fb787', 'hex'),
                    Buffer.from('a9141436dfcf531d23d3301b5cb2368a773e323d8cc387', 'hex'),
                    Buffer.from('a9148aad0244bc405234434a53ad74411d56bb5185b787', 'hex')
                ],
                addresses: [
                    'mp4r9gW2LDGdh3xa3gYjJY9MG7ZDo4eKv8',
                    'mvUyUDBSrW5ioaoBbTRKUL7UuD9h1MMUxb',
                    'n32uBg4Pir6ujsa7Ca6AoaDbo1pzyTXYc7',
                    'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                    'tb1q5s4qj2zj3qmp3l5hts829jcls04pdmqu7ffcqj',
                    'tb1qaszgvve4tumns43e9255a5y08tq8cqx7c7qc46',
                    '2N9mVX2NF5ix7UmspqzwcAzzAUqeydV6Ype',
                    '2Mu67ErJLVyzEMa5HbCPSsPNmbtucsZwB5z',
                    '2N5tUVd5wUJFuNvRt6qyueXKddBsWvFhfDm'
                ]
            },
            // Extended public key range, do not ignore non-existent derivation key path
            {
                script: 'combo(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyParamText: 'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                derivedScripts: [{
                    class: PkScript,
                    text: 'pk(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)'
                }, {
                    class: PkhScript,
                    text: 'pkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)'
                }, {
                    class: WpkhScript,
                    text: 'wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)'
                }, {
                    class: ShScript,
                    text: 'sh(wpkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*))'
                }],
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
                    Buffer.from('2103d450e30db23a70d065f9135a7fce79ff46fc0c8001701e483a2a4f5f46a1afecac', 'hex'),
                    Buffer.from('76a9145dc930210dd88ac6372f0e71318d565eefe72bf288ac', 'hex'),
                    Buffer.from('76a914a42a092852883618fe975c0ea2cb1f83ea16ec1c88ac', 'hex'),
                    Buffer.from('76a914ec048633355f373856392aa94ed08f3ac07c00de88ac', 'hex'),
                    Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex'),
                    Buffer.from('0014a42a092852883618fe975c0ea2cb1f83ea16ec1c', 'hex'),
                    Buffer.from('0014ec048633355f373856392aa94ed08f3ac07c00de', 'hex'),
                    Buffer.from('a914b53b74876b178a295caa2e91870ccb32b0b43fb787', 'hex'),
                    Buffer.from('a9141436dfcf531d23d3301b5cb2368a773e323d8cc387', 'hex'),
                    Buffer.from('a9148aad0244bc405234434a53ad74411d56bb5185b787', 'hex')
                ],
                addresses: [
                    'mp4r9gW2LDGdh3xa3gYjJY9MG7ZDo4eKv8',
                    'mvUyUDBSrW5ioaoBbTRKUL7UuD9h1MMUxb',
                    'n32uBg4Pir6ujsa7Ca6AoaDbo1pzyTXYc7',
                    'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                    'tb1q5s4qj2zj3qmp3l5hts829jcls04pdmqu7ffcqj',
                    'tb1qaszgvve4tumns43e9255a5y08tq8cqx7c7qc46',
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

            expect(expression).to.be.an.instanceOf(ComboScript);
            expect(expression).to.have.property('keyParam')
            .that.is.an.instanceOf(KeyExpression)
            .and.have.property('text', data.keyParamText);
            expect(expression).to.have.property('derivedScripts')
            .that.is.an('array')
            .with.lengthOf(data.derivedScripts.length);
            expression.derivedScripts.forEach((script, idx) =>
                expect(script).to.be.an.instanceOf(data.derivedScripts[idx].class)
                .and.have.property('text', data.derivedScripts[idx].text)
            );
            expect(expression).to.have.deep.property('outputScripts', data.outputScripts);
            expect(expression).to.have.deep.property('addresses', data.addresses);
            expect(expression).to.have.deep.property('_payments')
            .that.is.an('array')
            .with.lengthOf(data.outputScripts.length);
            expression._payments.forEach((payment, idx) =>
                expect(payment.output).to.deep.equal(data.outputScripts[idx])
            );
        });

        // Reset global options
        Options.reset();

        // Reset BIP32 functionality
        if (prototype) {
            prototype.derive = origMethod;
        }

        bitcoinLib.bip32.fromBase58 = origFunc;
    });
});
