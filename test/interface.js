// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

'use strict';

var test = require('tape');

var bufrw = require('../index');

var lengthErrorRW = {
    byteLength: function() {return bufrw.LengthResult(new Error('boom'));}
};

var writeErrorRW = {
    byteLength: function() {return bufrw.LengthResult.just(0);},
    writeInto: function() {return bufrw.WriteResult.error(new Error('bang'));}
};

var readErrorRW = {
    readFrom: function() {return bufrw.ReadResult.error(new Error('zot'));}
};

test('toBuffer', function t(assert) {
    assert.deepEqual(
        bufrw.toBuffer(bufrw.UInt8, 1),
        Buffer([0x01]), 'write 1 uint8');
    assert.throws(function() {
        bufrw.toBuffer(lengthErrorRW, 1);
    }, /boom/, 'length error throws');
    assert.throws(function() {
        bufrw.toBuffer(writeErrorRW, 1);
    }, /bang/, 'write error throws');
    assert.end();
});

test('intoBuffer', function t(assert) {
    assert.deepEqual(
        bufrw.intoBuffer(bufrw.UInt8, Buffer([0]), 1),
        Buffer([0x01]), 'write 1 uint8');
    assert.throws(function() {
        bufrw.intoBuffer(writeErrorRW, Buffer([0]), 1);
    }, /bang/, 'write error throws');
    assert.throws(function() {
        bufrw.intoBuffer(bufrw.UInt8, Buffer([0, 0]), 1);
    }, /short write, 1 byte left over after writing 1/, 'short write error');
    assert.end();
});

test('fromBuffer', function t(assert) {
    assert.equal(
        bufrw.fromBuffer(bufrw.UInt8, Buffer([0x01])),
        1, 'read 1 uint8');
    assert.throws(function() {
        bufrw.fromBuffer(readErrorRW, Buffer(0));
    }, /zot/, 'read error throws');
    assert.throws(function() {
        bufrw.fromBuffer(bufrw.UInt8, Buffer([0, 0]));
    }, /short read, 1 byte left over after consuming 1/, 'short read error');
    assert.end();
});
