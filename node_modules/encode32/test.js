var enc = require("./encode32"), assert = require("assert");

var scale = 14, N = Math.pow(2, scale), T = 10;

// try a bunch of different fixed length encoders
[7, 9, 10, 16, 24, 25, 41, 53].forEach(function (B) {
  var encode = enc.fixedEncoder(B), decode = enc.fixedDecoder(B);
  // put in some interesting test points
  var tests = [0, 1, Math.pow(2, B) - 1];
  // add some random ones for variation
  for (var i = 0; i < T; i++) { tests.push(Math.floor(Math.random() * Math.pow(2, B))) };
  tests.sort(function (a, b) { return a - b; }).forEach(function (r) {
    var a = encode(r);
    var b = decode(a);
    assert.ok(!isNaN(b), "decode failed: " + [r, a, b].join(" => "));
    assert.equal(b, r, "decode yielded incorrect result: " + [r, a, b].join(" => "));
  });
});

// test the encodeDate helper (uses the 41 bit encoder behind the scenes)
for (var i = 0; i < T; i++) {
  var d = new Date();
  var a = enc.encodeDate(d);
  var b = enc.decodeDate(a);
  assert.equal(d.getTime(), b.getTime(), "encode/decodeDate failed:" + [d, a, b].join(" => "));
}

// do a perf test on encode32
console.log("Testing " + N + " random integers with encode32");
var start = new Date();
for (var i = 0; i < N; i++) {
   var r = i; // Math.floor(Math.random() * Math.pow(2, 32));
   var a = enc.encode32(r);
   assert.equal(a.length, 7, "bad encoded length");
   var b = enc.decode32(a);
   assert.ok(!isNaN(b), "decode failed: " + [r, a, b].join(" => "));
   assert.equal(b, r, "decode yielded incorrect result: " + [r, a, b].join(" => "));
}
var elapsed = new Date() - start;
console.log("done. (approx.", Math.floor(N / (elapsed / 1000.0)), "encode32/decode32 cycles per second)"); 

start = new Date();
console.log("Testing " + N + " random bignums with encode");
for (var i = 0; i < N; i++) {
   var r = Math.floor(Math.random() * Math.pow(2, 32));
   var s = r + Number(start); // should force us into bignum territory
   var c = enc.encode(s);
   var d = enc.decode(c);
   assert.ok(!isNaN(d), "decode failed: " + [s, c, d].join(" => "));
   assert.equal(s, d, "decode failed: " + [s, c, d].join(" => "));
}
elapsed = new Date() - start;
console.log("done. (approx.", Math.floor(N / (elapsed / 1000.0)), "encode/decode cycles per second)"); 
