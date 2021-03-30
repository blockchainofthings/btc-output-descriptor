/**
 * Created by claudio on 2021-03-22
 */

const KeyExpression = require('./KeyExpression');
const Options = require('./Options');
const Util = require('./Util');

const WILDCARD_TYPE = Object.freeze({
    'unhardened': 'unhardened',
    'hardened': 'hardened'
});

class ExtPairKey extends KeyExpression {
    static get WildcardType() {
        return WILDCARD_TYPE;
    }

    get keyRange() {
        return this._keyRange;
    }

    set keyRange(val) {
        if (this.fromRange) {
            if (!Util.isValidKeyRange(val)) {
                throw new TypeError(`Bitcoin output descriptor [ExtPairKey#set(keyRange)]: invalid key range (${Util.inspect(val)})`);
            }

            this._keyRange = val;
        }
    }

    get publicKeys() {
        return this.fromRange ? this._pubKeysFromRange() : [this.value.publicKey];
    }

    constructor(network, text, value, origin, pathWildcard) {
        super(network, KeyExpression.Type.extPair, text, value, origin);

        if (!isValidWildcardType(pathWildcard)) {
            throw new TypeError(`Bitcoin output descriptor [ExtPairKey]: invalid \'pathWildcard\' argument (${pathWildcard})`);
        }

        this.pathWildcard = pathWildcard;
        // Set default key range
        this._keyRange = this.fromRange ? {
            startIdx: 0,
            count: 1001
        } : undefined;
    }

    _pubKeysFromRange() {
        let pubKeys = [];

        if (this._keyRange) {
            const isHardened = this.pathWildcard === ExtPairKey.WildcardType.hardened;

            for (let idx = this._keyRange.startIdx, lastIdx = idx + this._keyRange.count - 1; idx <= lastIdx; idx++) {
                let derivedExtKeyPair;

                try {
                    derivedExtKeyPair = isHardened ? this.value.deriveHardened(idx) : this.value.derive(idx);
                }
                catch (err) {
                    throw new Error(`Bitcoin output descriptor [ExtPairKey#_pubKeysFromRange]: error deriving extended key: ${err}`);
                }

                pubKeys.push(
                    Options.ignoreNonexistentPathIndex || derivedExtKeyPair.index === KeyExpression.realPathIndex(idx, isHardened)
                    ? derivedExtKeyPair.publicKey
                    : undefined
                );
            }
        }

        return pubKeys;
    }
}

function isValidWildcardType(type) {
    return type === undefined || Object.values(WILDCARD_TYPE).some(name => name === type);
}

module.exports = ExtPairKey;
