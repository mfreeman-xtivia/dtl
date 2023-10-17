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

let input_data = {
    num1: 0.1,
    num2: 0.2,
    num3: 0.3,
    num4: 2,
    num5: 3,
    num6: 4,
    num7: 3.3,
    num8: 4.4,
    num9: 5.5,
    num10: 10.5,
    num11: 2.5,
    num12: 0.1,
    num13: 0.01,
    num14: 0.001,
    num15: 9999999999999999,
    num16: 10000000000000000,
    num17: 0.5
};

let tests = [
    // Addition
    { to_parse: '0.1 + 0.2', result: 0.3 }, // Regular JS: 0.30000000000000004
    { to_parse: '2 + 3', result: 5 },
    { to_parse: '5.5 + 6.6', result: 12.1 },

    // Subtraction
    { to_parse: '5 - 3', result: 2 },
    { to_parse: '10.5 - 4.2', result: 6.3 },
    { to_parse: '0.1 - 0.2', result: -0.1 }, // Regular JS: -0.1

    // Multiplication
    { to_parse: '2 * 3', result: 6 },
    { to_parse: '3.3 * 4.4', result: 14.52 },
    { to_parse: '0.1 * 0.2', result: 0.02 }, // Regular JS: 0.020000000000000004

    // Division
    { to_parse: '6 / 2', result: 3 },
    { to_parse: '10.5 / 2.5', result: 4.2 },
    { to_parse: '0.1 / 0.3', result: 0.3333333333333333 }, // Regular JS: 0.3333333333333333

    // Exponentiation
    { to_parse: '2 ^ 3', result: 8 },
    { to_parse: '2 ^ 4', result: 16 },
    { to_parse: '3 ^ 2', result: 9 },

    // Modulus
    { to_parse: '7 % 2', result: 1 },
    { to_parse: '10.5 % 3', result: 1.5 },
    { to_parse: '17 % 3', result: 2 },

    // Complex expressions
    { to_parse: '2 + 3 * 4', result: 14 },
    { to_parse: '2 * (3 + 4)', result: 14 },
    { to_parse: '(2 + 3) * 4', result: 20 },
    { to_parse: '3 * (2 + 4) - 5', result: 13 },
    { to_parse: '2 + 3 * 4 / 2', result: 8 },
    { to_parse: '2 + 3 * (4 / 2)', result: 8 },
    { to_parse: '(2 + 3) * (4 / 2)', result: 10 },

    // Precision tests
    { to_parse: '0.1 * 0.1 * 0.1 * 0.1 * 0.1', result: 0.00001 }, // Regular JS: 1.0000000000000002e-6
    { to_parse: '0.1 + 0.1 + 0.1 + 0.1 + 0.1', result: 0.5 }, // Regular JS: 0.5000000000000001
    { to_parse: '0.1 / 0.1 / 0.1', result: 10 }, // Regular JS: 10
    { to_parse: '9999999999999999 + 1', result: 10000000000000000 }, // Regular JS: 10000000000000000

    // Comparisons
    { to_parse: '2 == 2', result: true },
    { to_parse: '2 != 3', result: true },
    { to_parse: '3 > 2', result: true },
    { to_parse: '2 < 3', result: true },
    { to_parse: '3 >= 3', result: true },
    { to_parse: '3 <= 3', result: true },

    // Mixed operations
    { to_parse: '2 + 3 == 5', result: true },
    { to_parse: '2 * 3 != 5', result: true },
    { to_parse: '2 + 3 > 4', result: true },
    { to_parse: '2 + 3 < 6', result: true },
    { to_parse: '2 * 3 >= 6', result: true },
    { to_parse: '2 * 3 <= 6', result: true },
    { to_parse: '2 + 3 == 5 && 2 * 3 == 6', result: true },
    { to_parse: '2 + 3 == 6 || 2 * 3 == 6', result: true },
    { to_parse: '$num1 + $num2', result: 0.3 }, // Regular JS: 0.30000000000000004
    { to_parse: '$num4 + $num5', result: 5 },
    { to_parse: '$num7 + $num8', result: 7.7 },

    { to_parse: '$num5 - $num4', result: 1 },
    { to_parse: '$num10 - $num11', result: 8 },
    { to_parse: '$num1 - $num2', result: -0.1 }, // Regular JS: -0.1

    { to_parse: '$num4 * $num5', result: 6 },
    { to_parse: '$num4 * $num6', result: 8 },
    { to_parse: '$num7 * $num8', result: 14.52 },

    { to_parse: '$num6 / $num4', result: 2 },
    { to_parse: '$num10 / $num11', result: 4.2 },
    { to_parse: '$num1 / $num3', result: 0.3333333333333333 }, // Regular JS: 0.3333333333333333

    { to_parse: '$num4 ^ $num5', result: 8 },
    { to_parse: '$num4 ^ $num6', result: 16 },
    { to_parse: '$num5 ^ $num4', result: 9 },

    { to_parse: '$num7 % $num4', result: 1.3 },
    { to_parse: '$num10 % $num5', result: 1.5 },
    { to_parse: '$num16 % $num11', result: 0 },

    { to_parse: '$num1 + $num2 + $num3', result: 0.6 }, // Regular JS: 0.6
    { to_parse: '$num1 * $num2 * $num3', result: 0.006 }, // Regular JS: 0.6000000000000001
    { to_parse: '$num1 / $num2 / $num3', result: 1.6666666666666667 }, // Regular JS: 1.6666666666666667
    { to_parse: '$num15 + 1', result: 10000000000000000 }, // Regular JS: 10000000000000000

    { to_parse: '$num4 == 2', result: true },
    { to_parse: '$num5 != 3', result: false },
    { to_parse: '$num6 > 3', result: true },
    { to_parse: '$num5 < 4', result: true },
    { to_parse: '$num6 >= 4', result: true },
    { to_parse: '$num6 <= 4', result: true },

    { to_parse: '$num1 + 0.1 == 0.2', result: true },
    { to_parse: '2 * $num5 != 5', result: true },
    { to_parse: '$num1 + $num2 > $num3', result: false },
    { to_parse: '$num4 + $num5 < 6', result: true },
    { to_parse: '$num4 * $num5 >= 6', result: true },
    { to_parse: '$num6 / $num4 <= 4', result: true },
    { to_parse: '$num1 + 0.2', result: 0.3 }, // Regular JS: 0.30000000000000004
    { to_parse: '2 + $num4', result: 4 },
    { to_parse: '$num7 - 3', result: 0.3 },
    { to_parse: '$num10 * 2', result: 21 },
    { to_parse: '0.5 / $num4', result: 0.25 }, // Regular JS: 0.25
    { to_parse: '3 ^ $num4', result: 9 },
    { to_parse: '$num11 % 3', result: 2.5 },

    { to_parse: '$num1 + 0.2 + $num3', result: 0.6 }, // Regular JS: 0.6
    { to_parse: '2 * $num5 + 3', result: 9 },
    { to_parse: '$num7 - 3 + $num8', result: 4.7 },
    { to_parse: '$num10 * 2 + $num11', result: 23.5 },
    { to_parse: '0.5 / $num4 - 0.1', result: 0.15 }, // Regular JS: 0.15
    { to_parse: '3 ^ $num4 * $num5', result: 27 },
    { to_parse: '$num11 % 3 + 1', result: 3.5 }
];


describe('DTL BigNumber Processing', function(done) {

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
