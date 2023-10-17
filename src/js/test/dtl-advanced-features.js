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



describe('DTL Advanced Features', function(done) {

    describe('Modified options', function() {
        it('changing transform_extractor works', function() {
            let options = {};

            options.transform_extractor = function(transform) {
                if ( typeof transform == "string" && transform.substring(0, 2) == '%%' &&
                    transform.substring(transform.length-2, transform.length) == '%%') {
                    return transform.substring(2, transform.length-2);
                } else {
                    return undefined;
                }
            }
            let transform = {
                "out": {
                    "parsed": "%% uuid() %%",
                    "notparsed": "(: uuid() :)"
                }
            }
            let result = DTL.apply(container, transform, "out", options);
            assert.equal(uuid.version(result.parsed), 4, 'transform is identified and processed correctly');
            assert.equal(result.notparsed, transform.out.notparsed, 'happy tags no longer function when overridden');
        });

        it('custom transform_extractor works on nested transform objects', function() {
            let options = {};

            options.transform_extractor = function(transform) {
                if ( typeof transform == "string" && transform.substring(0, 2) == '%%' &&
                    transform.substring(transform.length-2, transform.length) == '%%') {
                    return transform.substring(2, transform.length-2);
                } else {
                    return undefined;
                }
            }
            let transform = {
                "out": "%% $. -> sub_tx %%",
                "sub_tx": {
                    "parsed": "%% grep($meta.contacts '%% $item.name =~ /Bob/ %%') %%",
                    "notparsed": "(: uuid() :)"
                }
            }
            let result = DTL.apply(container, transform, "out", options);

            assert.equal(result.parsed.length, '2', 'nested transforms are identified and processed correctly');
            assert.equal(result.parsed[0].email, "bob@gmail.com", 'nested transform produces expected results');
            assert.equal(result.notparsed, transform.sub_tx.notparsed, 'happy tags still do not function in deep transforms');
        });

        it('contextual transform_extractor works', function() {
            let options = {};

            // don't copy this, this almost certainly won't work the way you want as $ is not present
            // in every DTL expression

            options.transform_extractor = function(transform) {
                if ( typeof transform == "string" && /\$/.test(transform) ) {
                    return transform;
                } else {
                    return undefined;
                }
            }
            let transform = {
                "out": {
                    "parsed": "keys($ctx)",
                    "notparsed": {
                        "word": "uuid()",
                        "number": "(: 5 :)"
                    }
                }
            }
            let result = DTL.apply(container, transform, "out", options);

            assert.equal(result.parsed.length, 2, 'nested transforms are identified and processed correctly');
            assert.deepEqual(result.notparsed, transform.out.notparsed, 'elements that do not match are left as-is');
        });

        it('returning a non-string in transform_extractor fails', function() {
            let options = {};

            options.transform_extractor = function(transform) {
                if ( typeof transform == "string" ) {
                    return { "result": "broken" };
                } else {
                    return undefined;
                }
            }
            let transform = {
                "out": {
                    "parsed": "%% uuid() %%",
                    "notparsed": "(: uuid() :)"
                }
            }
            let result = DTL.apply(container, transform, "out", options);

            assert.equal(result.parsed, transform.out.parsed, 4, 'transform is identified and processed correctly');
            assert.equal(result.notparsed, transform.out.notparsed, 'happy tags no longer function when overridden');
        });

        it("keyfilter option works", function() {
            var result;

            var expected_results = [ 72, 10, { things: 22 } ];
            var options = {};
            options.keyfilter = function(keys) {
                if (keys[0] != 'ctx') {
                    keys.unshift('meta')
                }
                return keys;
            };

            result = DTL.apply(container, { out: "(: [ $ctx.foo $bob $deep ] :)" }, 'out', options);
            assert.deepEqual(result, expected_results, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(expected_results) );
        });
    });

});
