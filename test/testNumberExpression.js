/**
 * Created by claudio on 2021-03-29
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const NumberExpression = require('../src/NumberExpression');

describe('Bitcoin output descriptor [NumberExpression]', function () {
    it('should fail parsing number expression', function () {
        expect(() => {
            NumberExpression.parse(bitcoinLib.networks.testnet, '');
        }).to.throw(Error, /^Bitcoin output descriptor \[NumberExpression#parse]: invalid number/);
    });

    it('should correctly parse number expression', function () {
        let expression;

        expect(() => {
            expression = NumberExpression.parse(bitcoinLib.networks.testnet, '3');
        }).to.not.throw();
        expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
        expect(expression).to.have.property('type', Expression.Type.number);
        expect(expression).to.have.property('text', '3');
        expect(expression).to.have.property('value', 3);
    });
});
