/**
 * Created by claudio on 2021-04-02
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const BtcOutDesc = require('../src/index');
const Expression = require('../src/Expression');
const ScriptExpression = require('../src/ScriptExpression');
const KeyExpression = require('../src/KeyExpression');
const AddrExpression = require('../src/AddrExpression');
const RawScript = require('../src/RawScript');
const {descriptorChecksum} = require('../src/Checksum');
const Options = require('../src/Options');

describe('Bitcoin output descriptor [index]', function () {
    it('exported object should have expected functionalities', function () {
        expect(BtcOutDesc).to.be.an('object');
        expect(BtcOutDesc).to.have.property('parse')
        .that.is.a('function');
        expect(BtcOutDesc).to.have.deep.property('computeChecksum', descriptorChecksum);
        expect(BtcOutDesc).to.have.deep.property('ExpressionType', Expression.Type);
        expect(BtcOutDesc).to.have.deep.property('ScriptType', ScriptExpression.Type);
        expect(BtcOutDesc).to.have.deep.property('KeyType', KeyExpression.Type);
        expect(BtcOutDesc).to.have.deep.property('AddrType', AddrExpression.Type);
        expect(BtcOutDesc).to.have.deep.property('globalOptions', Options);
    });

    it('should correctly set the Bitcoin network for parsing', function () {
        const testData = [
            // No network specified
            {
                name: undefined,
                network: bitcoinLib.networks.bitcoin
            },
            // Main network
            {
                name: 'main',
                network: bitcoinLib.networks.bitcoin
            },
            // Bitcoin network
            {
                name: 'bitcoin',
                network: bitcoinLib.networks.bitcoin
            },
            // Testnet network
            {
                name: 'testnet',
                network: bitcoinLib.networks.testnet
            },
            // Signet network
            {
                name: 'signet',
                network: bitcoinLib.networks.testnet
            },
            // Regtest network
            {
                name: 'regtest',
                network: bitcoinLib.networks.regtest
            },
            // Unknown network
            {
                name: 'bla',
                network: bitcoinLib.networks.bitcoin
            }
        ];

        testData.forEach(data => {
            const expression = BtcOutDesc.parse('raw(010203040506070809)', data.name);

            expect(expression).to.be.an.instanceOf(RawScript);
            expect(expression.network).to.deep.equal(data.network);
        });
    });
});
