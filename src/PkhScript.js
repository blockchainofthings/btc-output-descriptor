/**
 * Created by claudio on 2021-03-22
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Options = require('./Options');
const Util = require('./Util');

class PkhScript extends ScriptExpression {
    get keyParam() {
        return this.children[0];
    }

    get outputScripts() {
        return this._payments.map(payment => payment.output);
    }

    get addresses() {
        return this._payments.map(payment => payment.address);
    }

    get _payments() {
        let filterList = false;
        let lastPubKey;

        const payments = this.keyParam.publicKeys.map(pubKey => {
            if (Options.ignoreNonexistentPathIndex) {
                if (lastPubKey && Util.pubKeyEquals(pubKey, lastPubKey)) {
                    filterList = true;
                    return null;
                }
                else {
                    lastPubKey = pubKey;
                }
            }
            else {
                if (pubKey === undefined) {
                    filterList = true;
                    return null;
                }
            }

            try {
                return bitcoinLib.payments.p2pkh({
                    pubkey: pubKey,
                    network: this.network
                });
            }
            catch(err) {
                throw new Error(`Bitcoin output descriptor [PkhScript#_payments]: error deriving P2PKH payment from public key (${Util.inspect(pubKey)}): ${err}`);
            }
        });

        return filterList ? payments.filter(payment => payment !== null) : payments;
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.pkh, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.key) {
            throw new Error(`Bitcoin output descriptor [PkhScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }
}

module.exports = PkhScript;
