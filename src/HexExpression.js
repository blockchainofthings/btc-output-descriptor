/**
 * Created by claudio on 2021-03-18
 */

const Expression = require('./Expression');
const Util = require('./Util');

class HexExpression extends Expression {
    constructor(network, text, value) {
        super(network, Expression.Type.hex, text, value);
    }

    static parse(network, text) {
        if (!Util.isHexText(text)) {
            throw new TypeError(`Bitcoin output descriptor [HexExpression#parse]: invalid hex string (${text})`)
        }

        return new HexExpression(network, text, Buffer.from(text, 'hex'));
    }
}

module.exports = HexExpression;
