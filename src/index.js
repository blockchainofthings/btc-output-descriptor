/**
 * Created by claudio on 2021-03-23
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const KeyExpression = require('./KeyExpression');
const AddrExpression = require('./AddrExpression');
const {descriptorChecksum} = require('./Checksum');
const Options = require('./Options');

function parse(text, network) {
    if (typeof network !== 'string') {
        network = '';
    }

    switch (network) {
        case 'main':
        case 'bitcoin':
        default:
            network = bitcoinLib.networks.bitcoin;
            break;

        case 'testnet':
        case 'signet':
            network = bitcoinLib.networks.testnet;
            break;

        case 'regtest':
            network = bitcoinLib.networks.regtest;
            break
    }

    return ScriptExpression.parse(network, text);
}

module.exports = {
    parse,
    computeChecksum: descriptorChecksum,
    ExpressionType: Expression.Type,
    ScriptType: ScriptExpression.Type,
    KeyType: KeyExpression.Type,
    AddrType: AddrExpression.Type,
    globalOptions: Options
};
