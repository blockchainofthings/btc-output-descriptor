/**
 * Created by claudio on 2021-03-23
 */

const INPUT_CHARSET = '0123456789()[],\'/*abcdefgh@:$%{}'
    + 'IJKLMNOPQRSTUVWXYZ&+-.;<=>?!^_|~'
    + 'ijklmnopqrstuvwxyzABCDEFGH`#"\\ ';
const CHECKSUM_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polyMod(c, val)
{
    const c0 = BigInt.asUintN(8, c >> 35n);
    c = BigInt.asUintN(64,((c & 0x7ffffffffn) << 5n) ^ val);

    if (c0 & 1n) c ^= 0xf5dee51989n;
    if (c0 & 2n) c ^= 0xa9fdca3312n;
    if (c0 & 4n) c ^= 0x1bab10e32dn;
    if (c0 & 8n) c ^= 0x3706b1677an;
    if (c0 & 16n) c ^= 0x644d626ffdn;

    return c;
}

function descriptorChecksum(text)
{
    let c = 1n;
    let cls = 0n;
    let clsCount = 0;

    for (let ch of text) {
        const pos = BigInt(INPUT_CHARSET.indexOf(ch));

        if (pos === -1n) {
            return '';
        }

        c = polyMod(c, pos & 31n); // Emit a symbol for the position inside the group, for every character.
        cls = cls * 3n + (pos >> 5n); // Accumulate the group numbers

        if (++clsCount === 3) {
            // Emit an extra symbol representing the group numbers, for every 3 characters.
            c = polyMod(c, cls);
            cls = 0n;
            clsCount = 0;
        }
    }

    if (clsCount > 0) {
        c = polyMod(c, cls);
    }

    for (let j = 0; j < 8; ++j) {
        c = polyMod(c, 0n); // Shift further to determine the checksum.
    }

    c ^= 1n; // Prevent appending zeroes from not affecting the checksum.

    let ret = '';

    for (let j = 0n; j < 8n; ++j) {
        ret += CHECKSUM_CHARSET[(c >> (5n * (7n - j))) & 31n];
    }

    return ret;
}

function isValidChecksum(checksum) {
    return typeof checksum === 'string' && new RegExp(`^[${CHECKSUM_CHARSET}]{8}\$`).test(checksum);
}

module.exports = {
    descriptorChecksum,
    isValidChecksum
};
