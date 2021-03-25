/**
 * Created by claudio on 2021-03-18
 */

const Expression = require('./Expression');

class NumberExpression extends Expression {
    constructor(network, text, value) {
        super(network, Expression.Type.number, text, value);
    }

    static parse(network, text) {
        const value = Number.parseInt(text);

        if (Number.isNaN(value) || value <= 0) {
            throw new Error(`Bitcoin output descriptor [NumberExpression#parse]: invalid number (${value})`)
        }

        return new NumberExpression(network, text, value);
    }
}

module.exports = NumberExpression;
