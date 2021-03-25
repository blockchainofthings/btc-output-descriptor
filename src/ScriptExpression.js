/**
 * Created by claudio on 2021-03-18
 */

const Expression = require('./Expression');
const KeyExpression = require('./KeyExpression');
const AddrExpression = require('./AddrExpression');
const HexExpression = require('./HexExpression');
const NumberExpression = require('./NumberExpression');
const {
    descriptorChecksum,
    isValidChecksum
} = require('./Checksum');
const Util = require('./Util');

const TYPE = Object.freeze({
    sh: 'sh',
    wsh: 'wsh',
    pk: 'pk',
    pkh: 'pkh',
    wpkh: 'wpkh',
    combo: 'combo',
    multi: 'multi',
    sortedmulti: 'sortedmulti',
    addr: 'addr',
    raw: 'raw'
});
const ANY_TYPE = '_any';
const ROOT_REG_EXP_FORMAT = '^(?<script>![reg_exp_format])(?:#(?<checksum>[a-z0-9]{8}))?$';
const REG_EXP_FORMAT = '^(?<type>![token_list])\\((?<args>[^,]+(?:,[^,]+)*)\\)$';
const CHECK_REG_EXP_FORMAT = `^(?:${(types => types.join('|'))(Object.values(TYPE))})\\(`;

class ScriptExpression extends Expression {
    static get Type() {
        return TYPE;
    }

    get hasChecksum() {
        return !!this.checksum;
    }

    get hasRangeKey() {
        if (this.scriptParam) {
            return this.scriptParam.hasRangeKey;
        }

        return this.hasChildren && this.children.some(child => child.type === Expression.Type.key && child.fromRange);
    }

    get keyRange() {
        if (this.scriptParam) {
            return this.scriptParam.keyRange;
        }

        let keyRange;

        this._rangeKeys.forEach((key, idx) => {
            if (!keyRange) {
                keyRange = key.keyRange;
            }
            else {
                // Make sure that key range are the same for all range keys
                if (!Util.keyRangeEquals(key.keyRange, keyRange)) {
                    throw new Error(`Bitcoin output descriptor [ScriptExpression#get(keyRange)]: key range mismatch; key #1: ${Util.inspect(keyRange)}, key #${idx + 1}: ${Util.inspect(key.keyRange)}`);
                }
            }
        });

        return keyRange;
    }

    set keyRange(range) {
        if (this.scriptParam) {
            this.scriptParam.keyRange = range;
        }
        else {
            this._rangeKeys.forEach(key => key.keyRange = range);
        }
    }

    get _rangeKeys() {
        return this.scriptParam ? this.scriptParam._rangeKeys
            : (
                this.hasChildren ? this.children.filter(child => child.type === Expression.Type.key && child.fromRange)
                    : []
            );
    }

    constructor(network, scriptType, text, value, children, checksum) {
        super(network, Expression.Type.script, text, value, children);

        if (!isValidType(scriptType)) {
            throw new Error(`Bitcoin output descriptor [ScriptExpression]: invalid \'scriptType\' argument (${scriptType})`);
        }

        if (checksum !== undefined && !isValidChecksum(checksum)) {
            throw new Error(`Bitcoin output descriptor [ScriptExpression]: invalid \'checksum\' argument (${checksum})`);
        }

        this.scriptType = scriptType;
        this.checksum = checksum;
    }

