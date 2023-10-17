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
//var assert = require('assert');
var chai = require('chai');
var assert = chai.assert;
var util = require('util');
var DTL = require('../lib/DTL.js');

var precision = 0.000000001;

var math_helpers = [ 
    'abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt',
    'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'hypot',
    'imul', 'log', 'log10', 'log1p', 'log2', 'max', 'min', 'pow', 'random',
    'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'
];

var math_constants = [ 
    'E', 'LN10', 'LN2', 'LOG10E', 'LOG2E', 'PI', 'SQRT1_2', 'SQRT2' 
];

var container = {};
var tests = [
    { to_parse: "math.abs(48.2)", result: 48.2},
    { to_parse: "math.abs(-42.7)", result: 42.7},
    { to_parse: "math.abs(-2)", result: 2},
    { to_parse: "math.abs(2)", result: 2},
    { to_parse: "math.abs(0)", result: 0},
    { to_parse: "math.acos(8/10)", approximately: 0.64350110879},
    { to_parse: "math.acos(4/9)", approximately: 1.1102423351135742 },
    { to_parse: "math.acosh(1)", result: 0},
    { to_parse: "math.acosh(0.9999999999)", result: undefined},
    { to_parse: "math.acosh(2.5)", approximately: 1.5667992369},
    { to_parse: "math.acosh(-0.5)", result: undefined },
    { to_parse: "math.asin(6/10)", approximately: 0.64350110879},
    { to_parse: "math.asin(4/9)", approximately: 0.4605539916813224},
    { to_parse: "math.asinh(1)", approximately: 0.881373587019543},
    { to_parse: "math.asinh(0.9999999999)", approximately: 0.8813735869488324},
    { to_parse: "math.asinh(2.5)", approximately: 1.6472311463710958},
    { to_parse: "math.asinh(-0.5)", approximately: -0.48121182505960347 },
    { to_parse: "math.atan(8/10)", approximately: 0.6747409422235527},
    { to_parse: "math.atan(3/7)", approximately: 0.4048917862850834},
    { to_parse: "math.atanh(1)", result: Infinity},
    { to_parse: "math.atanh(0.9999999999)", approximately: 11.859499013855018 },
    { to_parse: "math.atanh(2.5)", result: undefined},
    { to_parse: "math.atanh(-0.5)", approximately: -0.5493061443340548},
    { to_parse: "math.atan2(1, 0)", approximately: 1.5707963267948966},
    { to_parse: "math.atan2(3, 4)", approximately: 0.6435011087932844},
    { to_parse: "math.atan2(3, 0.238)", approximately: 1.491628803225403},
    { to_parse: "math.cbrt(64)", result: 4},
    { to_parse: "math.cbrt(9)", approximately: 2.080083823051904 },
    { to_parse: "math.cbrt(1000)", result: 10},
    { to_parse: "math.cbrt(-1000)", result: -10},
    { to_parse: "math.cbrt(1)", result: 1},
    { to_parse: "math.cbrt(0)", result: 0},
    { to_parse: "math.ceil(0.04)", result: 1},
    { to_parse: "math.ceil(-1.002)", result: -1},
    { to_parse: "math.ceil(17.0239123)", result: 18},
    { to_parse: "math.ceil(19.999991)", result: 20},
    { to_parse: "math.ceil(1)", result: 1},
    { to_parse: "math.ceil(1.000000000000001)", result: 2},
    { to_parse: "math.ceil(1.0000000000000001)", result: 1},
    { to_parse: "math.floor(0.04)", result: 0},
    { to_parse: "math.floor(-1.002)", result: -2},
    { to_parse: "math.floor(17.0239123)", result: 17},
    { to_parse: "math.floor(19.999991)", result: 19},
    { to_parse: "math.floor(1)", result: 1},
    { to_parse: "math.floor(1.999999999999999)", result: 1},
    { to_parse: "math.floor(1.9999999999999999)", result: 2},
    { to_parse: "math.round(0.04)", result: 0},
    { to_parse: "math.round(-1.002)", result: -1},
    { to_parse: "math.round(17.0239123)", result: 17},
    { to_parse: "math.round(19.999991)", result: 20},
    { to_parse: "math.round(1)", result: 1},
    { to_parse: "math.round(1.999999999999999)", result: 2},
    { to_parse: "math.round(1.9999999999999999)", result: 2},
    { to_parse: "math.round(1.000000000000001)", result: 1},
    { to_parse: "math.round(1.0000000000000001)", result: 1},
    { to_parse: "math.clz32(4)", result: 29},
    { to_parse: "math.clz32(23)", result: 27},
    { to_parse: "math.clz32(972)", result: 22},
    { to_parse: "math.clz32(90923972)", result: 5},
    { to_parse: "math.clz32(-121)", result: 0},
    { to_parse: "math.cos(6/10)", approximately: 0.8253356149096783},
    { to_parse: "math.cos(4/9)", approximately: 0.9028496693588987},
    { to_parse: "math.cos(2.1)", approximately: -0.5048461045998576},
    { to_parse: "math.cos(0.9999999999)", approximately: 0.5403023059522868},
    { to_parse: "math.cosh(6/10)", approximately: 1.1854652182422676},
    { to_parse: "math.cosh(4/9)", approximately: 1.1004019430183676},
    { to_parse: "math.cosh(2.1)", approximately: 4.1443131704103155},
    { to_parse: "math.cosh(0.9999999999)", approximately: 1.5430806346977237},
    { to_parse: "math.sin(6/10)", approximately: 0.5646424733950354},
    { to_parse: "math.sin(4/9)", approximately: 0.42995636352835553},
    { to_parse: "math.sin(2.1)", approximately: 0.8632093666488737},
    { to_parse: "math.sin(0.9999999999)", approximately: 0.8414709847538663},
    { to_parse: "math.sinh(0)", result: 0},
    { to_parse: "math.sinh(1)", approximately: 1.1752011936438014},
    { to_parse: "math.sinh(-1)", approximately: -1.1752011936438014},
    { to_parse: "math.sinh(2)", approximately: 3.626860407847019},
    { to_parse: "math.sinh(2.4)", approximately: 5.466229213676094},
    { to_parse: "math.tan(6/10)", approximately: 0.6841368083416923},
    { to_parse: "math.tan(4/9)", approximately: 0.47622143322449434},
    { to_parse: "math.tan(2.1)", approximately: -1.7098465429045073},
    { to_parse: "math.tan(0.9999999999)", approximately: 1.5574077243123503},
    { to_parse: "math.tanh(0)", result: 0},
    { to_parse: "math.tanh(1)", approximately: 0.7615941559557649},
    { to_parse: "math.tanh(-1)", approximately: -0.7615941559557649},
    { to_parse: "math.tanh(2)", approximately: 0.9640275800758169},
    { to_parse: "math.tanh(2.4)", approximately: 0.9836748576936802},
    { to_parse: "math.exp(0)", result: 1},
    { to_parse: "math.exp(1)", approximately: 2.718281828459},
    { to_parse: "math.exp(-1)", approximately: 0.36787944117144233},
    { to_parse: "math.exp(2)", approximately: 7.389056098930655},

    { to_parse: "math.expm1(0)", result: 0},
    { to_parse: "math.expm1(1)", approximately: 1.718281828459045},
    { to_parse: "math.expm1(-1)", approximately: -0.6321205588285577},
    { to_parse: "math.expm1(2)", approximately: 6.389056098930655},
    { to_parse: "math.fround(5.5)", result: 5.5},
    { to_parse: "math.fround(5.05)", result: 5.050000190734863},
    { to_parse: "math.fround(5)", result: 5},
    { to_parse: "math.fround(-5.03)", result: -5.03000020980835},

    { to_parse: "math.hypot(3, 4)", result: 5},
    { to_parse: "math.hypot(5, 12)", result: 13},
    { to_parse: "math.hypot(-3)", result: 3},
    { to_parse: "math.hypot(17 12)", approximately: 20.808652046684813},
    { to_parse: "math.hypot(50239 239232)", approximately: 244450.21363255134},
    { to_parse: "math.hypot(5239 -3932)", approximately: 1307},
    { to_parse: "math.hypot(5.239 39.32)", approximately: 39.667486950902244},
    { to_parse: "math.imul(3 4)", result: 12},
    { to_parse: "math.imul(-5 12)", result: -60},
    { to_parse: "math.imul(0xffffffff 5)", result: -5},
    { to_parse: "math.imul(0xfffffffe 5)", result: -10},
    { to_parse: "math.log(5)", approximately: 1.6094379124341},
    { to_parse: "math.log(-3)", result: undefined},
    { to_parse: "math.log(23.140685)", approximately: 3.1415923237474397},
    { to_parse: "math.log(0.34865)", approximately: -1.0536867253151172},
    { to_parse: "math.log10(100000)", result: 5},
    { to_parse: "math.log10(2)", approximately: 0.3010299956639812},
    { to_parse: "math.log10(1)", result: 0},
    { to_parse: "math.log10(0)", result: -Infinity},
    { to_parse: "math.log1p(1)", approximately: 0.6931471805599453},
    { to_parse: "math.log1p(0)", result: 0},
    { to_parse: "math.log1p(-1)", result: -Infinity},
    { to_parse: "math.log1p(-2)", result: undefined},
    { to_parse: "math.log2(3)", approximately: 1.584962500721156},
    { to_parse: "math.log2(2)", result: 1},
    { to_parse: "math.log2(1)", result: 0},
    { to_parse: "math.log2(0)", result: -Infinity},
    { to_parse: "math.max(1 3 73 9)", result: 73},
    { to_parse: "math.max([8 30 3])", result: 30},
    { to_parse: "math.max(0)", result: 0},
    { to_parse: "math.max((-12), (-43), (-2030))", result: -12},
    { to_parse: "math.max(-14 -12 0)", result: 0},
    { to_parse: "math.max([(-102) (-101.99999999999991) (-101.9999999999992)])", result: -101.9999999999992},
    { to_parse: "math.min(1 3 73 9)", result: 1},
    { to_parse: "math.min([8 30 3])", result: 3},
    { to_parse: "math.min(0)", result: 0},
    { to_parse: "math.min(-12, -43, -2030)", result: -2030},
    { to_parse: "math.min((-14) (-12) 0)", result: -14},
    { to_parse: "math.min([-102, -101.99999999999991, -101.9999999999992])", result: -102},
    { to_parse: "math.pow(3 5)", result: 243},
    { to_parse: "math.pow(3, -5)", approximately: 0.00411522633744856},
    { to_parse: "math.pow(4 0.5)", result: 2},
    { to_parse: "math.pow(7, -2)", approximately: 0.02040816326530612},
    { to_parse: "math.pow(-7 4)", result: 2401},
    // figure out how to test math.random
    //{ to_parse: "math.random()", result: 2401},
    
    { to_parse: "math.sign(-7.239)", result: -1},
    { to_parse: "math.sign(-0.239)", result: -1},
    { to_parse: "math.sign(5.9)", result: 1},
    { to_parse: "math.sign(0xfffffff)", result: 1},
    { to_parse: "math.sign(0)", result: 0},

    { to_parse: "math.sqrt(4)", result: 2},
    { to_parse: "math.sqrt(5)", approximately: 2.23606797749979},
    { to_parse: "math.sqrt(92)", approximately: 9.591663046625438},
    { to_parse: "math.sqrt(2.1)", approximately: 1.449137674618944},
    { to_parse: "math.sqrt(-4)", approximately: undefined},
    { to_parse: "math.trunc(0.04)", result: 0},
    { to_parse: "math.trunc(-1.002)", result: -1},
    { to_parse: "math.trunc(-27.9992)", result: -27},
    { to_parse: "math.trunc(17.0239123)", result: 17},
    { to_parse: "math.trunc(19.999991)", result: 19},
    { to_parse: "math.trunc(1)", result: 1},
    { to_parse: "math.trunc(1.999999999999999)", result: 1},
    { to_parse: "math.E()", approximately: 2.718281828459045},
    { to_parse: "math.LN10()", approximately: 2.302585092994046},
    { to_parse: "math.LN2()", approximately: 0.6931471805599453},
    { to_parse: "math.LOG10E()", approximately: 0.4342944819032518},
    { to_parse: "math.LOG2E()", approximately: 1.4426950408889634},
    { to_parse: "math.PI()", approximately: 3.141592653589793},
    { to_parse: "math.SQRT1_2()", approximately: 0.7071067811865476},
    { to_parse: "math.SQRT2()", approximately: 1.4142135623730951},

    //{ to_parse: "math.acos(8/10)", approximately: 0.64350110879}

];


describe('DTL Math Helpers', function(done) {

    describe('Basic', function() {
        tests.forEach(function(test, i) {

            it("Parsing '" + test.to_parse +"'", function() {
                var result;
                var res;
//                result = DTLExpressions.parse(test.to_parse, container);
                result = DTL.apply(container, { out: "(: " + test.to_parse + " :)" });
                if (typeof test.approximately != 'undefined') {
                    if (Array.isArray(test.approximately)) {
                        assert.approximately(result, test.approximately[0], test.approximately[1], "Result " + result + " is approximately " + test.approximately[0]);
                    } else {
                        assert.approximately(result, test.approximately, precision, "Result " + result + " is approximately " + test.approximately);
                    }
                } else {
                    assert.strictEqual(result, test.result, "Produces expected results: " + result + " = " + test.result );
                }
                if (i >= tests.length) {
                    done();
                }
            });
        });
    });


    // describe('filter helper function.', function() {
    //     var test = { to_parse: "filter($meta.filter_me 'url')"}
    //     it("Testing '" + test.to_parse + "'", function() {
    //         var result;
    //         var expected_result = {};
    //         result = DTL.apply(container, { out: "(: " + test.to_parse + " :)" });
    //         assert.deepEqual('result.foo);
    //     });
    // });


});
