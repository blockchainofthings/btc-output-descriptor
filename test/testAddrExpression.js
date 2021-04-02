/**
 * Created by claudio on 2021-03-30
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const AddrExpression = require('../src/AddrExpression');

describe('Bitcoin output descriptor [AddrExpression]', function () {
    it('should fail to create new instance (invalid address type)', function () {
        expect(() => {
            new AddrExpression(
                bitcoinLib.networks.testnet,
                'bla',
                'n1PUNQaSqsXpSB3Rpdx8QEUrYLH2VUyGkX',
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[AddrExpression]: invalid 'addrType' argument/);
    });

    it('should fail parsing addr expression', function () {
        expect(() => {
            AddrExpression.parse(bitcoinLib.networks.testnet, '');
        }).to.throw(Error, /^Bitcoin output descriptor \[AddrExpression#parse]: invalid bitcoin address/);
    });

    it('should correctly parse addr expression', function () {
        const testData = [{
            address: 'tb1qm8uykx5ncknljvmg0yyv28ueaqvekausjkw4n3',
            addrType: AddrExpression.Type.p2wpkh,
            payment: function () {
                return bitcoinLib.payments.p2wpkh({
                    address: this.address,
                    network: bitcoinLib.networks.testnet
                });
            }
        }, {
            address: 'n1PUNQaSqsXpSB3Rpdx8QEUrYLH2VUyGkX',
            addrType: AddrExpression.Type.p2pkh,
            payment: function () {
                return bitcoinLib.payments.p2pkh({
                    address: this.address,
                    network: bitcoinLib.networks.testnet
                });
            }
        }, {
            address: 'tb1q760y8stegejhntvxvd03jze7tculgjjlzg3uknhx5kk462ag5clqqqgg6x',
            addrType: AddrExpression.Type.p2wsh,
            payment: function () {
                return bitcoinLib.payments.p2wsh({
                    address: this.address,
                    network: bitcoinLib.networks.testnet
                });
            }
        }, {
            address: '2N17sNBW68RrxE8tPNsYsRSNA1GmZMzjaPx',
            addrType: AddrExpression.Type.p2sh,
            payment: function () {
                return bitcoinLib.payments.p2sh({
                    address: this.address,
                    network: bitcoinLib.networks.testnet
                });
            }
        }];

        testData.forEach(data => {
            let expression;

            expect(() => {
                expression = AddrExpression.parse(bitcoinLib.networks.testnet, data.address);
            }).to.not.throw();
            expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
            expect(expression).to.have.property('type', Expression.Type.addr);
            expect(expression).to.have.property('addrType', data.addrType);
            expect(expression).to.have.property('text', data.address);
            expect(expression).to.have.deep.property('value', data.payment());
        });
    });
});
