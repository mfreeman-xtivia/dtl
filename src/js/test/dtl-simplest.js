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
'use strict';
var DTL = require('../lib/DTL.js');
var assert = require('assert');
var util = require('util');
const BigNumber = require('bignumber.js');


describe('Basic', function() {
    let input_data = {
        "number": 1234,
        "string": "1.234",
        "a": 0.1,
        "b": 0.2
    };

    it("Identity Transform", function() {
        var result;

        result = DTL.apply(input_data, { out: "(: $. :)" });
        assert.deepEqual(result, input_data, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_data) );
    });

    it("Basic math is right", function() {
        var result;
        let dtl = new DTL({ use_bignumber: false });

        result = dtl.apply(input_data, { out: "(: $a + $b :)" });
        assert.deepEqual(result, (0.1 + 0.2), "Produces expected results: 0.3 ~= "+ result );
    });

    it("BigNumber basic math is right", function() {
        var result;

        result = DTL.apply(input_data, { out: "(: 0.1 + 0.2 :)" });
        assert.equal(result, 0.3, "Produces expected results: 0.3  = "+ result );
    });

    it("BigNumber more complex math is right", function() {
        var result;
        let dtl = new DTL({ use_bignumber: true, return_bignumbers: true });

        let expected_result = BigNumber(2).times(7).plus(BigNumber(9).dividedBy(3.1)).minus(2);
        console.log(expected_result.toString());
    
        result = dtl.apply(input_data, { out: "(: 2 * 7 + 9 / 3.1 - 2 :)" });
        assert.equal(result.toString(), expected_result.toString(), "Produces expected results:"+ result );
        //assert.equal(result, 14.903225806451613, "Produces expected results:"+ result );
    });

    it("BigNumber math ops converts properly", function() {
        var result;
       
        result = DTL.apply(input_data, { out: "(: 17 + 2 == 19 && 12 * 2 == 24 :)" });
        assert.equal(result, true, "Produces expected results: 0.3  = "+ result );
    });

    it("BigNumber ops converts properly", function() {
        var result;
       
        result = DTL.apply(input_data, { out: "(: [ 12 -25 ] :)" });
        assert.equal(result, -13 , "Produces expected results: -13 = "+ result );
    });

});
