/**
 * Created by claudio on 2021-03-22
 */

const KeyExpression = require('./KeyExpression');

class EcPairKey extends KeyExpression {
    get publicKeys() {
        return [this.value.publicKey];
    }

    constructor(network, text, value, origin) {
        super(network, KeyExpression.Type.ecPair, text, value, origin);
    }
}

module.exports = EcPairKey;
