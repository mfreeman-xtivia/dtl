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
var chai = require('chai');
var assert = chai.assert;
var util = require('util');
var DTL = require('../lib/DTL.js');
var uuid = require('uuid');

var container = {
                   ctx: { "foo": 72, 'request': { 'origin': { 'detail': { port: 25 }}}},
                   meta: { "bob":10, "john":22, "will":"no", "deep": { "things": 22 },
                           "@unusual:": 'is ok',
                           "obj_list" : {
                               'fff' : {
                                   'name': 'fff',
                               },
                               'abc' : {
                                   'name': 'abc'
                               },
                               'zz' : {
                                   'name': 'zz',
                               },
                               'ccf' : {
                                   'name': 'ccf',
                                   'bar': null
                               }
                           },
                           "sortable" : [
                               { 'name' : 'fff'},
                               { 'name' : 'ccc'},
                               { 'name' : 'ddd'},
                               { 'name' : 'aaa'},
                               { 'name' : 'cmy'},
                               null
                           ],
                           "sortable_numeric" : [
                               { 'val' : 10},
                               { 'val' : 120},
                               { 'val' : 300},
                               { 'val' : 700},
                               { 'val' : 111},
                               { 'val' : 11},
                               { 'val' : 22},
                           ],
                           "filter_me" : {
                               name : 'a name',
                               foo : 'a foo',
                               url : 'http://foo.bar.com/?x=1&m=500'
                           },
                           "numbers": ['1','2','3','4','5'],
                           "nullers": ['1', undefined, '2','3','4','5'],
                            "url": "http://foo.bar.com/fuzzy/about.php",
                            "long_url" : 'http://foo.bar.com:900/path/to/do?a=1',
                            "encode_me" : "hello world",
                            "long_path" : 'the/long/path/to/do/the/thing',
                            "thing": "port",
                            "this.thing": 173,
                            "list": ["bob", "john", "will", "shallow"],
                            "Step": 3,
                            "content-type": 'text/plain',
                            "pair": ["the_key", "the_value"],
                            "pairs": [["key2", "value2"],["key3", "value3"]],
                            "key": { is: 'meta.deep.things' },
                            "phone" : "303-554-9000",
                            "not_true" : false,
                            "contacts": [
                                {
                                    "email": "bob@gmail.com",
                                    "name": "Bob Wilson"
                                },
                                {
                                    "email": "bob@yahoo.com",
                                    "name": "Bob Johnson"
                                },
                                {
                                    "email": "kate@gmail.com",
                                    "name": "Kate Smith"
                                },
                                {
                                    "email": "dude@example.com",
                                    "name": "Jeffry Lebowski"
                                },
                                {
                                    "email": "donny@example.com",
                                    "name": "Theodore Donald Kerabatsos"
                                }
                            ]
                        }

                };

