/**
 * Created by claudio on 2021-03-18
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');

const TYPE = Object.freeze({
    p2pkh: 'p2pkh',
    p2sh: 'p2sh',
    p2wpkh: 'p2wpkh',
    p2wsh: 'p2wsh'
});

class AddrExpression extends Expression {
    static get Type() {
        return TYPE;
    }

    constructor(network, addrType, text, value) {
        super(network, Expression.Type.addr, text, value);

        if (!isValidType(addrType)) {
            throw new Error(`Bitcoin output descriptor [AddrExpression]: invalid \'addrType\' argument (${addrType})`);
        }

        this.addrType = addrType;
    }

    static parse(network, text) {
        // Try to parse address
        let payment;

        try {
            payment = bitcoinLib.payments.p2wpkh({
                address: text,
                network
            });
        }
        catch (e) {}

        if (payment) {
            return new AddrExpression(network, AddrExpression.Type.p2wpkh, text, payment);
        }

        try {
            payment = bitcoinLib.payments.p2pkh({
                address: text,
                network
            });
        }
        catch (e) {}

        if (payment) {
            return new AddrExpression(network, AddrExpression.Type.p2pkh, text, payment);
        }

        try {
            payment = bitcoinLib.payments.p2wsh({
                address: text,
                network
            });
        }
        catch (e) {}

        if (payment) {
            return new AddrExpression(network, AddrExpression.Type.p2wsh, text, payment);
        }

        try {
            payment = bitcoinLib.payments.p2sh({
                address: text,
                network
            });
        }
        catch (e) {}

        if (payment) {
            return new AddrExpression(network, AddrExpression.Type.p2sh, text, payment);
        }

        throw new Error(`Bitcoin output descriptor [AddrExpression#parse]: invalid bitcoin address (${text})`);
    }
}

function isValidType(type) {
    return Object.values(TYPE).some(name => name === type);
}

module.exports = AddrExpression;
