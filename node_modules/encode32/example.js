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

console.log(a, b, c);
