/**
 * Created by claudio on 2021-03-29
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');

describe('Bitcoin output descriptor [Expression]', function () {
    it('should fail to create new instance (invalid network)', function () {
        expect(() => {
            new Expression(
                {},
                Expression.Type.script,
                'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)',
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[Expression]: invalid 'network' argument/);
    });

    it('should fail to create new instance (invalid type)', function () {
        expect(() => {
            new Expression(
                bitcoinLib.networks.testnet,
                'bla',
                'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)'
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[Expression]: invalid 'type' argument/);
    });

    it('should fail to create new instance (invalid children)', function () {
        expect(() => {
            new Expression(
                bitcoinLib.networks.testnet,
                Expression.Type.script,
                'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)',
                null,
                [{}]
            );
        }).to.throw(TypeError, /^Bitcoin output descriptor \[Expression]: invalid 'children' argument/);
    });

    it('should successfully create new instance', function () {
        expect(() => {
            new Expression(
                bitcoinLib.networks.testnet,
                Expression.Type.script,
                'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)',
                null,
                [
                    new Expression(
                        bitcoinLib.networks.testnet,
                        Expression.Type.key,
                        '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
                    )
                ]
            );
        }).to.not.throw();
    });

    it('created instance should have its properties properly set', function () {
        const expression = new Expression(
            bitcoinLib.networks.testnet,
            Expression.Type.script,
            'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)',
            null,
            [
                new Expression(
                    bitcoinLib.networks.testnet,
                    Expression.Type.key,
                    '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
                )
            ]
        );

        expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
        expect(expression).to.have.property('type', Expression.Type.script);
        expect(expression).to.have.property('text', 'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)');
        expect(expression).to.have.property('value', null);
        expect(expression).to.have.deep.property('children', [
            new Expression(
                bitcoinLib.networks.testnet,
                Expression.Type.key,
                '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
            )
        ]);
    });

    it('should correctly indicate that expression does not have children', function () {
        const expression = new Expression(
            bitcoinLib.networks.testnet,
            Expression.Type.script,
            'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)'
        );

        expect(expression.hasChildren).to.be.false;
    });

    it('should correctly indicate that expression has children', function () {
        const expression = new Expression(
            bitcoinLib.networks.testnet,
            Expression.Type.script,
            'pkh(02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5)',
            null,
            [
                new Expression(
                    bitcoinLib.networks.testnet,
                    Expression.Type.key,
                    '02c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5'
                )
            ]
        );

        expect(expression.hasChildren).to.be.true;
    });
});
