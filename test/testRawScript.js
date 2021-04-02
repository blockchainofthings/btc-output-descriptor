/**
 * Created by claudio on 2021-03-31
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const HexExpression = require('../src/HexExpression');
const ScriptExpression = require('../src/ScriptExpression');
const RawScript = require('../src/RawScript');

describe('Bitcoin output descriptor [RawScript]', function () {
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
                        Expression.Type.hex
                    ),
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.hex
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
            }
        ];

        testData.forEach(data => {
            expect(() => {
                new RawScript(
                    bitcoinLib.networks.testnet,
                    'raw(00145dc930210dd88ac6372f0e71318d565eefe72bf2)',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[RawScript]: inconsistent child expressions; wrong number and\/or type/);
        });
    });

    it('parsed instance should have expected behavior', function () {
        const testData = [
            // P2WPKH output script
            {
                script: 'raw(001407ccf39409babd2e1ad589f26401aed3ed95a222)',
                hexParamText: '001407ccf39409babd2e1ad589f26401aed3ed95a222',
                outputScripts: [
                    Buffer.from('001407ccf39409babd2e1ad589f26401aed3ed95a222', 'hex')
                ],
                addresses: [
                    'tb1qqlx089qfh27juxk438exgqdw60ketg3zgxhqch'
                ]
            },
            // P2PKH output script
            {
                script: 'raw(76a9145dc930210dd88ac6372f0e71318d565eefe72bf288ac)',
                hexParamText: '76a9145dc930210dd88ac6372f0e71318d565eefe72bf288ac',
                outputScripts: [
                    Buffer.from('76a9145dc930210dd88ac6372f0e71318d565eefe72bf288ac', 'hex')
                ],
                addresses: [
                    'mp4r9gW2LDGdh3xa3gYjJY9MG7ZDo4eKv8'
                ]
            },
            // P2WSH output script
            {
                script: 'raw(002048e63b699cdf71761d406585d623568e0954944eacaa16881e8c146eea2489be)',
                hexParamText: '002048e63b699cdf71761d406585d623568e0954944eacaa16881e8c146eea2489be',
                outputScripts: [
                    Buffer.from('002048e63b699cdf71761d406585d623568e0954944eacaa16881e8c146eea2489be', 'hex')
                ],
                addresses: [
                    'tb1qfrnrk6vumachv82qvkzavg6k3cy4f9zw4j4pdzq73s2xa63y3xlq7gfg4h'
                ]
            },
            // P2SH output script
            {
                script: 'raw(a914a909857e5d14cbcf2044b250f7c6492810aae8d187)',
                hexParamText: 'a914a909857e5d14cbcf2044b250f7c6492810aae8d187',
                outputScripts: [
                    Buffer.from('a914a909857e5d14cbcf2044b250f7c6492810aae8d187', 'hex')
                ],
                addresses: [
                    '2N8f1bGNi89ixDhzdF483hu8aHqWi42SNBE'
                ]
            },
            // P2PK output script
            {
                script: 'raw(2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac)',
                hexParamText: '2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac',
                outputScripts: [
                    Buffer.from('2102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb6ac', 'hex')
                ],
                addresses: []
            },
            // P2MS output script
            {
                script: 'raw(512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb621035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a52ae)',
                hexParamText: '512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb621035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a52ae',
                outputScripts: [
                    Buffer.from('512102eb23fcd29fbc0ef1badafc973f9011d4c8f447fd9a5997a965cc01ffca267fb621035dc97b1688f577d73360331eb56403128c3d8b01904785e93f7c617839fae41a52ae', 'hex')
                ],
                addresses: []
            },
            // Null data output script
            {
                script: 'raw(6a1354686973206973206f6e6c7920612074657374)',
                hexParamText: '6a1354686973206973206f6e6c7920612074657374',
                outputScripts: [
                    Buffer.from('6a1354686973206973206f6e6c7920612074657374', 'hex')
                ],
                addresses: []
            },
            // Non-standard output script
            {
                script: 'raw(010203040506070809)',
                hexParamText: '010203040506070809',
                outputScripts: [
                    Buffer.from('010203040506070809', 'hex')
                ],
                addresses: []
            }
        ];

        testData.forEach(data => {
            const expression = ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                data.script
            );

            expect(expression).to.be.an.instanceOf(RawScript);
            expect(expression).to.have.property('hexParam')
            .that.is.an.instanceOf(HexExpression)
            .and.have.property('text', data.hexParamText);
            expect(expression).to.have.deep.property('outputScripts', data.outputScripts);
            expect(expression).to.have.deep.property('addresses', data.addresses);
        });
    });

    it('should fail when trying to retrieve payments for non-standard output script', function () {
        const expression = ScriptExpression.parse(
            bitcoinLib.networks.testnet,
            'raw(010203040506070809)'
        );

        expect(() => {
            expression._payments;
        }).to.throw(Error, /^Bitcoin output descriptor \[RawScript#_payments]: non-standard output script/);
    });
});
