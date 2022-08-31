# Bitcoin Output Descriptor

This Node.js library is used to handle Bitcoin output descriptors.

Particularly, it will parse any standard Bitcoin output descriptor (as defined
[here](https://github.com/bitcoin/bitcoin/blob/master/doc/descriptors.md#reference)) and generate output (or *pubkey*)
scripts and addresses that conform to that descriptor.

## Installation

```shell
npm install @blockchainofthings/btc-output-descriptor
```

## Usage

### Parsing an output descriptor

```javascript
const BtcOutDesc = require('@blockchainofthings/btc-output-descriptor');

const expression = BtcOutDesc.parse(
    "wpkh([d34db33f/44'/0'/0']xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL/1/*)",
    'main'
);
```

The second argument (`'main'` in the sample code above) is used to specify the Bitcoin network. Valid values:
`main` (or `bitcoin`), `testnet`, `signet`, and `regtest`.

> **Note**: if no Bitcoin network is specified, `'main'` is used.

### Setting a key range

When an output descriptor includes an extended (BIP32) public or private key with a derivation path that ends with `/*`
or `*'` (as in the sample code above), a key range should be specified to restrict the set of output scripts and
addresses that will be generated.

```javascript
if (expression.hasRangeKey) {
    expression.keyRange = {
        startIdx: 0,
        count: 10
    };
}
```

> **Note**: if not explicitly set, the key range will include 1,000 key sets starting at index 0.

### Generating output scripts

```javascript
console.log(expression.outputScripts);
```

Sample output:

```shell
[
  <Buffer 00 14 2a 05 c2 14 61 7c 9b 04 34 c9 2d 05 83 20 0a 85 ef 61 81 8f>,
  <Buffer 00 14 49 b2 f8 1e ea 1e cb 5b c9 7d 78 f2 d8 f8 9d 9c 86 1c 3c f2>,
  <Buffer 00 14 b6 37 5a 30 c7 83 3b 2f 28 e0 d5 5c 18 0d 12 b4 3d 4d fa a4>,
  <Buffer 00 14 12 c7 cd f9 3e 29 95 32 e2 39 c4 21 42 20 dd da cd 67 db 55>,
  <Buffer 00 14 17 c8 f3 69 b2 6c d7 70 ce b6 97 1e f5 ef a8 ff d7 c6 e1 47>,
  <Buffer 00 14 0c 80 19 20 b8 23 2b 35 01 76 28 dc e9 22 8c 8e 67 a4 75 41>,
  <Buffer 00 14 c1 d4 72 d4 eb 68 ea ac 57 0c 6a 93 54 1f 8b 78 75 b0 2e 8a>,
  <Buffer 00 14 e0 2d 77 0c a0 88 ba 08 4b 34 45 c5 b9 48 41 13 21 36 22 23>,
  <Buffer 00 14 3a 9a 28 8e f2 bd 4b 6d c5 2f 75 39 83 a4 7a ba 24 bf 57 37>,
  <Buffer 00 14 68 26 b6 a0 37 40 59 5d 21 50 92 94 5e 0b 50 5f 58 64 a3 74>
]
```

### Generating addresses

```javascript
console.log(expression.addresses);
```

Sample output:

```shell
[
  'bc1q9gzuy9rp0jdsgdxf95zcxgq2shhkrqv0wy2wek',
  'bc1qfxe0s8h2rm94hjta0red37yanjrpc08jxsjzhg',
  'bc1qkcm45vx8svaj728q64wpsrgjks75m74ytsz54h',
  'bc1qztrum7f79x2n9c3ecss5ygxamtxk0k643jyxh7',
  'bc1qzly0x6djdnthpn4kju00tmaglltudc284tpqgx',
  'bc1qpjqpjg9cyv4n2qtk9rwwjg5v3en6ga2pggr3sj',
  'bc1qc828948tdr42c4cvd2f4g8ut0p6mqt52gjal73',
  'bc1quqkhwr9q3zaqsje5ghzmjjzpzvsnvg3r8du84d',
  'bc1q82dz3rhjh49km3f0w5uc8fr6hgjt74ehgrzrcy',
  'bc1qdqntdgphgpv46g2sj229uz6stavxfgm5ck33lg'
]
```

> **Note**: in cases where no address is defined for that type of output—including `pk(...)`, `multi(...)`,
> `sortedmulti(...)`, and some `raw(...)` descriptors—an empty array is returned.

## License

This Node.js module is released under the [MIT License](LICENSE). Feel free to fork, and modify!

Copyright © 2021-2022, Blockchain of Things Inc.
