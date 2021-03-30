/**
 * Created by claudio on 2021-03-22
 */

const bitcoinLib = require('bitcoinjs-lib');
const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const Options = require('./Options');
const Util = require('./Util');

class MultiScript extends ScriptExpression {
    get nSigParam() {
        return this.children[0];
    }

    get keyParams() {
        return this.children.slice(1);
    }

    get outputScripts() {
        return this._payments.map(payment => payment.output);
    }

    get addresses() {
        // Return a empty list since no address is defined for P2MS output
        return [];
    }

    get _payments() {
        let filterList = false;
        let lastPubKeys;

        const payments = this._publicKeySets.map(pubKeys => {
            if (Options.ignoreNonexistentPathIndex) {
                if (lastPubKeys && Util.pubKeySetEquals(pubKeys, lastPubKeys)) {
                    filterList = true;
                    return null;
                }
                else {
                    lastPubKeys = pubKeys;
                }
            }
            else {
                if (pubKeys === undefined) {
                    filterList = true;
                    return null;
                }
            }

            try {
                return bitcoinLib.payments.p2ms({
                    m: this.nSigParam.value,
                    pubkeys: pubKeys,
                    network: this.network
                });
            }
            catch(err) {
                throw new Error(`Bitcoin output descriptor [MultiScript#_payments]: error deriving P2MS payment from public keys (${Util.inspect(pubKeys)}): ${err}`);
            }
        });

        return filterList ? payments.filter(payment => payment !== null) : payments;
    }

    get _publicKeySets() {
        return this._getPublicKeySets();
    }

    constructor(network, text, value, children, checksum, sorted = false) {
        super(
            network,
            sorted ? ScriptExpression.Type.sortedmulti : ScriptExpression.Type.multi,
            text,
            value,
            children,
            checksum
        );

        if (!this.hasChildren || this.children.length < 2 || this.children[0].type !== Expression.Type.number
            || this.children.slice(1).some(child => child.type !== Expression.Type.key)
        ) {
            throw new TypeError(`Bitcoin output descriptor [MultiScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }
    }

    _getPublicKeySets() {
        let keySets = [];

        const keyRange = this.keyRange;
        const pubKeysByKey = new Map();

        for (let rangeIdx = keyRange ? keyRange.startIdx : 0, lastIdx = keyRange ? rangeIdx + keyRange.count - 1 : 0;
             rangeIdx <= lastIdx; rangeIdx++
        ) {
            let isKeySetValid = true;

            const keySet = this.keyParams.reduce((set, key) => {
                if (key.fromRange) {
                    let pubKeys;

                    if (pubKeysByKey.has(key)) {
                        pubKeys = pubKeysByKey.get(key);
                    }
                    else {
                        pubKeys = key.publicKeys;
                        pubKeysByKey.set(key, pubKeys);
                    }

                    const pubKey = pubKeys[rangeIdx];

                    if (!pubKey) {
                        // Public key not defined for that key range/path index.
                        //  Invalidate the whole set
                        isKeySetValid = false;
                    }
                    else {
                        set.push(pubKey);
                    }
                }
                else {
                    set.push(key.publicKeys[0]);
                }

                return set;
            }, []);

            keySets.push(isKeySetValid? keySet : undefined);
        }

        return keySets;
    }
}

module.exports = MultiScript;
