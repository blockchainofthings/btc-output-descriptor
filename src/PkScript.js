/**
 * Created by claudio on 2021-03-22
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Util = require('./Util');

class PkScript extends ScriptExpression {
    get keyParam() {
        return this.children[0];
    }

    get outputScripts() {
        return this._payments.map(payment => payment.output);
    }

    get addresses() {
        // Return a empty list since no address is defined for P2PK output
        return [];
    }

    get _payments() {
        return this.keyParam.publicKeys.map(pubKey => {
            try {
                return bitcoinLib.payments.p2pk({
                    pubkey: pubKey,
                    network: this.network
                });
            }
            catch(err) {
                throw new Error(`Bitcoin output descriptor [PkScript#_payments]: error deriving P2PK payment from public key (${Util.inspect(pubKey)}): ${err}`);
            }
        });
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.pk, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.key) {
            throw new Error(`Bitcoin output descriptor [PkScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }
}

module.exports = PkScript;
