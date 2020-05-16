// encode32: Base32 encoding for 32-bit numbers inspired by Douglas Crockford
// cf. http://www.crockford.com/wrmg/base32.html
//
// This encoding uses 32 digits, the standard numbers and 22 alphabetic characters.
// Easily confused characters are accepted as aliases for some digits (e.g. l for 1).
// U is excluded so you don't wind up with certain common obscenities.
//
// All 32-bit unsigned integers will encode into 7 base-32 (5-bit) digits.
// Rather than use an additional check character as suggested in the original source,
// we use the otherwise unused bits of the final character to store a 3-bit parity
// checksum.
//
// TODO: needs performance work (probably should port to C++)

// generate method convert a number to an array of words of given size using string conversion magic
function wordify(bits)
{
  var radix = Math.pow(2, bits);
  return function (num) { return num.toString(radix).split('').map(function (a) { return parseInt(a, radix); }); };
}

// generate parity method for given number of bits (using xor, or can pass custom reducer)
function paritify(bits, reducer)
{
  if (!reducer) reducer = function (a, b) { return a ^ b; };
  var words = wordify(bits);
  return function (num) { return words(num).reduce(reducer); }
}

// calculate 3 bit parity of number
var parity3 = paritify(3);

function Encoder(digits, aliases)
{
  // TODO: throw if length of opts.digits != 32, or contains dupes?
 
  this.bitsPerDigit = Math.log(digits.length) / Math.LN2;

  this.encode_table = digits.toUpperCase().split('');
  this.decode_table = new Array(256);
  for (var c = 0; c < 256; c++) {
    var s = String.fromCharCode(c);
    if (aliases && s in aliases) s = aliases[s];
    var i = digits.indexOf(s.toUpperCase());
    this.decode_table[c] = i >= 0 && ("00000000" + i.toString(2)).substr(-this.bitsPerDigit);
  }

  // bind the prototype's encode_word/decode_char methods to ourself so they work in map()
  this.encode_word = this.encode_word.bind(this);
  this.decode_char = this.decode_char.bind(this);
}

Encoder.prototype.encode_word = function (w) { return this.encode_table[w] };
Encoder.prototype.decode_char = function (c) { return this.decode_table[c.charCodeAt()]; };

// generate a function that encodes a number with a given number of bits to a fixed length and uses any extra bits for parity
Encoder.prototype.fixedEncoder = function (bitsPerNumber) {
  var digitsPerNumber = Math.ceil(bitsPerNumber / this.bitsPerDigit);
  var parityBits = digitsPerNumber * this.bitsPerDigit - bitsPerNumber;
  if (parityBits > 0) {
    var parityB = paritify(parityBits);
    return function (n) {
      var parity = parityB(n).toString(2).split('');
      while (parity.length < parityBits) parity.unshift('0');
      var bits = n.toString(2).split('').concat(parity);
      while (bits.length < digitsPerNumber * this.bitsPerDigit) bits.unshift('0');
      var words = [];
      while (bits.length) words.push(parseInt(bits.splice(0, this.bitsPerDigit).join(''), 2));
      return words.map(this.encode_word).join('');
    }.bind(this);
  } else {
    return function (n) {
      var bits = n.toString(2).split('');
      while (bits.length < digitsPerNumber * this.bitsPerDigit) bits.unshift('0');
      var words = [];
      while (bits.length) words.push(parseInt(bits.splice(0, 5).join(''), 2));
      return words.map(this.encode_word).join('');
    }.bind(this);
  }
}


Encoder.prototype.fixedDecoder = function (bitsPerNumber) {
  var digitsPerNumber = Math.ceil(bitsPerNumber / this.bitsPerDigit);
  var parityBits = digitsPerNumber * this.bitsPerDigit - bitsPerNumber;
  if (parityBits) {
    var parityB = paritify(parityBits);
    return function(s) {
      if (s.length != digitsPerNumber) return NaN;
      var bits = s.split('').map(this.decode_char).join('').split('');
      var check = parseInt(bits.splice(-parityBits).join(''), 2);
      var n = parseInt(bits.join(''), 2);
      return check == parityB(n) ? n : NaN;
    }.bind(this);
  } else {
    return function(s) {
      if (s.length != digitsPerNumber) return NaN;
      return parseInt(s.split('').map(this.decode_char).join(''), 2);
    }.bind(this);
  }
}

Encoder.prototype.encode32orig = function(n)
{
  n = n >>> 0; // force n to UInt32 form
  var parity = parity3(n).toString(2).split('');
  while (parity.length < 3) parity.unshift('0');
  var bits = n.toString(2).split('').concat(parity);
  while (bits.length < 35) bits.unshift('0');
  var words = [];
  while (bits.length) words.push(parseInt(bits.splice(0, 5).join(''), 2));
  return words.map(this.encode_word).join('');
}

Encoder.prototype.decode32orig = function(s)
{
  if (s.length != 7) return NaN;
  var words = s.split('').map(this.decode_char);
  var check = words[6] & 0x7;
  words[6] >>= 3; // scoot the last 2 bits back
  var n = words.reduce(function (t, w, i) { return ((t << (i < 6 ? 5 : 2)) + w) >>> 0; });
  return check == parity3(n) ? n : NaN;
}

// encode a number with an arbitrary number of bits (with no checksum)
Encoder.prototype.encode = function (n)
{
  var bits = Number(n).toString(2).split('');
  var words = [];
  while (bits.length) words.unshift(parseInt(bits.splice(-5, 5).join(''), 2));
  return words.map(this.encode_word).join('');
}

// decode a number with an arbitrary number of bits (with no checksum)
Encoder.prototype.decode = function (s)
{
  return parseInt(s.split('').map(this.decode_char).join(''), 2);
}

var default_encoder = new Encoder(
    '0123456789ABCDEFGHJKMNPQRSTVWXYZ',
    { 'I': '1', 'i': '1', 'L': '1', 'l': '1', 'O': '0', 'o': '0' }
);

// some convenience methods that use the default encoder
exports.encode32 = default_encoder.fixedEncoder(32);
exports.decode32 = default_encoder.fixedDecoder(32);
exports.encode41 = default_encoder.fixedEncoder(41); // 41 bits minimum that can hold current timestamps
exports.decode41 = default_encoder.fixedDecoder(41);
exports.encodeDate = function (d) { return exports.encode41((d || new Date()).getTime()); }
exports.decodeDate = function (s) { return new Date(exports.decode41(s)); }
exports.encode = default_encoder.encode.bind(default_encoder);
exports.decode = default_encoder.decode.bind(default_encoder);
exports.fixedEncoder = default_encoder.fixedEncoder.bind(default_encoder);
exports.fixedDecoder = default_encoder.fixedDecoder.bind(default_encoder);

// or for those that want to roll their own
exports.Encoder = Encoder;
