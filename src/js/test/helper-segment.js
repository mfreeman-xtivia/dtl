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

var in_data = [];
var alpha = 'abcdefghijklmnopqrstuvwxyz0123456789';
var str = "";
// the tests below depend on this being exactly 2468
for (var i = 0; i < 2468; i++) {
    str = "";
    for (var j = 0; j < 20; j++) {
        str = str + alpha[Math.floor(Math.random()*36)];
    }
    var o = {};
    o = { index: i, "str": str };
    in_data.push(o);
}

describe('DTL Helper: segment', function() {
    it("groups of 100", function() {
        var result;
        // this gives us n groups, each 100 items long
        var transform = {
            out: "(: segment($. 100) :)",
        };

        //console.log(github_data);
        result = DTL.apply(in_data, transform);
        assert.equal(result.length, 25, in_data.length + " list creates 25 groups of no more than 100");
        assert.equal(result[0].length, 100, "First list contains 100 items");
        assert.equal(result[result.length-2].length, 100, "Second to last list contains 100 items");
        assert.equal(result[result.length-1].length, 68, "Last list contains remaining items");
    });
    it("groups of 100, with limits", function() {
        var result;
        // this gives us n groups, 100 long, beginning at start (801) and ending at stop  (1923)
        var transform = {
            out: "(: segment($. 100 801 1923) :)",
        };

        //console.log(github_data);
        result = DTL.apply(in_data, transform);
        assert.equal(result.length, 12, in_data.length + " list creates 12 groups of no more than 100");
        assert.equal(result[0].length, 100, "First list contains 100 items");
        assert.equal(result[0][0].index, 801, "First item is correct");
        assert.equal(result[result.length-2].length, 100, "Second to last list contains 100 items");
        var last_group = result.length-1;
        var last_item = result[last_group].length-1;
        assert.equal(result[last_group][last_item].index, 1923, "Last item is correct");
    });
    // This gives us 22 groups,
    it("groups into 22 groups", function() {
        var result;
        var transform = {
            out: "(: segment($. (length($.)/22)) :)",
        };

        //console.log(github_data);
        result = DTL.apply(in_data, transform);
        assert.equal(result.length, 22, in_data.length + " list creates 22 groups");
        assert.equal(result[0].length, Math.ceil(in_data.length/22), "Lists contain the expected number of items");
        var last_group = result.length-1;
        var last_item = result[last_group].length-1;
        assert.equal(result[last_group][last_item].index, 2467, "Last item is correct");
    });
    it("groups into 22 groups with start and stop", function() {
        var result;
        var transform = {
            out: "(: segment($. ((927-123)/22) 123 927) :)",
        };

        //console.log(github_data);
        result = DTL.apply(in_data, transform);
        assert.equal(result.length, 22, in_data.length + " list creates 22 groups");
        assert.equal(result[0].length, Math.ceil((927-123)/22), "Lists contain the expected number of items");
        var last_group = result.length-1;
        var last_item = result[last_group].length-1;
        assert.equal(result[last_group][last_item].index, 927, "Last item is correct");
    });
    it("no groupsize gives us one segment", function() {
        var result;
        var transform = {
            out: "(: segment($.) :)",
        };

        //console.log(github_data);
        result = DTL.apply(in_data, transform);
        assert.equal(result.length, 1, in_data.length + " list creates 1 group");
        assert.equal(result[0].length, 2468, "Lists contain the expected number of items");
        var last_item = result[0].length-1;
        assert.equal(result[0][last_item].index, 2467, "Last item is correct");
    });
    it("abuse it to get a slice", function() {
        var result;
        var transform = {
            out: "(: segment($. 0 801 903) :)",
        };

        //console.log(github_data);
        result = DTL.apply(in_data, transform);
        assert.equal(result.length, 1, in_data.length + " list creates 1 group");
        assert.equal(result[0].length, 103, "Lists contain the expected number of items");
        var last_item = result[0].length-1;
        assert.equal(result[0][last_item].index, 903, "Last item is correct");
    });
});
