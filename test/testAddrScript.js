/**
 * Created by claudio on 2021-04-01
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const AddrExpression = require('../src/AddrExpression');
const ScriptExpression = require('../src/ScriptExpression');
const AddrScript = require('../src/AddrScript');

describe('Bitcoin output descriptor [AddrScript]', function () {
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
                        Expression.Type.addr
                    ),
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.addr
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
                new AddrScript(
                    bitcoinLib.networks.testnet,
                    'addr(tb1qqlx089qfh27juxk438exgqdw60ketg3zgxhqch)',
                    null,
                    data.children
                );
            }).to.throw(TypeError, /^Bitcoin output descriptor \[AddrScript]: inconsistent child expressions; wrong number and\/or type/);
        });
    });

    it('parsed instance should have expected behavior', function () {
        const testData = [
            // P2WPKH address
            {
                script: 'addr(tb1qqlx089qfh27juxk438exgqdw60ketg3zgxhqch)',
                addrParamText: 'tb1qqlx089qfh27juxk438exgqdw60ketg3zgxhqch',
                outputScripts: [
                    Buffer.from('001407ccf39409babd2e1ad589f26401aed3ed95a222', 'hex')
                ],
                addresses: [
                    'tb1qqlx089qfh27juxk438exgqdw60ketg3zgxhqch'
                ],
                _payments: [
                    bitcoinLib.payments.p2wpkh({
                        address: 'tb1qqlx089qfh27juxk438exgqdw60ketg3zgxhqch',
                        network: bitcoinLib.networks.testnet
                    })
                ]
            }
        ];

        testData.forEach(data => {
            const expression = ScriptExpression.parse(
                bitcoinLib.networks.testnet,
                data.script
            );

            expect(expression).to.be.an.instanceOf(AddrScript);
            expect(expression).to.have.property('addrParam')
            .that.is.an.instanceOf(AddrExpression)
            .and.have.property('text', data.addrParamText);
            expect(expression).to.have.deep.property('outputScripts', data.outputScripts);
            expect(expression).to.have.deep.property('addresses', data.addresses);
            expect(expression).to.have.deep.property('_payments', data._payments);
        });
    });
});
