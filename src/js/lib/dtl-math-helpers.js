/* =================================================
 * Copyright (c) 2015-2022 Jay Kuri
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
'use strict';
const BigNumber = require("bignumber.js");

function handle_nan(res) {
    if (isNaN(res) || BigNumber(res).isNaN()) {
        return undefined;
    } else {
        return res;
    }
}

var helper_list = {
    'math.abs': {
        "meta": {
            "syntax": 'math.abs(number)',
            "returns": 'The absolute value of the number provided.',
            "description": [
                'Returns the the absolute value of the number provided.'
            ]
        },
        "bignumber": function(num) {
            return num.absoluteValue();
        },
        "number": function(num) {
            return handle_nan(Math.abs(num));
        },
        "coerce": [ 'number' ]
    },
    'math.acos': {
        "meta": {
            "syntax": 'math.acos(number)',
            "returns": 'The inverse cosine (in radians) of the provided number',
            "description": [
                'Returns The inverse cosine (in radians) of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.acos(num));
        },
        "coerce": [ 'number' ]
    },
    'math.acosh': {
        "meta": {
            "syntax": 'math.acosh(number)',
            "returns": 'The inverse hyperbolic cosine of the provided number',
            "description": [
                'Returns the inverse hyperbolic cosine of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.acosh(num));
        },
        "coerce": [ 'number' ]
    },
    'math.asin': {
        "meta": {
            "syntax": 'math.asin(number)',
            "returns": 'The inverse sine (in radians) of the provided number.',
            "description": [
                'Returns the inverse sine (in radians) of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.asin(num));
        },
        "coerce": [ 'number' ]
    },
    'math.asinh': {
        "meta": {
            "syntax": 'math.asinh(number)',
            "returns": 'The inverse hyperbolic sine of the provided number.',
            "description": [
                'Returns the inverse hyperbolic sine of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.asinh(num));
        },
        "coerce": [ 'number' ]
    },
    'math.atan': {
        "meta": {
            "syntax": 'math.atan(number)',
            "returns": 'The inverse tangent (in radians) of the provided number.',
            "description": [
                'Returns the inverse tangent (in radians) of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.atan(num));
        },
        "coerce": [ 'number' ]
    },
    'math.atan2': {
        "meta": {
            "syntax": 'math.atan2(x, y)',
            "returns": 'The angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (x, y)',
            "description": [
                'Returns the angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (x, y)',
            ]
        },
        "number": function(x, y) {
            return handle_nan(Math.atan2(x, y));
        },
        "coerce": [ 'number' ]
    },
    'math.atanh': {
        "meta": {
            "syntax": 'math.atanh(number)',
            "returns": 'The inverse hyberbolic tangent (in radians) of the provided number.',
            "description": [
                'Returns the inverse hyberbolic tangent (in radians) of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.atanh(num));
        },
        "coerce": [ 'number' ]

    },
    'math.cbrt': {
        "meta": {
            "syntax": 'math.cbrt(number)',
            "returns": 'The cube root of the provided number.',
            "description": [
                'Returns the cube root of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.cbrt(num));
        },
        "coerce": [ 'number' ]
    },
    'math.ceil': {
        "meta": {
            "syntax": 'math.ceil(number)',
            "returns": 'The ceiling, the smallest integer value not less than argument.',
            "description": [
                'Returns the ceiling, the smallest integer value not less than argument.'
            ]
        },
        "bignumber": function(bignum) {
            return handle_nan(bignum.integerValue(BigNumber.ROUND_CEIL));
        },
        "number": function(num) {
            return handle_nan(Math.ceil(num));
        },
        "coerce": [ 'number' ]
    },
    'math.clz32': {
        "meta": {
            "syntax": 'math.clz32(number)',
            "returns": 'The number of leading zero bits in the 32-bit binary representation of the provided number',
            "description": [
                'Returns the number of leading zero bits in the 32-bit binary representation of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.clz32(num));
        },
        "coerce": [ 'number' ]
    },
    'math.cos': {
        "meta": {
            "syntax": 'math.cos(number)',
            "returns": 'The cosine of the provided number in radians',
            "description": [
                'Returns the cosine of the provided number in radians.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.cos(num));
        },
        "coerce": [ 'number' ]
    },
    'math.cosh': {
        "meta": {
            "syntax": 'math.cosh(number)',
            "returns": 'The hyperbolic cosine of the provided number in radians',
            "description": [
                'Returns the hyperbolic cosine of the provided number in radians.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.cosh(num));
        },
        "coerce": [ 'number' ]
    },
    'math.exp': {
        "meta": {
            "syntax": 'math.exp(number)',
            "returns": 'The value of e raised to the power of the provided number',
            "description": [
                'Returns the value of e raised to the power of the provided number'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.exp(num));
        },
        "coerce": [ 'number' ]
    },
    'math.expm1': {
        "meta": {
            "syntax": 'math.expm1(number)',
            "returns": 'The value of e raised to the power of the provided number, subtracted by 1',
            "description": [
                'Returns the value of e raised to the power of the provided number, subtracted by 1.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.expm1(num));
        },
        "coerce": [ 'number' ]
    },
    'math.floor': {
        "meta": {
            "syntax": 'math.floor(number)',
            "returns": 'The largest integer value not greater than provided number',
            "description": [
                'Returns the largest integer value not greater than provided number.'
            ]
        },
        "bignumber": function(bignum) {
            return handle_nan(bignum.integerValue(BigNumber.ROUND_FLOOR));
        },
        "number": function(num) {
            return handle_nan(Math.floor(num));
        },
        "coerce": [ 'number' ]
    },
    'math.fround': {
        "meta": {
            "syntax": 'math.fround(number)',
            "returns": 'The nearest 32-bit single precision float representation of the provided number',
            "description": [
                'Returns the nearest 32-bit single precision float representation of the provided number.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.fround(num));
        },
        "coerce": [ 'number' ]
    },
    'math.hypot': {
        "meta": {
            "syntax": 'math.hypot(number, number...)',
            "returns": 'The square root of the sum of the squares of the provided numbers',
            "description": [
                'Returns the square root of the sum of the squares of the provided numbers.',
            ]
        },
        "number": function() {
            return handle_nan(Math.hypot.apply(null, [].slice.call(arguments)));
        },
        "coerce": [ 'number' ]
    },
    'math.imul': {
        "meta": {
            "syntax": 'math.imul(a, b)',
            "returns": 'The result of multiplying the provided numbers as 32 bit signed integers',
            "description": [
                'Returns the result of multiplying the provided numbers as 32 bit signed integers.'
            ]
        },
        "number": function(a, b) {
            return handle_nan(Math.imul(a, b));
        },
        "coerce": [ 'number' ]
    },
    'math.log': {
        "meta": {
            "syntax": 'math.log(number)',
            "returns": 'The natural logarithm (base e) of the number provided',
            "description": [
                'Returns the natural logarithm (base e) of the number provided.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.log(num));
        },
        "coerce": [ 'number' ]
    },
    'math.log10': {
        "meta": {
            "syntax": 'math.log10(number)',
            "returns": 'The base-10 logarithm of the number provided',
            "description": [
                'Returns the base-10 logarithm of the number provided.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.log10(num));
        },
        "coerce": [ 'number' ]
    },
    'math.log1p': {
        "meta": {
            "syntax": 'math.log1p(number)',
            "returns": 'The natural logarithm (base e) of 1 plus the number provided',
            "description": [
                'Returns the natural logarithm (base e) of 1 plus the number provided.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.log1p(num));
        },
        "coerce": [ 'number' ]
    },
    'math.log2': {
        "meta": {
            "syntax": 'math.log2(number)',
            "returns": 'The base-2 logarithm of the number provided',
            "description": [
                'Returns the base-2 logarithm of the number provided.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.log2(num));
        },
        "coerce": [ 'number' ]
    },
    'math.max': {
        "meta": {
            "syntax": 'math.max(array_of_numbers)',
            "returns": 'The largest of the numbers provided',
            "description": [
                'When given an array of numbers or several numbers as arguments, returns the largest of the numbers provided.'
            ]
        },
        "array": function(num_array) {
            return handle_nan(Math.max.apply(null, num_array));
        },
        "number": function() {
            return handle_nan(Math.max.apply(null, [].slice.call(arguments)));
        },
        "coerce": [ 'number' ]
    },
    'math.min': {
        "meta": {
            "syntax": 'math.min(array_of_numbers)',
            "returns": 'The smallest of the numbers provided',
            "description": [
                'When given an array of numbers or several numbers as arguments, returns the smallest of the numbers provided.'
            ]
        },
        "array": function(num_array) {
            return handle_nan(Math.min.apply(null, num_array));
        },
        "number": function() {
            return handle_nan(Math.min.apply(null, [].slice.call(arguments)));
        },
        "coerce": [ 'number' ]

    },
    'math.pow': {
        "meta": {
            "syntax": 'math.pow(x, y)',
            "returns": 'The result of raising x to the power of y',
            "description": [
                'Returns the result of raising x to the power of y.'
            ]
        },
        "number": function(x, y) {
            return handle_nan(Math.pow(x, y));
        },
        "coerce": [ 'number' ]
    },
    'math.rand': {
        "meta": {
            "syntax": 'math.rand(max)',
            "returns": 'A pseudo-random integer between 0 and max',
            "description": [
                'Returns a pseudo-random integer between 0 and max, exclusive.'
            ]
        },
        "number": function(max) {
            return handle_nan(Math.floor(Math.random() * max));
        },
        "coerce": [ 'number' ]
    },
    'math.random': {
        "meta": {
            "syntax": 'math.random()',
            "returns": 'A floating-point pseudo-random number between 0 and 1',
            "description": [
                'Returns a floating-point pseudo-random number between 0 and 1.'
            ]
        },
        "*": function() {
            return handle_nan(BigNumber.random());
        }
    },
    'math.round': {
        "meta": {
            "syntax": 'math.round(number)',
            "returns": 'The value of the number provided rounded to the nearest integer',
            "description": [
                'Returns the value of the number provided rounded to the nearest integer.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.round(num));
        },
        "coerce": [ 'number' ]
    },
    'math.sign': {
        "meta": {
            "syntax": 'math.sign(number)',
            "returns": 'The value 1 if the number provided is positive, -1 if it is negative, or 0 if the number is 0',
            "description": [
                'Returns the value 1 if the number provided is positive, -1 if it is negative, or 0 if the number is 0.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.sign(num));
        },
        "coerce": [ 'number' ]

    },
    'math.sin': {
        "meta": {
            "syntax": 'math.sin(number)',
            "returns": 'The sine of the provided number in radians',
            "description": [
                'Returns the sine of the provided number in radians.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.sin(num));
        },
        "coerce": [ 'number' ]
    },
    'math.sinh': {
        "meta": {
            "syntax": 'math.sinh(number)',
            "returns": 'The hyperbolic sine of the provided number in radians',
            "description": [
                'Returns the hyperbolic sine of the provided number in radians.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.sinh(num));
        },
        "coerce": [ 'number' ]
    },
    'math.sqrt': {
        "meta": {
            "syntax": 'math.sqrt(number)',
            "returns": 'The square root of the the provided number',
            "description": [
                'Returns the square root of the the provided number'
            ]
        },
        "bignumber": function(bignum) {
            return bignum.squareRoot();
        },
        "number": function(num) {
            return handle_nan(Math.sqrt(num));
        },
        "coerce": [ 'number' ]

    },
    'math.tan': {
        "meta": {
            "syntax": 'math.tan(number)',
            "returns": 'The tangent of the provided number in radians',
            "description": [
                'Returns the tangent of the provided number in radians.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.tan(num));
        },
        "coerce": [ 'number' ]
    },
    'math.tanh': {
        "meta": {
            "syntax": 'math.tanh(number)',
            "returns": 'The hyperbolic tangent of the provided number in radians',
            "description": [
                'Returns the hyperbolic tangent of the provided number in radians.'
            ]
        },
        "number": function(num) {
            return handle_nan(Math.tanh(num));
        },
        "coerce": [ 'number' ]

    },
    'math.trunc': {
        "meta": {
            "syntax": 'math.trunc(number)',
            "returns": 'The integer portion of the provided number by removing any fractional portion',
            "description": [
                'Returns the integer portion of the provided number by removing any fractional portion.'
            ]
        },
        "bignumber": function(bignum) {
            return handle_nan(bignum.integerValue(BigNumber.ROUND_DOWN));
        },
        "number": function(num) {
            return handle_nan(Math.trunc(num));
        },
        "coerce": [ 'number' ]
    },
    'math.E': {
        "meta": {
            "syntax": 'math.E()',
            "returns": 'Eulers number, e, the base of natural logarithms',
            "description": [
                'Returns Eulers number, e, the base of natural logarithms'
            ]
        },
        "*": function(num) {
            return Math.E
        }
    },
    'math.LN10': {
        "meta": {
            "syntax": 'math.LN10()',
            "returns": 'The natural logarithm of 10',
            "description": [
                'Returns the natural logarithm of 10.'
            ]
        },
        "*": function(num) {
            return Math.LN10
        }
    },
    'math.LN2': {
        "meta": {
            "syntax": 'math.LN2()',
            "returns": 'The natural logarithm of 2',
            "description": [
                'Returns the natural logarithm of 2.'
            ]
        },
        "*": function(num) {
            return Math.LN2
        }
    },
    'math.LOG10E': {
        "meta": {
            "syntax": 'math.LOG10E()',
            "returns": 'The base 10 logarithm of e',
            "description": [
                'Returns the base 10 logarithm of e'
            ]
        },
        "*": function(num) {
            return Math.LOG10E
        }
    },
    'math.LOG2E': {
        "meta": {
            "syntax": 'math.LOG2E()',
            "returns": 'The base 2 logarithm of e',
            "description": [
                'Returns the base 2 logarithm of e.'
            ]
        },
        "*": function(num) {
            return Math.LOG2E
        }
    },
    'math.PI': {
        "meta": {
            "syntax": 'math.PI()',
            "returns": 'PI, the ratio of the circumference of a circle to its diameter',
            "description": [
                'Returns PI, the ratio of the circumference of a circle to its diameter'
            ]
        },
        "*": function(num) {
            return Math.PI
        }
    },
    'math.SQRT1_2': {
        "meta": {
            "syntax": 'math.SQRT1_2()',
            "returns": 'The square root of 1/2',
            "description": [
                'Returns the square root of 1/2',
            ]
        },
        "*": function(num) {
            return Math.SQRT1_2
        }
    },
    'math.SQRT2': {
        "meta": {
            "syntax": 'math.SQRT2()',
            "returns": 'The square root of 2',
            "description": [
                'Returns the square root of 2',
            ]
        },
        "*": function(num) {
            return Math.SQRT2
        }
    }
};

module.exports = function() {
    // console.log(Object.keys(helper_list).sort());
    return helper_list;
};
