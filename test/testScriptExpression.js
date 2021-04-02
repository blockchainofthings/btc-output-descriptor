/**
 * Created by claudio on 2021-03-31
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const EcPairKey = require('../src/EcPairKey');
const ExtPairKey = require('../src/ExtPairKey');
const AddrExpression = require('../src/AddrExpression');
const HexExpression = require('../src/HexExpression');
const NumberExpression = require('../src/NumberExpression');
const ScriptExpression = require('../src/ScriptExpression');
const PkScript = require('../src/PkScript');
const PkhScript = require('../src/PkhScript');
const WpkhScript = require('../src/WpkhScript');
const MultiScript = require('../src/MultiScript');
const SortedMultiScript = require('../src/SortedMultiScript');
const ShScript = require('../src/ShScript');
const WshScript = require('../src/WshScript');
const ComboScript = require('../src/ComboScript');
const AddrScript = require('../src/AddrScript');
const RawScript = require('../src/RawScript');

describe('Bitcoin output descriptor [ScriptExpression]', function () {
    it('should fail to create new instance (invalid script type)', function () {
        expect(() => {
            new ScriptExpression(
                bitcoinLib.networks.testnet,
                'bla',
                'pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)#3dry3g6c',
                null,
                [
                    new KeyExpression(
                        bitcoinLib.networks.testnet,
                        KeyExpression.Type.ecPair,
                        '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                '3dry3g6c'
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[ScriptExpression]: invalid 'scriptType' argument/);
    });

    it('should fail to create new instance (invalid checksum)', function () {
        expect(() => {
            new ScriptExpression(
                bitcoinLib.networks.testnet,
                ScriptExpression.Type.pkh,
                'pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)#3dry3g6c',
                null,
                [
                    new KeyExpression(
                        bitcoinLib.networks.testnet,
                        KeyExpression.Type.ecPair,
                        '02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                'abc'
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[ScriptExpression]: invalid 'checksum' argument/);
    });

    it('should fail parsing script expression (invalid parent script type)', function () {
        expect(() => {
            ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                'pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
                'bla'
            );
        }).to.throw(Error, /^Bitcoin output descriptor \[ScriptExpression#parse]: invalid 'parentScriptType' argument/);
    });

    it('should fail parsing script expression (no matching type)', function () {
        const testData = [{
            script: 'sh(pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))',
            parentScriptTypes: [
                ScriptExpression.Type.sh,
                ScriptExpression.Type.wsh,
                ScriptExpression.Type.pk,
                ScriptExpression.Type.pkh,
                ScriptExpression.Type.wpkh,
                ScriptExpression.Type.combo,
                ScriptExpression.Type.multi,
                ScriptExpression.Type.sortedmulti,
                ScriptExpression.Type.addr,
                ScriptExpression.Type.raw
            ]
        }, {
            script: 'wsh(pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6))',
            parentScriptTypes: [
                ScriptExpression.Type.wsh
            ]
        }, {
            script: 'wpkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
            parentScriptTypes: [
                ScriptExpression.Type.wsh
            ]
        }, {
            script: 'combo(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)',
            parentScriptTypes: [
                ScriptExpression.Type.sh,
                ScriptExpression.Type.wsh,
                ScriptExpression.Type.pk,
                ScriptExpression.Type.pkh,
                ScriptExpression.Type.wpkh,
                ScriptExpression.Type.combo,
                ScriptExpression.Type.multi,
                ScriptExpression.Type.sortedmulti,
                ScriptExpression.Type.addr,
                ScriptExpression.Type.raw
            ]
        }, {
            script: 'addr(tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0)',
            parentScriptTypes: [
                ScriptExpression.Type.sh,
                ScriptExpression.Type.wsh,
                ScriptExpression.Type.pk,
                ScriptExpression.Type.pkh,
                ScriptExpression.Type.wpkh,
                ScriptExpression.Type.combo,
                ScriptExpression.Type.multi,
                ScriptExpression.Type.sortedmulti,
                ScriptExpression.Type.addr,
                ScriptExpression.Type.raw
            ]
        }, {
            script: 'raw(00145dc930210dd88ac6372f0e71318d565eefe72bf2)',
            parentScriptTypes: [
                ScriptExpression.Type.sh,
                ScriptExpression.Type.wsh,
                ScriptExpression.Type.pk,
                ScriptExpression.Type.pkh,
                ScriptExpression.Type.wpkh,
                ScriptExpression.Type.combo,
                ScriptExpression.Type.multi,
                ScriptExpression.Type.sortedmulti,
                ScriptExpression.Type.addr,
                ScriptExpression.Type.raw
            ]
        }];

        testData.forEach(data => {
            data.parentScriptTypes.forEach(parentScriptType => {
                expect(() => {
                    ScriptExpression.parse(
                        bitcoinLib.networks.testnet,
                        data.script,
                        parentScriptType
                    );
                }).to.throw(Error, /^Bitcoin output descriptor \[ScriptExpression#parse]: no matching text/);
            });
        });
    });

    it('should fail parsing script expression (invalid checksum)', function () {
        expect(() => {
            ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                'pkh(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)#cvhx3dzs'
            );
        }).to.throw(Error, /^Bitcoin output descriptor \[ScriptExpression#parse]: invalid checksum/);
    });

    it('should fail parsing script expression (missing arguments)', function () {
        expect(() => {
            ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                'multi(02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
            );
        }).to.throw(Error, /^Bitcoin output descriptor \[ScriptExpression#parse]: missing arguments/);
    });

    it('should fail parsing script expression (error parsing argument)', function () {
        expect(() => {
            ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                'multi(bla,02eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6)'
            );
        }).to.throw(Error, /^Bitcoin output descriptor \[ScriptExpression#parse]: error parsing argument/);
    });

    it('should correctly parse script expression', function () {
        const testData = [
            // Raw script w/checksum
            {
                class: RawScript,
                script: 'raw(00145dc930210dd88ac6372f0e71318d565eefe72bf2)#pp260wzp',
                scriptType: ScriptExpression.Type.raw,
                children: [
                    new HexExpression(
                        bitcoinLib.networks.testnet,
                        '00145dc930210dd88ac6372f0e71318d565eefe72bf2',
                        Buffer.from('00145dc930210dd88ac6372f0e71318d565eefe72bf2', 'hex')
                    )
                ],
                checksum: 'pp260wzp',
                hasChecksum: true,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Address script without checksum
            {
                class: AddrScript,
                script: 'addr(tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0)',
                scriptType: ScriptExpression.Type.addr,
                children: [
                    new AddrExpression(
                        bitcoinLib.networks.testnet,
                        AddrExpression.Type.p2wpkh,
                        'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                        bitcoinLib.payments.p2wpkh({
                            address: 'tb1qthynqggdmz9vvde0pecnrr2ktmh7w2ljgenyg0',
                            network: bitcoinLib.networks.testnet
                        })
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Public key script w/single key, and without checksum
            {
                class: PkScript,
                script: 'pk(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2)',
                scriptType: ScriptExpression.Type.pk,
                children: [
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Public key script w/extended key range, and without checksum
            {
                class: PkScript,
                script: 'pk(tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*)',
                scriptType: ScriptExpression.Type.pk,
                children: [
                    new ExtPairKey(
                        bitcoinLib.networks.testnet,
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                        bitcoinLib.bip32.fromBase58(
                            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                            bitcoinLib.networks.testnet
                        ).derive(1),
                        undefined,
                        ExtPairKey.WildcardType.unhardened
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: true,
                keyRange: {
                    startIdx: 0,
                    count: 1001
                }
            },
            // Public hash key script w/single key, and without checksum
            {
                class: PkhScript,
                script: 'pkh(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2)',
                scriptType: ScriptExpression.Type.pkh,
                children: [
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Witness public hash key script w/single key, and without checksum
            {
                class: WpkhScript,
                script: 'wpkh(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2)',
                scriptType: ScriptExpression.Type.wpkh,
                children: [
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Multi-signature 1-of-2 script w/single keys without checksum
            {
                class: MultiScript,
                script: 'multi(1,024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2,035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a)',
                scriptType: ScriptExpression.Type.multi,
                children: [
                    new NumberExpression(
                        bitcoinLib.networks.testnet,
                        '1',
                        1
                    ),
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    ),
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Multi-signature 2-of-2 script w/extended key ranges without checksum
            {
                class: MultiScript,
                script: 'multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
                scriptType: ScriptExpression.Type.multi,
                children: [
                    new NumberExpression(
                        bitcoinLib.networks.testnet,
                        '2',
                        2
                    ),
                    new ExtPairKey(
                        bitcoinLib.networks.testnet,
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                        bitcoinLib.bip32.fromBase58(
                            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                            bitcoinLib.networks.testnet
                        ).derive(1),
                        undefined,
                        ExtPairKey.WildcardType.unhardened
                    ),
                    new ExtPairKey(
                        bitcoinLib.networks.testnet,
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*',
                        bitcoinLib.bip32.fromBase58(
                            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                            bitcoinLib.networks.testnet
                        ).derive(2),
                        undefined,
                        ExtPairKey.WildcardType.unhardened
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: true,
                keyRange: {
                    startIdx: 0,
                    count: 1001
                }
            },
            // Sorted multi-signature 1-of-2 script w/single keys without checksum
            {
                class: SortedMultiScript,
                script: 'sortedmulti(1,024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2,035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a)',
                scriptType: ScriptExpression.Type.sortedmulti,
                children: [
                    new NumberExpression(
                        bitcoinLib.networks.testnet,
                        '1',
                        1
                    ),
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    ),
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Sorted multi-signature 2-of-2 script w/extended key ranges without checksum
            {
                class: SortedMultiScript,
                script: 'sortedmulti(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
                scriptType: ScriptExpression.Type.sortedmulti,
                children: [
                    new NumberExpression(
                        bitcoinLib.networks.testnet,
                        '2',
                        2
                    ),
                    new ExtPairKey(
                        bitcoinLib.networks.testnet,
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                        bitcoinLib.bip32.fromBase58(
                            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                            bitcoinLib.networks.testnet
                        ).derive(1),
                        undefined,
                        ExtPairKey.WildcardType.unhardened
                    ),
                    new ExtPairKey(
                        bitcoinLib.networks.testnet,
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*',
                        bitcoinLib.bip32.fromBase58(
                            'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                            bitcoinLib.networks.testnet
                        ).derive(2),
                        undefined,
                        ExtPairKey.WildcardType.unhardened
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: true,
                keyRange: {
                    startIdx: 0,
                    count: 1001
                }
            },
            // Script hash script of public hash key script w/single key, and without checksum
            {
                class: ShScript,
                script: 'sh(pkh(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2))',
                scriptType: ScriptExpression.Type.sh,
                children: [
                    new PkhScript(
                        bitcoinLib.networks.testnet,
                        'pkh(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2)',
                        null,
                        [
                            new EcPairKey(
                                bitcoinLib.networks.testnet,
                                '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                                bitcoinLib.ECPair.fromPublicKey(
                                    Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                                    {
                                        compressed: true,
                                        network: bitcoinLib.networks.testnet
                                    }
                                )
                            )
                        ]
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Script hash script of multi-signature 2-of-2 script w/extended key ranges without checksum
            {
                class: ShScript,
                script: 'sh(multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*))',
                scriptType: ScriptExpression.Type.sh,
                children: [
                    new MultiScript(
                        bitcoinLib.networks.testnet,
                        'multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
                        null,
                        [
                            new NumberExpression(
                                bitcoinLib.networks.testnet,
                                '2',
                                2
                            ),
                            new ExtPairKey(
                                bitcoinLib.networks.testnet,
                                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                                bitcoinLib.bip32.fromBase58(
                                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                                    bitcoinLib.networks.testnet
                                ).derive(1),
                                undefined,
                                ExtPairKey.WildcardType.unhardened
                            ),
                            new ExtPairKey(
                                bitcoinLib.networks.testnet,
                                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*',
                                bitcoinLib.bip32.fromBase58(
                                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                                    bitcoinLib.networks.testnet
                                ).derive(2),
                                undefined,
                                ExtPairKey.WildcardType.unhardened
                            )
                        ]
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: true,
                keyRange: {
                    startIdx: 0,
                    count: 1001
                }
            },
            // Witness script hash script of public hash key script w/single key, and without checksum
            {
                class: WshScript,
                script: 'wsh(pkh(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2))',
                scriptType: ScriptExpression.Type.wsh,
                children: [
                    new PkhScript(
                        bitcoinLib.networks.testnet,
                        'pkh(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2)',
                        null,
                        [
                            new EcPairKey(
                                bitcoinLib.networks.testnet,
                                '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                                bitcoinLib.ECPair.fromPublicKey(
                                    Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                                    {
                                        compressed: true,
                                        network: bitcoinLib.networks.testnet
                                    }
                                )
                            )
                        ]
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
            // Witness script hash script of multi-signature 2-of-2 script w/extended key ranges without checksum
            {
                class: WshScript,
                script: 'wsh(multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*))',
                scriptType: ScriptExpression.Type.wsh,
                children: [
                    new MultiScript(
                        bitcoinLib.networks.testnet,
                        'multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
                        null,
                        [
                            new NumberExpression(
                                bitcoinLib.networks.testnet,
                                '2',
                                2
                            ),
                            new ExtPairKey(
                                bitcoinLib.networks.testnet,
                                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                                bitcoinLib.bip32.fromBase58(
                                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                                    bitcoinLib.networks.testnet
                                ).derive(1),
                                undefined,
                                ExtPairKey.WildcardType.unhardened
                            ),
                            new ExtPairKey(
                                bitcoinLib.networks.testnet,
                                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*',
                                bitcoinLib.bip32.fromBase58(
                                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                                    bitcoinLib.networks.testnet
                                ).derive(2),
                                undefined,
                                ExtPairKey.WildcardType.unhardened
                            )
                        ]
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: true,
                keyRange: {
                    startIdx: 0,
                    count: 1001
                }
            },
            // Combo script w/single key, and without checksum
            {
                class: ComboScript,
                script: 'combo(024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2)',
                scriptType: ScriptExpression.Type.combo,
                children: [
                    new EcPairKey(
                        bitcoinLib.networks.testnet,
                        '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                        bitcoinLib.ECPair.fromPublicKey(
                            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                            {
                                compressed: true,
                                network: bitcoinLib.networks.testnet
                            }
                        )
                    )
                ],
                checksum: undefined,
                hasChecksum: false,
                hasRangeKey: false,
                keyRange: undefined
            },
        ];

        testData.forEach(data => {
            const expression = ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                data.script
            );

            expect(expression).to.be.an.instanceOf(data.class);
            expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
            expect(expression).to.have.property('type', Expression.Type.script);
            expect(expression).to.have.property('scriptType', data.scriptType);
            expect(expression).to.have.property('text', data.script);
            expect(expression).to.have.property('value', null);
            expect(expression).to.have.deep.property('children', data.children);
            expect(expression).to.have.property('checksum', data.checksum);
            expect(expression).to.have.property('hasChecksum', data.hasChecksum);
            expect(expression).to.have.property('hasRangeKey', data.hasRangeKey);
            expect(expression).to.have.deep.property('keyRange', data.keyRange);

            if (expression.hasRangeKey) {
                expression.keyRange = {
                    startIdx: 0,
                    count: 10
                }
            }
        });
    });

    it('should fail when setting key range if child key expressions have different key ranges', function () {
        const children = [
            new NumberExpression(
                bitcoinLib.networks.testnet,
                '2',
                2
            ),
            new ExtPairKey(
                bitcoinLib.networks.testnet,
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ).derive(1),
                undefined,
                ExtPairKey.WildcardType.unhardened
            ),
            new ExtPairKey(
                bitcoinLib.networks.testnet,
                'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*',
                bitcoinLib.bip32.fromBase58(
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                    bitcoinLib.networks.testnet
                ).derive(2),
                undefined,
                ExtPairKey.WildcardType.unhardened
            )
        ];

        // Set different key ranges for the two child key expressions to simulate error
        children[1].keyRange = {
            startIdx: 0,
            count: 10
        };
        children[2].keyRange = {
            startIdx: 1,
            count: 10
        };

        const expression = new ScriptExpression(
            bitcoinLib.networks.testnet,
            ScriptExpression.Type.multi,
            'multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
            null,
            children
        );

        expect(() => {
            expression.keyRange;
        }).to.throw(Error, /^Bitcoin output descriptor \[ScriptExpression#get\(keyRange\)]: key range mismatch/);
    });

    it('should successfully set key range', function () {
        const expression = new ScriptExpression(
            bitcoinLib.networks.testnet,
            ScriptExpression.Type.multi,
            'multi(2,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*,tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*)',
            null,
            [
                new NumberExpression(
                    bitcoinLib.networks.testnet,
                    '2',
                    2
                ),
                new ExtPairKey(
                    bitcoinLib.networks.testnet,
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/1/*',
                    bitcoinLib.bip32.fromBase58(
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                        bitcoinLib.networks.testnet
                    ).derive(1),
                    undefined,
                    ExtPairKey.WildcardType.unhardened
                ),
                new ExtPairKey(
                    bitcoinLib.networks.testnet,
                    'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm/2/*',
                    bitcoinLib.bip32.fromBase58(
                        'tpubDBHn4aVWbRA6SbSVoUZsyTowBtecUUWShQzoP7jibnjkSTa4VC2K2VZUz2CeJx4yhSMKy8ScBMe1LRSU6FsnP49ojGyHewYAD1Vf3iXm4Tm',
                        bitcoinLib.networks.testnet
                    ).derive(2),
                    undefined,
                    ExtPairKey.WildcardType.unhardened
                )
            ]
        );

        expression.keyRange = {
            startIdx: 1,
            count: 10
        };

        expect(expression.keyRange).to.deep.equal({
            startIdx: 1,
            count: 10
        });
    });
});
