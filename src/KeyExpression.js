/**
 * Created by claudio on 2021-03-18
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const Options = require('./Options');
const Util = require('./Util');

const TYPE = Object.freeze({
    ecPair: 'ecPair',
    extPair: 'extPair'
});

class KeyExpression extends Expression {
    static get Type() {
        return TYPE;
    }

    get fromRange() {
        return this.keyType === KeyExpression.Type.extPair && this.pathWildcard !== undefined;
    }

    get isCompressedPubKey() {
        return this.value.compressed;
    }

    constructor(network, keyType, text, value, origin) {
        super(network, Expression.Type.key, text, value);

        if (!isValidType(keyType)) {
            throw new Error(`Bitcoin output descriptor [KeyExpression]: invalid \'keyType\' argument (${keyType})`);
        }

        if (!Util.isNullArg(origin) && !isValidOrigin(origin)) {
            throw new Error(`Bitcoin output descriptor [KeyExpression]: invalid \'origin\' argument (${origin})`);
        }

        this.keyType = keyType;
        this.origin = origin;
    }

    static parse(network, text) {
        const regExp = Util.concatRegExp(
            /^(?<origin>\[(?<fingerprint>[A-Fa-f0-9]{8})(?<origin_path>(?:\/\d+['h]?)+)?])?/,
            /(?<key>[A-Za-z0-9]{4,})(?<derive_path>(?:\/\d+['h]?)*(?:\/\*['h]?)?)?$/
        );

        const matchResult = text.match(regExp);

        if (!matchResult) {
            throw new Error(`Bitcoin output descriptor [KeyExpression#parse]: invalid key expression (${text})`);
        }

        let origin;

        if (matchResult.groups.origin) {
            origin = {
                fingerprint: matchResult.groups.fingerprint
            };

            if (matchResult.groups.origin_path) {
                origin.path = matchResult.groups.origin_path;
            }
        }

        // Try to parse key
        if (matchResult.groups.key.match(/^[xt](?:pub)|(?:prv)/)) {
            // Parse extended key pair
            let extKeyPair;

            try {
                extKeyPair = bitcoinLib.bip32.fromBase58(matchResult.groups.key, network);
            }
            catch (err) {
                throw new Error(`Bitcoin output descriptor [KeyExpression#parse]: invalid extended key (${matchResult.groups.key})`);
            }

            const ExtPairKey = require('./ExtPairKey');
            let pathWildcard = undefined;

            if (matchResult.groups.derive_path) {
                matchResult.groups.derive_path.slice(1).split('/').forEach(term => {
                    let isHardened = false;

                    if (term.match(/['h]$/)) {
                        isHardened = true;
                        term = term.slice(0, - 1);
                    }

                    if (term === "*") {
                        pathWildcard = isHardened ? ExtPairKey.WildcardType.hardened : ExtPairKey.WildcardType.unhardened;
                    }
                    else {
                        // Derive extended key
                        const index = Number.parseInt(term);

                        try {
                            extKeyPair = isHardened ? extKeyPair.deriveHardened(index) : extKeyPair.derive(index);
                        }
                        catch (err) {
                            throw new Error(`Bitcoin output descriptor [KeyExpression#parse]: error deriving extended key: ${err}`);
                        }

                        if (!Options.ignoreNonexistentPathIndex
                            && extKeyPair.index !== KeyExpression.realPathIndex(index, isHardened)
                        ) {
                            throw new Error(
                                `Bitcoin output descriptor [KeyExpression#parse]: error deriving extended key: nonexistent index (${pathIndexToString(index, isHardened)})`
                            );
                        }
                    }
                });
            }

            return new ExtPairKey(network, text, extKeyPair, origin, pathWildcard);
        }
        else{
            // Elliptic curve pair
            let ecPair;

            if (matchResult.groups.key.match(/^0[234]/)) {
                // Parse public key
                if (Util.isHexText(matchResult.groups.key)) {
                    try {
                        const keyBuf = Buffer.from(matchResult.groups.key, 'hex');

                        ecPair = bitcoinLib.ECPair.fromPublicKey(
                            keyBuf,
                            {
                                compressed: keyBuf[0] !== 0x04,
                                network
                            }
                        );
                    }
                    catch (err) {}
                }

                if (!ecPair) {
                    throw new Error(`Bitcoin output descriptor [KeyExpression#parse]: invalid public key (${matchResult.groups.key})`);
                }
            }
            else {
                // Parse (WIF formatted) private key
                try {
                    ecPair = bitcoinLib.ECPair.fromWIF(matchResult.groups.key, network);
                }
                catch (err) {
                    throw new Error(`Bitcoin output descriptor [KeyExpression#parse]: invalid (WIF formatted) private key (${matchResult.groups.key})`);
                }
            }

            return new (require('./EcPairKey'))(network, text, ecPair, origin);
        }
    }

    static realPathIndex(idx, isHardened = false) {
        return isHardened ? idx + 0x80000000 : idx;
    }
}

function isValidType(type) {
    return Object.values(TYPE).some(name => name === type);
}

function isValidOrigin(obj) {
    return typeof obj === 'object' && obj !== null && obj.hasOwnProperty('fingerprint')
        && typeof obj.fingerprint === 'string'
        && (!obj.hasOwnProperty('path') || typeof obj.path === 'string');
}

function pathIndexToString(idx, isHardened = false) {
    return isHardened ? `${idx}\'` : `${idx}`;
}

module.exports = KeyExpression;