    static parse(network, text, parentScriptType) {
        if (!Util.isNullArg(parentScriptType) && !isValidType(parentScriptType)) {
            throw new Error(`Bitcoin output descriptor [ScriptExpression#parse]: invalid \'parentScriptType\' argument (${parentScriptType})`);
        }

        const regExp = scriptRegExp(parentScriptType);
        const matchResult = text.match(regExp);

        if (!matchResult) {
            throw new Error(`Bitcoin output descriptor [ScriptExpression#parse]: no matching text (${text}); regex: ${regExp}`);
        }

        let checksum;

        if (matchResult.groups.checksum) {
            // Validate checksum
            let calculatedChecksum;

            if (matchResult.groups.checksum !== (calculatedChecksum = descriptorChecksum(matchResult.groups.script))) {
                throw new Error(`Bitcoin output descriptor [ScriptExpression#parse]: invalid checksum (${matchResult.groups.checksum}); expected '${calculatedChecksum}'`);
            }

            checksum = matchResult.groups.checksum;
        }

        const scriptType = matchResult.groups.type;
        let args = matchResult.groups.args;

        args = isScriptArg(args) ? [args] : args.split(',');

        const argTypes = SCRIPT_INFO[scriptType].argTypes;

        if (args.length < argTypes) {
            throw new Error(`Bitcoin output descriptor [ScriptExpression#parse]: missing arguments; expected: ${argTypes.length}, got: ${args.length}`);
        }

        // Try to parse arguments
        let lastArgType;

        const children = args.reduce((list, arg, idx) => {
            if (idx < argTypes.length) {
                lastArgType = argTypes[idx];
            }

            let childExpression;

            try {
                childExpression = lastArgType.parse(network, arg, scriptType);
            }
            catch (err) {
                throw new Error(`Bitcoin output descriptor [StringExpression#parse]: error parsing argument #${idx + 1} (${arg}): ${err}`);
            }

            list.push(childExpression);

            return list;
        }, []);

        let script;

        switch (scriptType) {
            case ScriptExpression.Type.sh:
                script = new (require('./ShScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.wsh:
                script = new (require('./WshScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.pk:
                script = new (require('./PkScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.pkh:
                script = new (require('./PkhScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.wpkh:
                script = new (require('./WpkhScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.combo:
                script = new (require('./ComboScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.multi:
                script = new (require('./MultiScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.sortedmulti:
                script = new (require('./SortedMultiScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.addr:
                script = new (require('./AddrScript'))(network, text, null, children, checksum);
                break;

            case ScriptExpression.Type.raw:
                script = new (require('./RawScript'))(network, text, null, children, checksum);
                break;

            default:
                throw new Error(`Bitcoin output descriptor [ScriptExpression#parse]: unknown script type (${scriptType})`);
        }

        return script;
    }
}

// Note: this is declared here because it requires that ScriptExpression be already declared
const SCRIPT_INFO = Object.freeze({
    sh: {
        token: 'sh',
        parentExclude: [
            ANY_TYPE
        ],
        argTypes: [
            ScriptExpression
        ]
    },
    wsh: {
        token: 'wsh',
        parentExclude: [
            'wsh'
        ],
        argTypes: [
            ScriptExpression
        ]
    },
    pk: {
        token: 'pk',
        parentExclude: [],
        argTypes: [
            KeyExpression
        ]
    },
    pkh: {
        token: 'pkh',
        parentExclude: [],
        argTypes: [
            KeyExpression
        ]
    },
    wpkh: {
        token: 'wpkh',
        parentExclude: [
            'wsh'
        ],
        argTypes: [
            KeyExpression
        ]
    },
    combo: {
        token: 'combo',
        parentExclude: [
            ANY_TYPE
        ],
        argTypes: [
            KeyExpression
        ]
    },
    multi: {
        token: 'multi',
        parentExclude: [],
        argTypes: [
            NumberExpression,
            KeyExpression
        ]
    },
    sortedmulti: {
        token: 'sortedmulti',
        parentExclude: [],
        argTypes: [
            NumberExpression,
            KeyExpression
        ]
    },
    addr: {
        token: 'addr',
        parentExclude: [
            ANY_TYPE
        ],
        argTypes: [
            AddrExpression
        ]
    },
    raw: {
        token: 'raw',
        parentExclude: [
            ANY_TYPE
        ],
        argTypes: [
            HexExpression
        ]
    }
});

function isValidType(type) {
    return Object.values(TYPE).some(name => name === type);
}

function scriptRegExp(parentScript) {
    const tokenList = Object.values(TYPE).reduce((list, type) => {
        const scriptInfo = SCRIPT_INFO[type];

        if (canBeChildScript(scriptInfo, parentScript)) {
            list.push(scriptInfo.token);
        }

        return list;
    }, []);

    const regExpFormat = !parentScript
        ? ROOT_REG_EXP_FORMAT.replace('![reg_exp_format]', REG_EXP_FORMAT.slice(1, -1))
        : REG_EXP_FORMAT;

    return new RegExp(regExpFormat.replace('![token_list]', tokenList.join('|')));
}

function canBeChildScript(scriptInfo, parentScript) {
    return !parentScript || scriptInfo.parentExclude.length === 0
        || scriptInfo.parentExclude[0] !== ANY_TYPE
        || scriptInfo.parentExclude.every(type => type !== parentScript.scriptType);
}

function isScriptArg(arg) {
    return new RegExp(CHECK_REG_EXP_FORMAT).test(arg);
}

module.exports = ScriptExpression;
