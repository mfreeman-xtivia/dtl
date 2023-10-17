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
var iz = require('iz-objects');
iz.add_search_path(__dirname + '/../lib/');
var assert = require('assert');
var util = require('util');
var DTL = require('../lib/DTL.js');

let input_data = {};

let tests = [
    // Addition and multiplication
    { to_parse: '2 + 3 * 4', result: 14 }, // Fails if multiplication doesn't take precedence
    { to_parse: '2 * 3 + 4', result: 10 }, // Fails if addition doesn't take precedence

    // Subtraction and division
    { to_parse: '10 / 2 - 3', result: 2 }, // Fails if subtraction doesn't take precedence
    { to_parse: '10 - 2 / 2', result: 9 }, // Fails if division doesn't take precedence

    // Exponentiation and multiplication
    { to_parse: '2 ^ 3 * 4', result: 32 }, // Fails if exponentiation doesn't take precedence
    { to_parse: '2 * 3 ^ 2', result: 18 }, // Fails if exponentiation doesn't take precedence

    // Parentheses
    { to_parse: '2 + (3 * 4)', result: 14 }, // Fails if parentheses are not respected
    { to_parse: '(2 + 3) * 4', result: 20 }, // Fails if parentheses are not respected

    // Mixed operations
    { to_parse: '2 + 3 * 4 / 2', result: 8 }, // Fails if multiplication and division order is not correct
    { to_parse: '2 * 3 + 4 - 1', result: 9 }, // Fails if addition and subtraction order is not correct

    // Addition and subtraction with parentheses
    { to_parse: '2 + (3 - 1)', result: 4 }, // Fails if parentheses are not respected
    { to_parse: '(2 + 3) - 1', result: 4 }, // Fails if parentheses are not respected

    // Multiplication and division with parentheses
    { to_parse: '6 / (3 * 2)', result: 1 }, // Fails if parentheses are not respected
    { to_parse: '(6 / 3) * 2', result: 4 }, // Fails if parentheses are not respected

    // Exponentiation with parentheses
    { to_parse: '2 ^ (3 ^ 2)', result: 512 }, // Fails if parentheses are not respected
    { to_parse: '(2 ^ 3) ^ 2', result: 64 }, // Fails if parentheses are not respected

    // Mixed operations with equal precedence
    { to_parse: '2 * 3 / 2', result: 3 }, // Fails if multiplication and division order is not correct
    { to_parse: '2 / 3 * 2', result: 4 / 3 }, // Fails if multiplication and division order is not correct

    // Subtraction and addition with equal precedence
    { to_parse: '2 + 4 - 3', result: 3 }, // Fails if addition and subtraction order is not correct
    { to_parse: '2 - 3 + 1', result: 0 }, // Fails if addition and subtraction order is not correct

    { to_parse: '(2 + 3) * (4 - 1)', result: 15 }, // Fails if parentheses are not respected
    { to_parse: '2 * (3 / 2) * 4', result: 12 }, // Fails if parentheses are not respected
    { to_parse: '(2 ^ 3) ^ (2 - 1)', result: 8 }, // Fails if parentheses are not respected
    { to_parse: '2 ^ (3 ^ 2)', result: 512 }, // Fails if parentheses are not respected

    // Complex expressions with multiple operators
    { to_parse: '2 + 3 * 4 / 2 - 1', result: 7 }, // Fails if order of operations is not correct
    { to_parse: '(2 + 3) * (4 - 1) / 2', result: 15 / 2 }, // Fails if order of operations is not correct
    { to_parse: '1 - 2 * 6 / 3 + 1', result: -2 }, // Fails if multiplication/division doesn't take precedence or if non-commutativity is not respected

    // Exponentiation with equal precedence
    { to_parse: '2 ^ 2 ^ 3', result: 256 }, // Fails if right-associativity of exponentiation is not respected
    { to_parse: '2 ^ (2 ^ 3)', result: 256 }, // Passes if right-associativity of exponentiation is respected

    // Parentheses with various operators
    { to_parse: '2 * (3 + 4) - 1', result: 13 }, // Fails if parentheses are not respected
    { to_parse: '2 + 3 * (4 - 1)', result: 11 }, // Fails if parentheses are not respected
    { to_parse: '(2 * 3) / (4 + 1)', result: 1.2 }, // Fails if parentheses are not respected

    // Mixed operations with equal precedence and parentheses
    { to_parse: '(2 + 3) * 4 / (2 - 1)', result: 20 }, // Fails if parentheses are not respected
    { to_parse: '2 * (3 / 2) * (4 - 1)', result: 9 }, // Fails if parentheses are not respected
    { to_parse: '(2 ^ 3) ^ (2 - 1)', result: 8 }, // Fails if parentheses are not respected
    { to_parse: '2 ^ (3 ^ 2)', result: 512 } // Fails if parentheses are not respected


];

// These tests specifically check the order of operations (operator precedence) in the parser.



describe('DTL order of operations', function(done) {

    describe('Basic', function() {
        tests.forEach(function(test, i) {

            it("Parsing '" + test.to_parse +"'", function() {
                var result;
                var res;
                try {
                    result = DTL.apply(input_data, { out: "(: " + test.to_parse + " :)" });

                    if (test.regex ) {
                        var r = new RegExp(test.regex);
                        assert.ok(r.test(result), 'RegExp passes');
                    } else {
                        assert.strictEqual(result, test.result, "Produces expected results: " + result + " = " + test.result );
                    }
                } catch(e) {
                    if (!test.expect_exception) {
                        throw e;
                    }
                }
                if (i >= tests.length) {
                    done();
                }
            });
        });
    });
});
