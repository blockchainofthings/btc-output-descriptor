/**
 * Created by claudio on 2021-03-30
 */

const expect = require('chai').expect;
const Options = require('../src/Options');

describe('Bitcoin output descriptor [Options]', function () {
    it('should correctly defined default options', function () {
        expect(Options.ignoreNonexistentPathIndex).to.be.true;
    });

    it('should correctly set options', function () {
        Options.setOptions({
            ignoreNonexistentPathIndex: false
        });

        expect(Options.ignoreNonexistentPathIndex).to.be.false;
    });

    it('should correctly reset options', function () {
        Options.reset();

        expect(Options.ignoreNonexistentPathIndex).to.be.true;
    });

    it('should not set options if nothing is passed', function () {
        Options.reset();
        Options.setOptions();

        expect(Options.ignoreNonexistentPathIndex).to.be.true;
    });
});
