# encode32 [![Build Status](https://secure.travis-ci.org/femto113/node-encode32.png)](http://travis-ci.org/femto113/node-encode32)

This is a Base-32 encoding for numbers inspired by [Douglas Crockford](http://www.crockford.com/wrmg/base32.html)

This encoding is designed to balance compactness with human-friendliness and robustness.
It uses 32 digits, the standard numbers and 22 alphabetic characters.
It is case insensitive and characters easily confused by humans are accepted as aliases for
some digits (e.g. l and I for 1, o for 0, etc).  U is excluded so you can avoid certain common
obscenities.

A 32-bit unsigned integer will encode into 7 base-32 (5-bit) digits (left padded
with 0 as needed).  Rather than use an additional check character as suggested in
the original source, we fill the otherwise unused bits of the final character to
with a 3-bit parity checksum.  This feature makes it incompatible with other implementations
of this encoding scheme, but allows for quick sanity checks for transcribed numbers without
the increased length or additional alphabet required by Crockford's "mod 37 checksum" approach.

Fixed length encoders for 32 and 41 bit numbers (big enough for JavaScript timestamps) are exported by
default, but the library provides generators that should work up to 53 bits (the largest integers Javascript
can easily represent).  Any slop bits will be used for parity checks.  A variable length encoder that doesn't
include a checksum is also provided.  You can even construct an encoder that uses their own
alphabet if the default is somehow lacking for your purpose.

## Install

    npm install encode32

or

    git clone http://github.com/femto113/node-encode32.git
    cd encode32
    npm link

## Example

    var enc = require("./encode32");

    var a = enc.encode32(123456772);
    // a == "0XDWT16"

    // can change case or substitute 1's and 0's without problem
    var b = [
      "0xdwt16", // lower case
      "oXDWTi6", // o for 0 and i for 1
      "OxDwtL6"  // O for 0 and L for 1
    ].map(function (s) { return enc.decode32(s); });
    // b == [123456772, 123456772, 123456772]

    // but break the parity check and you get NaN
    var c = [
      "0XDWT18", // incorrect final digit
      "X0DWT16", // transposed digits
      "0XDT16"   // missing digit
    ].map(function (s) { return enc.decode32(s); });
    // c == [NaN, NaN, NaN]

    // can also encode a date into 9 digits (if none passed constructs one)
    var d = enc.encodeDate();
    // d == 'KEFFVXH1T' (at this moment anyway)

## TODO

- more examples, better documentation
- needs performance work (probably should port to C++)
- should provide versions without parity bits and with checksum for
  compatibility with [other implementations](https://github.com/gbarr/Encode-Base32-Crockford)
