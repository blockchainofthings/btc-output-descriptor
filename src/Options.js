/**
 * Created by claudio on 2021-03-29
 */

class Options {
    static _ignoreNonexistentPathIndex = true;

    static get ignoreNonexistentPathIndex() {
        return Options._ignoreNonexistentPathIndex;
    }

    static setOptions(options) {
        options = options || {};

        if (typeof options.ignoreNonexistentPathIndex === 'boolean') {
            Options._ignoreNonexistentPathIndex = options.ignoreNonexistentPathIndex;
        }
    }
}

module.exports = Options;
