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
                   ctx: { "foo": 72, 'request': { 'origin': { 'detail': { port: 25 }}}},
                   meta: { "bob":10, "john":22, "will":"no", "deep": { "things": 22 },
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
                               { 'val' : null}
                           ],
                           "filter_me" : {
                               name : 'a name',
                               foo : 'a foo',
                               url : 'http://foo.bar.com/?x=1&m=500'
                           },
                           "numbers": ['1','2','3','4','5'],
                            "url": "http://foo.bar.com/fuzzy/about.php",
                            "long_url" : 'http://foo.bar.com:900/path/to/do?a=1',
                            "encode_me" : "hello world",
                            "long_path" : 'the/long/path/to/do/the/thing',
                            "thing": "port",
                            "this.thing": 173,
                            "list": ["bob", "john", "will", "shallow"],
                            "Step": 3,
                            "content-type": 'text/plain',
                            "key": { is: 'meta.deep.things' },
                            "phone" : "303-554-9000",
                            "not_true" : false
                        }

                };

var input_user = {
            "id": "U04C7UV3M",
            "name": "jaykuri",
            "deleted": false,
            "status": null,
            "color": "df3dc0",
            "real_name": "Jay Kuri",
            "tz": "America\/Denver",
            "tz_label": "Mountain Daylight Time",
            "tz_offset": -21600,
            "profile": {
                "first_name": "Jay",
                "image_24": "https:\/\/s3-us-west-2.amazonaws.com\/slack-files2\/avatars\/2015-04-10\/4416156249_908b9f7fd1e07a1e4cd1_24.jpg",
                "image_32": "https:\/\/s3-us-west-2.amazonaws.com\/slack-files2\/avatars\/2015-04-10\/4416156249_908b9f7fd1e07a1e4cd1_32.jpg",
                "image_48": "https:\/\/s3-us-west-2.amazonaws.com\/slack-files2\/avatars\/2015-04-10\/4416156249_908b9f7fd1e07a1e4cd1_48.jpg",
                "image_72": "https:\/\/s3-us-west-2.amazonaws.com\/slack-files2\/avatars\/2015-04-10\/4416156249_908b9f7fd1e07a1e4cd1_72.jpg",
                "image_192": "https:\/\/s3-us-west-2.amazonaws.com\/slack-files2\/avatars\/2015-04-10\/4416156249_908b9f7fd1e07a1e4cd1_192.jpg",
                "image_original": "https:\/\/s3-us-west-2.amazonaws.com\/slack-files2\/avatars\/2015-04-10\/4416156249_908b9f7fd1e07a1e4cd1_original.jpg",
                "last_name": "Kuri",
                "title": "Hookify.io: we build stuff so you can focus on what you want to build.",
                "skype": "",
                "phone": "844-COR-VIDA",
                "real_name": "Jay Kuri",
                "real_name_normalized": "Jay Kuri",
                "email": "jay@example.hookify.io"
            },
            "is_admin": false,
            "is_owner": false,
            "is_primary_owner": false,
            "is_restricted": false,
            "is_ultra_restricted": false,
            "is_bot": false,
            "has_files": false,
            "has_2fa": false
        };

var github_data = JSON.parse(fs.readFileSync(__dirname +'/assets/github-events.json'));
var month_data = JSON.parse(fs.readFileSync(__dirname +'/assets/months.json'));

