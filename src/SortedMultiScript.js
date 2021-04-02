/**
 * Created by claudio on 2021-03-22
 */

const MultiScript = require('./MultiScript');

class SortedMultiScript extends MultiScript {
    get _publicKeySets() {
        return this._getPublicKeySets().map(keySet => keySet !== undefined ? sortKeys(keySet) : keySet);
    }

    constructor(network, text, value, children, checksum) {
        super(network, text, value, children, checksum, true);

        // Make sure that all keys are compressed
        this.keyParams.forEach((key, idx) => {
            if (!key.isCompressedPubKey) {
                throw new Error(`Bitcoin output script [SortedMultiScript]: unsupported key format; key #${idx + 1} uncompressed`);
            }
        });
    }
}

function sortKeys(keySet) {
    return keySet.sort((a, b) => a.toString('hex').localeCompare(b.toString('hex'), 'en'));
}

module.exports = SortedMultiScript;
