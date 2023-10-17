/* =================================================
 * Copyright (c) 2015-2020 Jay Kuri
 *
 * This file is part of DTL.
 *
 * DTL is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * DTL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with DTL; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * =================================================
 */
var DTL = require("../lib/DTL.js");
var assert = require('assert');
var util = require('util');
var fs = require('fs');

var container = {
                   "numbers": [1,2,3,4,5, 6, 7, 8, 9],
                   "num_odd": [1, 3, 5, 7, 9],
                   "num_even": [2, 4, 6, 8],
                   "num_misc": [1,2,6, 8, 11],
                   "num_with_dups": [1, 2, 7, 6, 8, 7, 1, 11, 11],
                   "colors": ['red','orange','yellow',  'green', 'blue', 'purple'],
                   "red_related": ['red', 'purple', 'orange'],
                   "yellow_related": ['orange','yellow','green'],
                   "blue_related": ['green', 'blue', 'purple'],
                };


describe('DTL Set Operations', function() {
    describe('Unions', function() {
        it("simple union()", function() {
            var result;
            var transform = {
              out: "(: union($.num_odd $num_even) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result.sort(), container.numbers);
        });
        it("\u222A()", function() {
            var result;
            var transform = {
              out: "(: \u222A($.num_odd $num_even) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result.sort(), container.numbers);
        });
        it("u()", function() {
            var result;
            var transform = {
              out: "(: u($.num_odd $num_even) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result.sort(), container.numbers);
        });
        it("union with more than two", function() {
            var result;
            var transform = {
              out: "(: union($red_related $yellow_related $blue_related) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result.sort(), [].concat(container.colors).sort());
        });
        it("union removes duplicates", function() {
            var result;
            var transform = {
              out: "(: union($.num_odd $num_even $numbers) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result.sort(), container.numbers);
        });
        it("abuse union as dedup on single array", function() {
            var result;
            var transform = {
              out: "(: union($.num_with_dups) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, [ 1, 2, 7, 6, 8, 11 ]);
        });
        it("union with non-array returns empty array", function() {
            var result;
            var transform = {
              out: "(: union($.nonexistant) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, []);
        });
    });
    describe('member', function() {
        it("member() true", function() {
            var result;
            var transform = {
              out: "(: member($num_odd 7) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });
        it("member() false ", function() {
            var result;
            var transform = {
              out: "(: member($num_odd 8) :)"
            };
            result = DTL.apply(container, transform);
            assert.equal(result, false);
        });
        it("E", function() {
            var result;
            var transform = {
              out: "(: E($num_even 8) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });
        it("\u2208", function() {
            var result;
            var transform = {
              out: "(: \u2208($numbers 3) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });
    });
    describe('subset', function() {
        it("subset() true", function() {
            var result;
            var transform = {
              out: "(: subset($num_odd [7]) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });
        it("subset() false ", function() {
            var result;
            var transform = {
              out: "(: subset($num_odd [8]) :)"
            };
            result = DTL.apply(container, transform);
            assert.equal(result, false);
        });
        it("c", function() {
            var result;
            var transform = {
              out: "(: c($num_even [8 6]) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });
        it("\u2286", function() {
            var result;
            var transform = {
              out: "(: \u2286($numbers [3 1 8 2]) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });
    });
    describe('Intersections', function() {
        it("intersection()", function() {
            var result;
            var transform = {
              out: "(: intersection($.num_odd $numbers) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_odd);
        });
        it("n()", function() {
            var result;
            var transform = {
              out: "(: n($.num_odd $numbers) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_odd);
        });
        it("\u2229()", function() {
            var result;
            var transform = {
              out: "(: \u2229($.num_odd $numbers) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_odd);
        });
        it("n() v2", function() {
            var result;
            var transform = {
              out: "(: n($.num_misc $num_odd) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, [1]);
        });
        it("n() strings", function() {
            var result;
            var transform = {
              out: "(: n($.yellow_related $colors) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.yellow_related);
        });
        it("n() strings yellow_related", function() {
            var result;
            var transform = {
              out: "(: n($.yellow_related $blue_related) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['green']);
        });
    });
    describe('Set Difference', function() {
        it("difference()", function() {
            var result;
            var transform = {
              out: "(: difference($numbers $.num_odd) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_even);
        });
        it("diff()", function() {
            var result;
            var transform = {
              out: "(: diff($numbers $.num_odd) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_even);
        });
        it("\u2216()", function() {
            var result;
            var transform = {
              out: "(: \u2216($numbers $.num_odd) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_even);
        });
        it("\\()", function() {
            var result;
            var transform = {
              out: "(: \\($numbers $.num_odd) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, container.num_even);
        });
        it("difference(): u = misc, a = even", function() {
            var result;
            var transform = {
              out: "(: difference($.num_misc $num_even) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, [ 1, 11 ]);
        });
        it("difference(): u = even, a = misc", function() {
            var result;
            var transform = {
              out: "(: difference($.num_even $num_misc) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, [4]);
        });
        it("difference() strings", function() {
            var result;
            var transform = {
              out: "(: difference($colors $.yellow_related) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, [ 'red', 'blue', 'purple' ]);
        });
        it("difference() strings u = blue_related, a = yellow_related", function() {
            var result;
            var transform = {
              out: "(: difference($.blue_related $yellow_related) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['blue', 'purple']);
        });
        it("difference() - abuse as 'shift'", function() {
            var result;
            var transform = {
              out: "(: difference($numbers [$numbers.0]) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, [2,3,4,5, 6, 7, 8, 9]);
        });
    });
});
