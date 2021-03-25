/**
 * Created by claudio on 2021-03-22
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Util = require('./Util');

const INNER_SCRIPT_TYPES = [
    ScriptExpression.Type.pk,
    ScriptExpression.Type.pkh,
    ScriptExpression.Type.multi,
    ScriptExpression.Type.sortedmulti
];

class WshScript extends ScriptExpression {
    get scriptParam() {
        return this.children[0];
    }

    get outputScripts() {
        return this._payments.map(payment => payment.output);
    }

    get addresses() {
        return this._payments.map(payment => payment.address);
    }

    get _payments() {
        return this.scriptParam._payments.map(innerPayment => {
            try {
                return bitcoinLib.payments.p2wsh({
                    redeem: innerPayment,
                    network: this.network
                });
            }
            catch(err) {
                throw new Error(`Bitcoin output descriptor [WshScript#_payments]: error deriving P2WSH payment from redeem script (${Util.inspect(innerPayment.output)}): ${err}`);
            }
        });
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.wsh, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.script
            || !isValidInnerScriptType(this.children[0].scriptType)
        ) {
            throw new Error(`Bitcoin output descriptor [WshScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }
}

function isValidInnerScriptType(scriptType) {
    return INNER_SCRIPT_TYPES.some(type => type === scriptType);
}

module.exports = WshScript;
