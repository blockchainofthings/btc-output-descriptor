/**
 * Created by claudio on 2021-03-19
 */

const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Util = require('./Util');

class AddrScript extends ScriptExpression {
    get addrParam() {
        return this.children[0];
    }

    get outputScripts() {
        return [this.addrParam.value.output];
    }

    get addresses() {
        return [this.addrParam.value.address];
    }

    get _payments() {
        return [this.addrParam.value];
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.addr, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.addr) {
            throw new Error(`Bitcoin output descriptor [AddrScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }
}

module.exports = AddrScript;