var tests = [
    { to_parse: "reverse($meta.numbers)", result: ['5','4','3','2','1']},
    { to_parse: "transform($meta.obj_list.abc { ['out' '(: $.name :)']} )", result: 'abc'},
    { to_parse: "transform($meta.obj_list.abc '(: $.name :)' )", result: 'abc'},
    { to_parse: "grep($meta.filter_me '(: $index != `url` :)')", result: { name: 'a name', foo: 'a foo' }},
    { to_parse: "grep($meta.filter_me '(: $index != $extra :)' undef 'url')", result: { name: 'a name', foo: 'a foo' }},
    { to_parse: "split($meta.long_path '/')", result: [ 'the', 'long', 'path', 'to', 'do', 'the', 'thing' ]},
    { to_parse: "split($meta.nonexistant '/')", result: undefined},
    { to_parse: "head($meta.numbers 3)", result: [ '1', '2', '3' ]},
    { to_parse: "tail($meta.numbers 3)", result: ['3', '4','5']},
    { to_parse: "keys($meta.obj_list)", result: [ 'fff', 'abc', 'zz', 'ccf' ]},
    { to_parse: "keys($meta.obj_that_doesnt_exist)", result: []},

    { to_parse: "values($meta.obj_list)", result: [ { name: 'fff' },{ name: 'abc' },{ name: 'zz' },{ name: 'ccf', bar: null } ]},
    { to_parse: "values($meta.numbers)", result: [ '1', '2', '3', '4', '5' ]},
    { to_parse: "values($meta.long_path)", result: ['the/long/path/to/do/the/thing' ]},
    { to_parse: "sort_by($meta.sortable '(: $.name :)' false)", result: [{name: 'aaa'},{name: 'ccc'},{name: 'cmy'},{name: 'ddd'},{name: 'fff'},null ]},
    { to_parse: "sort_by($meta.sortable_numeric '(: $.val :)' false)", result: [{val: 10},{val: 11},{val: 22},{val: 111},{val: 120},{val: 300},{val: 700}]},
    { to_parse: "sort_by( grep( values($meta.obj_list) '(: $item.name =~ m/f/:)' ) '(: $.name :)')", result: [ { name: 'ccf', bar: null }, { name: 'fff' } ]},
    { to_parse: "sort($meta.sortable_numeric '(: ($a.val % 3) <=> ($b.val % 3) :)')", result: [{val: 120},{val: 300},{val: 111},{val: 10},{val: 700},{val: 22},{val: 11}] },
    // home-made reverse sort.
    { to_parse: "sort($meta.sortable_numeric '(: $b.val <=> $a.val :)')", result: [ {val: 700},{val: 300},{val: 120},{val: 111},{val: 22},{val: 11},{val: 10}]},
    { to_parse: "reverse(sort($meta.sortable_numeric '(: $a.val <=> $b.val :)' ))", result: [ {val: 700},{val: 300},{val: 120},{val: 111},{val: 22},{val: 11},{val: 10}]},
    // grep based head
    { to_parse: "grep($meta.numbers '(: $index < 3 :)')", result: [ '1', '2', '3' ]},
    // grep based tail
    { to_parse: "grep($meta.numbers '(: $index >= (length($all)-3) :)')", result: ['3','4','5']},
    { to_parse: "grep($meta.sortable_numeric '(: $item.val > 100 :)' '(: $item.val / 10 :)' )", result: [12,30,70,11.1]},
    { to_parse: "grep($meta.sortable_numeric '(: $item.val > $extra.0 :)' '(: $item.val / $extra.1 :)' [ 100 10 ] )", result: [12,30,70,11.1]},
    { to_parse: "grep($meta.obj_list.ccf)", result: { name: 'ccf' }},
    { to_parse: "grep($meta.nonexist '(: !empty($item) :)')", result: [] },
    { to_parse: "diff($meta.nullers [undefined])", result: ['1', '2', '3', '4', '5']},
    { to_parse: "group($meta.sortable `(: ?($item.name =~ m/c/ 'has_c' 'no_c') :)`)",
            result: { no_c: [ { name: 'fff' }, { name: 'ddd' }, { name: 'aaa' }, null ], has_c: [ { name: 'ccc' }, { name: 'cmy' } ] }},
    { to_parse: "group($meta.sortable_numeric `(: &('remainder_' $item.val % 3)  :)` `(: $item.val :)`)",
            result: { remainder_1: [ 10, 700, 22 ], remainder_0: [ 120, 300, 111 ], remainder_2: [ 11 ] }},
    { to_parse: "group($meta.sortable_numeric `(: ?( ($item.val % 3 !=0) $item.val % 3 )  :)` `(: $item.val :)`)",
            result: { "1": [ 10, 700, 22 ], "2": [ 11 ] }},
    // time in strftime is assumed to be 'local' unless a timezone argument is provided.
    { to_parse: "now()", approximately: [Date.now(),  2000]},
    { to_parse: "now(true)", approximately: [Date.now()/1000,  2]},
    { to_parse: "strftime('%F' 1446002614265 '+0000')", result: "2015-10-28"},
    { to_parse: "strftime('%F' [2012 07 01 02 01])", result: "2012-07-01"},
    { to_parse: "strftime('%F' [2012 07 01 02 01 22 222])", result: "2012-07-01"},
    { to_parse: "strftime('%F' [2012 07 01 02 01 22 222] '+0200')", result: "2012-07-01"},

    { to_parse: "strftime('%F %T' [2012 07 01 02 01 22 222 ])", result: "2012-07-01 02:01:22"},
    { to_parse: "strftime('%F %T' '2012-07-01T02:01:22.222+00:00' )", result: "2012-07-01 02:01:22"},
    { to_parse: "strftime('%F %T.%L' 1446002614265 '+0000')", result: "2015-10-28 03:23:34.265"},
    { to_parse: "strftime('%F %T.%L' 'now')", regex: "^[0-9]{4}\-[0-9]{2}\-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}"},
    { to_parse: "strftime('%F %T' {[ 'year' 2012 ] ['month' 7] ['day' 01 ] ['hour' 02] ['minutes' 01] ['seconds' 22] ['milliseconds' 222 ]})", result: "2012-07-01 02:01:22"},
    { to_parse: "strftime('%F %T' {[ 'year' 2012 ] ['month' 7] ['day' 01 ]})", result: "2012-07-01 00:00:00"},
    { to_parse: "strftime('%s' {[ 'year' 2012 ] ['month' 7] ['day' 01 ]} '+0000')", result: "1341100800"},
    { to_parse: "strftime('%s%L' '2014-09-21T04:01:22.232+00:00')", result: "1411272082232"},
    { to_parse: "strftime('%F %T' 1446002614265 '+0000')", result: "2015-10-28 03:23:34"},
    { to_parse: "strftime('%F %T' 1446002614265 '-0600')", result: "2015-10-27 21:23:34"},
    { to_parse: "strftime('%F %T' {[ 'year' 2012 ] ['month' 7] ['day' 01 ] ['hour' 02] ['minutes' 01] ['seconds' 22] ['milliseconds' 222 ]} '+0000')", result: "2012-07-01 02:01:22"},
    { to_parse: "strftime('%F %T' {[ 'year' 2012 ] ['month' 7] ['day' 01 ] ['hour' 02] ['minutes' 01] ['seconds' 22] ['milliseconds' 222 ]} '-0600')", result: "2012-06-30 20:01:22"},
    { to_parse: "strftime('%F %T.%L' )", result: undefined },
    { to_parse: "strftime('%F %T.%L' $meta.nonexist)", result: undefined },
    { to_parse: "strftime('%s%L' '2015-10-27T00:00:00.000+00:00')", result: "1445904000000" },


];


