/**
 * Created by claudio on 2021-03-30
 */

const bitcoinLib = require('bitcoinjs-lib');
const expect = require('chai').expect;
const Expression = require('../src/Expression');
const KeyExpression = require('../src/KeyExpression');
const EcPairKey = require('../src/EcPairKey');

describe('Bitcoin output descriptor [EcPairKey]', function () {
    it('should successfully create new instance', function () {
        let expression;

        expect(() => {
            expression = new EcPairKey(
                bitcoinLib.networks.testnet,
                '[cc909d55]024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
                bitcoinLib.ECPair.fromPublicKey(
                    Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                    {
                        compressed: true,
                        network: bitcoinLib.networks.testnet
                    }
                ),
                {
                    fingerprint: 'cc909d55'
                }
            );
        }).to.not.throw();
        expect(expression).to.have.deep.property('network', bitcoinLib.networks.testnet);
        expect(expression).to.have.property('type', Expression.Type.key);
        expect(expression).to.have.property('keyType', KeyExpression.Type.ecPair);
        expect(expression).to.have.property(
            'text',
            '[cc909d55]024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2'
        );
        expect(expression).to.have.deep.property(
            'value',
            bitcoinLib.ECPair.fromPublicKey(
                Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                {
                    compressed: true,
                    network: bitcoinLib.networks.testnet
                }
            )
        );
        expect(expression).to.have.deep.property('origin', {
            fingerprint: 'cc909d55'
        });
    });

    it('should correctly return public keys', function () {
        const expression = new EcPairKey(
            bitcoinLib.networks.testnet,
            '024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2',
            bitcoinLib.ECPair.fromPublicKey(
                Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex'),
                {
                    compressed: true,
                    network: bitcoinLib.networks.testnet
                }
            )
        );

        expect(expression.publicKeys).to.deep.equal([
            Buffer.from('024278e860f61b8765513006c9c44a60c17238c81b57aa443f22f6c174d9637be2', 'hex')
        ]);
    });
});
