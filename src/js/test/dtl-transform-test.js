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
                   "filter": 'pairs'
                };


describe('DTL transform test', function() {
    describe('-> shortcut', function() {
        it("basic usage",  function() {
            var result;
            var transform = {
              out: "(: $.red_related -> pairs :)",
              "pairs": "(: [ $.0 $.1 ] :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['red', 'purple']);
        });
// This currently does not work... but one day it will.
//        it("multiple bare",  function() {
//            var result;
//            var transform = {
//              out: "(: $.red_related -> pairs -> reverse_it :)",
//              "pairs": "(: [ $.0 $.1 ] :)",
//              "reverse_it": "(: reverse($.) :)"
//            };
//            result = DTL.apply(container, transform);
//            assert.deepEqual(result, ['purple', 'red' ]);
//        });
        it("multiple parenthesized",  function() {
            var result;
            var transform = {
              out: "(: ($.red_related -> pairs) -> reverse_it :)",
              "pairs": "(: [ $.0 $.1 ] :)",
              "reverse_it": "(: reverse($.) :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['purple', 'red' ]);
        });
        it("multiple parenthesized - three deep",  function() {
            var result;
            var transform = {
              out: "(: (($.blue_related -> pairs) -> reverse_it) -> obj :)",
              "pairs": "(: [ $.0 $.1 ] :)",
              "reverse_it": "(: reverse($.) :)",
              "obj": {
                  "first": "(: $.0 :)",
                  "second": "(: $.1 :)"
              }

            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, { first: 'blue', second: 'green' });
        });
        it("single quoted",  function() {
            var result;
            var transform = {
              out: "(: $.red_related -> 'pairs' :)",
              "pairs": "(: [ $.0 $.1 ] :)",
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['red', 'purple']);
        });
        it("data provided",  function() {
            var result;
            var transform = {
              out: "(: $.yellow_related -> $filter :)",
              "pairs": "(: [ $.0 $.1 ] :)",
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['orange', 'yellow' ]);
        });
        it("transform name assembled",  function() {
            var result;
            var transform = {
              out: "(: $.yellow_related -> &('pai' 'rs') :)",
              "pairs": "(: [ $.0 $.1 ] :)",
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, ['orange', 'yellow' ]);
        });
        it("can be used inline with other operations",  function() {
            var result;
            var transform = {
                out: "(: ($.red_related -> last)  == $.red_related[2] :)",
                "last": "(: (tail($. 1))[0] :)"
            };
            result = DTL.apply(container, transform);
            assert.deepEqual(result, true);
        });

        it("No input data shortcut form",  function() {
            var result;
            var transform = {
              out: "(: ^('shortcut_form') :)",
              "shortcut_form": {
                  "bob": "123",
                  "data": "(: $.red_related :)"
              }
            };
            var expected = {
                  bob: '123',
                  data: [
                    'red',
                    'purple',
                    'orange'
                  ]
                };

            result = DTL.apply(container, transform);
            assert.deepEqual(result, expected);
        });
        it("No input data shortcut form with literal expression",  function() {
            var result;
            var transform = {
              out: "(: ^(`(: &($red_related 'a' 'ab' 'abc') :)`) :)"
            };
            var expected = [
                  'red',
                  'purple',
                  'orange',
                  'a',
                  'ab',
                  'abc'
            ];
            result = DTL.apply(container, transform);
            assert.deepEqual(result, expected);
        });
    });
    describe("recursion works", function() {
        it("can calculate factorial", function() {
            var result;
            var transform= {
                "out": "(: 5 -> factorial :)",
                "factorial": "(: ?(($. == 0) 1 ( $. * (($. - 1) -> factorial))) :)"
            }
            result = DTL.apply(container, transform);
            console.log(result);
//            assert.deepEqual(result, true);
        });
    });
});