describe('DTL Helpers', function(done) {

    describe('Basic', function() {
        tests.forEach(function(test, i) {

            it("Parsing '" + test.to_parse +"'", function() {
                var result;
                var res;
                var precision = 0.0001;
//                result = DTLExpressions.parse(test.to_parse, container);
                result = DTL.apply(container, { out: "(: " + test.to_parse + " :)" });
                if (typeof test.approximately != 'undefined') {
                    if (Array.isArray(test.approximately)) {
                        assert.approximately(result, test.approximately[0], test.approximately[1], "Result " + result + " is approximately " + test.approximately[0]);
                    } else {
                        assert.approximately(result, test.approximately, precision, "Result " + result + " is approximately " + test.approximately);
                    } 
                } else if (test.regex ) {
                    var r = new RegExp(test.regex);
                    assert.ok(r.test(result), 'RegExp passes');
                } else {
                    if (typeof test.result == 'object') {
                        assert.deepEqual(result, test.result, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(test.result) );
                    } else {
                        assert.strictEqual(result, test.result, "Produces expected results: " + result + " = " + test.result );
                    }
                }
                if (i >= tests.length) {
                    done();
                }
            });
        });
    });

    describe('uuid versions', function() {
        it('uuid without version produces v4 uuid', function() {
            let transform = {
                "out": "(: uuid() :)"
            }
            let result = DTL.apply(container, transform);
            assert.equal(uuid.version(result), 4, 'uuid is correct version');
        });
        it('uuid with version 4 produces v4 uuid', function() {
            let transform = {
                "out": "(: uuid(4) :)"
            }
            let result = DTL.apply(container, transform);
            assert.equal(uuid.version(result), 4, 'uuid is correct version');
        });
        it('uuid with version 1 produces v1 uuid', function() {
            let transform = {
                "out": "(: uuid(1) :)"
            }
            let result = DTL.apply(container, transform);
            assert.equal(uuid.version(result), 1, 'uuid is correct version');
        });
        it('uuid with version 3 produces v3 uuid', function() {
            let namespace = uuid.v4();
            let transform = {
                "out": "(: uuid(3 'bob' $namespace) :)"
            }
            var expected = uuid.v3('bob', namespace);

            let result = DTL.apply({ namespace: namespace }, transform);
            let result2 = DTL.apply({ namespace: namespace }, transform);
            let result3 = DTL.apply({ namespace: uuid.v4() }, transform);
            assert.equal(uuid.version(result), 3, 'uuid is correct version');
            assert.equal(result, expected, 'uuid is calculated correctly');
            assert.equal(result, result2, 'uuid with same name and namespace produce the same result');
            assert.notEqual(result, result3, 'uuid with same name and different namespace produce different result');
        });
        it('uuid version 3 without namespace fails', function() {
            let transform = {
                "out": "(: uuid(3 'bob' undefined) :)"
            };
            let fail = false;
            try {
                let result = DTL.apply({ namespace: namespace }, transform);
            } catch(e) {
                fail = true;
            }
            assert.equal(fail, true, 'missing namespace triggers failure');
        });
        it('uuid with version 5 produces v5 uuid', function() {
            let namespace = uuid.v4();
            let transform = {
                "out": "(: uuid(5 'bob' $namespace) :)"
            }
            var expected = uuid.v5('bob', namespace);

            let result = DTL.apply({ namespace: namespace }, transform);
            let result2 = DTL.apply({ namespace: namespace }, transform);
            let result3 = DTL.apply({ namespace: uuid.v4() }, transform);
            assert.equal(uuid.version(result), 5, 'uuid is correct version');
            assert.equal(result, expected, 'uuid is calculated correctly');
            assert.equal(result, result2, 'uuid with same name and namespace produce the same result');
            assert.notEqual(result, result3, 'uuid with same name and different namespace produce different result');
        });
        it('uuid version 5 without namespace fails', function() {
            let transform = {
                "out": "(: uuid(5 'bob' undefined) :)"
            };
            let fail = false;
            try {
                let result = DTL.apply({ namespace: namespace }, transform);
            } catch(e) {
                fail = true;
            }
            assert.equal(fail, true, 'missing namespace triggers failure');
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
