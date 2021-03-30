/**
 * Created by claudio on 2021-03-22
 */

const Expression = require('./Expression');
const ScriptExpression = require('./ScriptExpression');
const PkScript = require('./PkScript');
const PkhScript = require('./PkhScript');
const WpkhScript = require('./WpkhScript');
const ShScript = require('./ShScript');
const Util = require('./Util');

class ComboScript extends ScriptExpression {
    get keyParam() {
        return this.children[0];
    }

    get outputScripts() {
        return this.derivedScripts.reduce((list, script) => {
            return list.concat(script.outputScripts);
        }, []);
    }

    get addresses() {
        return this.derivedScripts.reduce((list, script) => {
            return list.concat(script.addresses);
        }, []);
    }

    get _payments() {
        return this.derivedScripts.reduce((list, script) => {
            return list.concat(script._payments);
        }, []);
    }

    constructor(network, text, value, children, checksum) {
        super(network, ScriptExpression.Type.combo, text, value, children, checksum);

        if (!this.hasChildren || this.children.length > 1 || this.children[0].type !== Expression.Type.key) {
            throw new TypeError(`Bitcoin output descriptor [ComboScript]: inconsistent child expressions; wrong number and/or type (${Util.inspect(children)})`);
        }

        this.derivedScripts = [
            new PkScript(network, text, null, children),
            new PkhScript(network, text, null, children)
        ];

        if (this.keyParam.isCompressedPubKey) {
            const wpkhScript = new WpkhScript(network, text, null, children);

            this.derivedScripts.push(wpkhScript);
            this.derivedScripts.push(new ShScript(network, text, null, [wpkhScript]));
        }
    }
}

module.exports = ComboScript;
