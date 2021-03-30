/**
 * Created by claudio on 2021-03-18
 */

const Util = require('./Util');

const TYPE = Object.freeze({
    script: 'script',
    key: 'key',
    addr: 'addr',
    hex: 'hex',
    number: 'number'
});

class Expression {
    static get Type() {
        return TYPE;
    }

    get hasChildren() {
        return !!this.children && this.children.length > 0;
    }

    constructor(network, type, text, value, children) {
        if (!Util.isValidBtcNetwork(network)) {
            throw new TypeError(`Bitcoin output descriptor [Expression]: invalid \'network\' argument (${Util.inspect(network)})`);
        }

        if (!isValidType(type)) {
            throw new TypeError(`Bitcoin output descriptor [Expression]: invalid \'type\' argument (${type})`);
        }

        if (!Util.isNullArg(children) && !isExpressionList(children)) {
            throw new TypeError(`Bitcoin output descriptor [Expression]: invalid \'children\' argument (${Util.inspect(children)})`);
        }

        this.network = network;
        this.type = type;
        this.text = text;
        this.value = value;
        this.children = children;
    }
}

function isValidType(type) {
    return Object.values(TYPE).some(name => name === type);
}

function isExpression(obj) {
    return obj instanceof Expression;
}

function isExpressionList(list) {
    return Array.isArray(list) && list.length > 0 && list.every(item => isExpression(item));
}

module.exports = Expression;
