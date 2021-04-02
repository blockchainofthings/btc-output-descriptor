/**
 * Created by claudio on 2021-03-19
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Util = require('./Util');

class RawScript extends ScriptExpression {
    get hexParam() {
        return this.children[0];
    }

    get outputScripts() {
        return [this.hexParam.value];
    }

    get addresses() {
        try {
            return this._payments
            // Filter out outputs with no defined address (i.e. P2PK, P2MS and null data)
            .filter(payment => !!payment.address)
            .map(payment => payment.address);
        }
        catch (err) {
            // Non-standard output script. Return an empty list
            return [];
        }
    }

    get _payments() {
        try {
            return [
                bitcoinLib.payments.p2wpkh({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        try {
            return [
                bitcoinLib.payments.p2pkh({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        try {
            return [
                bitcoinLib.payments.p2wsh({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        try {
            return [
                bitcoinLib.payments.p2sh({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        try {
            return [
                bitcoinLib.payments.p2pk({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        try {
            return [
                bitcoinLib.payments.p2ms({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        try {
            return [
                bitcoinLib.payments.embed({
                    output: this.hexParam.value,
                    network: this.network
                })
            ];
        }
        catch (e) {}

        throw new Error(`Bitcoin output descriptor [RawScript#_payments]: non-standard output script (${Util.inspect(this.hexParam.value)})`);
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.raw, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.hex) {
            throw new TypeError(`Bitcoin output descriptor [RawScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }
}

module.exports = RawScript;
