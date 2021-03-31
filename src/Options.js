/**
 * Created by claudio on 2021-03-29
 */

const DEFAULT = {
    ignoreNonexistentPathIndex: true
}

class Options {
    static _ignoreNonexistentPathIndex = DEFAULT.ignoreNonexistentPathIndex;

    static get ignoreNonexistentPathIndex() {
        return Options._ignoreNonexistentPathIndex;
    }

    static setOptions(options) {
        options = options || {};

        if (typeof options.ignoreNonexistentPathIndex === 'boolean') {
            Options._ignoreNonexistentPathIndex = options.ignoreNonexistentPathIndex;
        }
    }

    static reset() {
        Options._ignoreNonexistentPathIndex = DEFAULT.ignoreNonexistentPathIndex;
    }
}

module.exports = Options;