describe('Advanced DTL Expressions', function() {
    describe('map array', function() {
        it("simple", function() {
            var result;
            var transform = {
              out: "(: map($. 'subitem') :)",
              subitem: "(: $.item.type :)"
            };
            var expected = [ 'PushEvent', 'CreateEvent', 'PushEvent', 'PushEvent', 'PushEvent', 'PushEvent', 'CreateEvent', 'CreateEvent', 'CreateEvent' ];

            //console.log(github_data);
            result = DTL.apply(github_data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });
        it("calculated", function() {
            var result;
            var transform = {
              out: "(: map($. 'subitem') :)",
              subitem: "(: {($.index : !empty($.item.payload.commits))} :)"
            };
            var expected = [ { '0': true }, { '1': false }, { '2': true }, { '3': true }, { '4': true }, { '5': true }, { '6': false }, { '7': false }, { '8': false } ];
            //console.log(github_data);
            result = DTL.apply(github_data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });
        it("complex", function() {
            var result;
            var transform = {
              out: "(: { map($. 'subitem') } :)",
              subitem: "(: (('item_' & $.index ) : !empty($.item.payload.commits)) :)"
              //subitem: "(: ('item_' + $.index ) :)"
            };
            var expected = { item_0: true,
                            item_1: false,
                            item_2: true,
                            item_3: true,
                            item_4: true,
                            item_5: true,
                            item_6: false,
                            item_7: false,
                            item_8: false };


            //console.log(github_data);
            result = DTL.apply(github_data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });
        it("simple dummy variables", function() {
            // assuming input object where 'options' contains the list of possible values
            // and 'datapoint' key contains the input data:  [ ['A','B','C,'D' ] $datathing ]
            var result;
            var transform = {
            	out: "(: { map( $.options 'truthy' $.datapoint) } :)",
            	truthy: "(: [ ('var_' & $item) ($extra == $item) ] :)"
            };

            result = DTL.apply( { options: ["window", "port", "door"], "datapoint": container.meta.thing}, transform);
            assert.deepEqual(result, { 'var_window': false, 'var_port': true, 'var_door': false});
        });

    });
    describe('map object', function() {
        it("map to identity", function() {
            var result;
            var transform = {
              out: "(: { map($. 'subitem') } :)",
              subitem: "(: ( $.index : $.item ) :)"
            };
            var expected = [ 'PushEvent', 'CreateEvent', 'PushEvent', 'PushEvent', 'PushEvent', 'PushEvent', 'CreateEvent', 'CreateEvent', 'CreateEvent' ];

            //console.log(github_data);
            result = DTL.apply(input_user, transform);
            //console.log( util.inspect(result));
            assert.deepEqual(result, input_user, "Produces expected results: " + util.inspect(result) + " =- " + util.inspect(input_user) );
        });

        it("map on undefined", function() {
            var result;
            var transform = {
              out: "(: { map($.foobar 'subitem') } :)",
              subitem: "(: ( $.index : $.item ) :)"
            };
            var expected = {};

            //console.log(github_data);
            result = DTL.apply(input_user, transform);
            //console.log( util.inspect(result));
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " =- " + util.inspect(expected) );
        });

        it("get keys", function() {
            var result;
            var transform = {
              out: "(: map($. 'subitem') :)",
              subitem: "(:  $.index  :)"
            };
            var expected = [ 'PushEvent', 'CreateEvent', 'PushEvent', 'PushEvent', 'PushEvent', 'PushEvent', 'CreateEvent', 'CreateEvent', 'CreateEvent' ];

            //console.log(github_data);
            result = DTL.apply(input_user, transform);
            //console.log( util.inspect(result));
            assert.deepEqual(result, Object.keys(input_user).sort(), "Produces expected results: " + util.inspect(result) + " =- " + util.inspect(input_user) );
        });
        it("get values", function() {
            var result;
            var transform = {
              out: "(: map($. 'subitem') :)",
              subitem: "(:  $.item  :)"
            };
            var keys = Object.keys(input_user).sort();
            var expected = [];

            keys.forEach(function(item) {
                expected.push(input_user[item]);
            });

            //console.log(github_data);
            result = DTL.apply(input_user, transform);
            //console.log( util.inspect(result));
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " =- " + util.inspect(input_user) );
        });
    });
    describe('reduce', function() {
        it("simple", function() {
            var result;
            // this gives a count of records with commits.
            var transform = {
              out: "(: reduce($. 'subitem' 0) :)",
              subitem: "(: ?(!empty($.item.payload.commits) ($.memo + 1) $.memo) :)"
            };
            var expected = 5;

            result = DTL.apply(github_data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected) );
        });
        it("complex", function() {
            var result;
            // this gives a count of records with commits.
            var transform = {
              out: "(: reduce($. 'subitem') :)",
              subitem: {
                  "total": "(: $.memo.total + $item.id :)",
                  "count": "(: $.memo.count + 1 :)",
                  "average": "(: ($.memo.total + $item.id) / ($.memo.count + 1) :)"
              }
            };
            var expected = { total: 25259894373, count: 9, average: 2806654930.3333333 };

            result = DTL.apply(github_data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected) );
        });
        it("object", function() {
            var result;
            var transform = {
                out: "(: reduce($. 'sum_days' 0) :)",
                sum_days: "(: $memo + $item.days :)"
            };
            var expected = 365;

            result = DTL.apply(month_data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected) );

        });
    });
    describe('chain', function() {
        it('soundex using chain', function() {
            var result;
            var transform = {
                "out": "(: map($.words 'soundex') :)",
                "soundex": "(: substr(&(substr(uc($item) 0 1) chain(substr($item 1) 'soundex_chain')) 0 4) :)",
                "soundex_chain": [
                            "(: replace($. '/[AEIOUHWY]+/gi' '') :)",
                            "(: replace($. '/[BFPV]+/gi' '1') :)",
                            "(: replace($. '/[CGJKQSXZ]+/ig' '2') :)",
                            "(: replace($. '/[DT]+/ig' '3') :)",
                            "(: replace($. '/[L]+/ig' '4') :)",
                            "(: replace($. '/[MN]+/ig' '5') :)",
                            "(: replace($. '/[R]+/ig' '6') :)",
                            "(: &($. '000') :)"
                        ]
            };
            var data = {
                "words": [
                    "bob",
                    "foobar",
                    "foobbarbaz",
                    "magic",
                    "majick",
                    "inconceivable"
                ]
            };
            var expected = [
                "B100",
                "F160",
                "F161",
                "M200",
                "M200",
                "I525"
            ];
            result = DTL.apply(data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected) );
        });
    });
    describe('derive', function() {
        it('complex derive', function() {
            var result;
            var transform = {
                "out": "(: grep(map($.words `(: derive($. 'derivation_map') :)` )) :)",
                "derivation_map": [
                    [ "(: $item =~ /z/ :)", "(: 'has_z' :)" ],
                    [ "(: $item =~ /[aeiou]{2}/ :)", "(: 'double' :)"],
                    [ "(: $item =~ /b/ :)", "(: 'has_b' :)" ],
                    [ "(: typeof($item) == 'number' :)", "(: undefined :)" ],
                    [ "(: typeof($item) == 'array' :)", "array_handler"],
                    [ "(: true :)", "(: $item :)"]
                ],
                "array_handler": "(: reduce($item '(: $memo + $item :)') :)"
            };
            var data = {
                "words": [
                    "bob",
                    "foobar",
                    "foobbarbaz",
                    "magic",
                    "majick",
                    7,
                    "inconceivable",
                    [
                        8,
                        2
                    ],
                    "incontrivertible"
                ]
            };
            var expected = [
                "has_b",
                "double",
                "has_z",
                "magic",
                "majick",
                "double",
                10,
                "has_b"
            ];
            result = DTL.apply(data, transform);
            assert.deepEqual(result, expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected) );
        });
    });
/*
    describe("shortcuts", function() {
        it('or_shortcut works', function() {
            var result;
            var transform = {
                "out": "(: shortcut_or( @(1) @('foo')) :)"
            };
            result = DTL.apply({}, transform);
            assert.deepEqual(result, "1"); //expected, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected) );

        });
    });
*/
});
