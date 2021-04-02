/**
 * Created by claudio on 2021-04-02
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const ScriptExpression = require('../src/ScriptExpression');
const WshScript = require('../src/WshScript');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [WshScript]', function () {
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
                new WshScript(
                    bitcoinLib.networks.testnet,
                    'wsh(pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[WshScript]: inconsistent child expressions; wrong number and\/or type/);
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
                script: 'wsh(pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))',
                scriptParamText: 'pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                keyRange: undefined,
                globalOptions: undefined,
                outputScripts: [
                    Buffer.from('002048e63b699cdf71761d406585d623568e0954944eacaa16881e8c146eea2489be', 'hex')
                ],
                addresses: [
                    'tb1qfrnrk6vumachv82qvkzavg6k3cy4f9zw4j4pdzq73s2xa63y3xlq7gfg4h'
                ]
            },
            // Script w/extended public key range, ignore non-existent derivation key path
            {
                script: 'wsh(pkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*))',
                scriptParamText: 'pkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: true
                },
                outputScripts: [
                    Buffer.from('002048e63b699cdf71761d406585d623568e0954944eacaa16881e8c146eea2489be', 'hex'),
                    Buffer.from('00200a833fd65757b1ad8764123060fb1e22d5eaa3e3011b5487e834f758da74a592', 'hex'),
                    Buffer.from('0020ff961b57d9894864fbd2c28786535328765e8aa2a0f54d87043b9778281740fb', 'hex')
                ],
                addresses: [
                    'tb1qfrnrk6vumachv82qvkzavg6k3cy4f9zw4j4pdzq73s2xa63y3xlq7gfg4h',
                    'tb1qp2pnl4jh27c6mpmyzgcxp7c7yt274glrqyd4fplgxnm43kn55kfqyjf3sl',
                    'tb1ql7tpk47e39yxf77jc2rcv56n9pm9az4z5r65mpcy8wths2qhgras34vwmw'
                ]
            },
            // Script w/extended public key range, do not ignore non-existent derivation key path
            {
                script: 'wsh(pkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*))',
                scriptParamText: 'pkh(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                keyRange: {
                    startIdx: 0,
                    count: 4
                },
                globalOptions: {
                    ignoreNonexistentPathIndex: false
                },
                outputScripts: [
                    Buffer.from('002048e63b699cdf71761d406585d623568e0954944eacaa16881e8c146eea2489be', 'hex'),
                    Buffer.from('00200a833fd65757b1ad8764123060fb1e22d5eaa3e3011b5487e834f758da74a592', 'hex'),
                    Buffer.from('0020ff961b57d9894864fbd2c28786535328765e8aa2a0f54d87043b9778281740fb', 'hex')
                ],
                addresses: [
                    'tb1qfrnrk6vumachv82qvkzavg6k3cy4f9zw4j4pdzq73s2xa63y3xlq7gfg4h',
                    'tb1qp2pnl4jh27c6mpmyzgcxp7c7yt274glrqyd4fplgxnm43kn55kfqyjf3sl',
                    'tb1ql7tpk47e39yxf77jc2rcv56n9pm9az4z5r65mpcy8wths2qhgras34vwmw'
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

            expect(expression).to.be.an.instanceOf(WshScript);
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
        // Simulate error instantiating P2WSH payment
        const origFunc = bitcoinLib.payments.p2wsh;

        bitcoinLib.payments.p2wsh = function () {
            throw Error('Simulated error instantiating bitcoinJS payment object');
        }

        const expression = ScriptExpression.parse(
            bitcoinLib.networks.testnet,
            'wsh(pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))'
        );

        expect(() => {
            expression.outputScripts;
        }).to.throw(Error, /^Bitcoin output descriptor \[WshScript#_payments]: error deriving P2WSH payment from redeem script/);

        // Reset bitcoinJS functionality
        bitcoinLib.payments.p2wsh = origFunc;
    });
});
