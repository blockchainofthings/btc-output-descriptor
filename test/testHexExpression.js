/**
 * Created by claudio on 2021-03-30
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const HexExpression = require('../src/HexExpression');

describe('Bitcoin output descriptor [HexExpression]', function () {
    it('should fail parsing hex expression', function () {
        expect(() => {
            HexExpression.parse(bitcoinLib.networks.testnet, '');
        }).to.throw(Error, /^Bitcoin output descriptor \[HexExpression#parse]: invalid hex string/);
    });

    it('should correctly parse hex expression', function () {
        let expression;

        expect(() => {
            expression = HexExpression.parse(
                bitcoinLib.networks.testnet,
                '0014aef1b595d062d08afef5b56e485a13149644f5dc'
            );
        }).to.not.throw();
        expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
        expect(expression).to.have.property('type', Expression.Type.hex);
        expect(expression).to.have.property('text', '0014aef1b595d062d08afef5b56e485a13149644f5dc');
        expect(expression).to.have.deep.property(
            'value',
            Buffer.from('0014aef1b595d062d08afef5b56e485a13149644f5dc', 'hex')
        );
    });
});
