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

var container = {
                   "$foo": "william",
                   ctx: { "foo": 72, 'request': { 'origin': { 'detail': { port: 25 }}}},
                   meta: { "bob":10, "john":22, "will":"no", "deep": { "things": 22 },
                           "null": null,
                           "undef": undefined,
                           "boolean": true,
                           "foo,bar": "foobar",
                           "$foo": "foobar",
                           "reg": "foo",
                           "number": 4, // guaranteed to be random: chosen by fair dice roll
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
                               { 'val' : null}
                           ],
                           "filter_me" : {
                               name : 'a name',
                               foo : 'a foo',
                               url : 'http://foo.bar.com/?x=1&m=500'
                           },
                           "json_test": {
                               "name": "testy",
                               "value": undefined
                           },
                           "numbers": ['1','2','3','4','5'],
                           "letters": [ '@', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q',
                                        'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z' ],
                           "sub_numbers": [1, 2, 3, [4, 5]],
                           "deep_numbers": [1, 2, 3, [4, 5, [6, 7]], [9, 12, [22, [33, [45,63,[88,12]]]]]],
                           "url": "http://foo.bar.com/fuzzy/about.php",
                           "long_url" : 'http://foo.bar.com:900/path/to/do?a=1',
                           "encode_me" : "hello world",
                           "long_path" : 'the/long/path/to/do/the/thing',
                           "thing": "port",
                           "this.thing": 173,
                           "number_thing": "192381.110000001",
                           "list": ["bob", "john", "will", "shallow"],
                           "Step": 3,
                           "content-type": 'text/plain',
                           "pair": ["the_key", "the_value"],
                           "pairs": [["key2", "value2"],["key3", "value3"]],
                           "key": { is: 'meta.deep.things' },
                           "phone" : "303-554-9000",
                           "not_true" : false,
                           "wacky_key": '[foo].baz',
                           "wacky": {
                               "foo+bar": "one",
                               "foo<bar": "two",
                               "foo-bar": "three",
                               "foo..bar": "four",
                               "12..18": "five",
                               "foo=>bar": "six",
                               "foo]bar": "seven",
                               "foo].bar": "eight",
                               "[foo].baz": "nine"
                           }
                        }
                };

var tests = [
    { to_parse: '99', result: 99},
    { to_parse: '98.6', result: 98.6},
    { to_parse: '+98.6', result: 98.6},
    { to_parse: '-98.6', result: -98.6},
    { to_parse: '0x84', result: 132 },
    { to_parse: '0xFF', result: 255 },
    { to_parse: '0xff', result: 255 },
    { to_parse: '0xF0', result: 240 },
    { to_parse: '0xf0', result: 240 },
    { to_parse: '-0xf0', result: -240 },
    { to_parse: '0x8abcdef', result: 145477103 },

    { to_parse: '0x0abDF0', result: 703984 },
    { to_parse: '-0x3fedcba', result: -67034298 },
    { to_parse: '0o2', result: 2 },
    { to_parse: '0o23', result: 19 },
    { to_parse: '-0o23', result: -19 },
    { to_parse: '0o755', result: 493 },
    { to_parse: '0o1323', result: 723 },
    { to_parse: '0b10', result: 2 },
    { to_parse: '0b101', result: 5 },
    { to_parse: '0b101010', result: 42 },
    { to_parse: '"double quoted"', result: "double quoted" },
    { to_parse: "'single quoted'", result: "single quoted" },
    { to_parse: '`back quoted`', result: "back quoted" },
    { to_parse: '27 * 1', result: 27 },
    { to_parse: '26 + 1', result: 27 },
    { to_parse: '26 - 1', result: 25 },
    { to_parse: '26 / 2', result: 13 },
    { to_parse: '-12', result: -12},
    { to_parse: '2 - (12)', result: -10},
    { to_parse: '2 - 11', result: -9},
    { to_parse: '(-12)', result: -12},
    { to_parse: '2 - (12)', result: -10},
    { to_parse: '2 - (-12)', result: 14},
    { to_parse: '2 - -12', result: 14},
    { to_parse: '2--12', result: 14},
    { to_parse: '2 + +12', result: 14},
    { to_parse: '2-+98.6', result: -96.6},
    { to_parse: '2+-98.6', result: -96.6},
    { to_parse: '2 * -12', result: -24},
    { to_parse: '(27 * 1) == (26 + 1)', result: true },
    { to_parse: '(13 * 2 * 2) == 52', result: true },
    { to_parse: '(13 * 2 + 7)', result: 33 },
    { to_parse: '(7 + 2 * 13)', result: 33 },
    { to_parse: '13 * (2 + 7)', result: 117 },
    { to_parse: '7 + (2 * 13)', result: 33 },
    { to_parse: '(2 + 7) * 13', result: 117 },
    { to_parse: '(2 * 13) + 7', result: 33 },
    { to_parse: '((2 * 13) + 7)', result: 33 },
    { to_parse: '6 < 7', result: true},
    { to_parse: '6 <= 6', result: true},
    { to_parse: '17.5 >= 17', result: true},

    { to_parse: '6 <= 2 * 3', result: true},
    { to_parse: '7 > (2+3) == true', result: true},
    { to_parse: '2 + 7 + 9 * 3 + 2', result: 38 },
    { to_parse: '2 * 7 + 9 * 3 + 2', result: 43 },
    { to_parse: '2 * 7 + 9 / 3 - 2', result: 15 },
    { to_parse: '2 ^ 3', result: 8 },
    { to_parse: '2 ^ 3 * 2', result: 16 },
    { to_parse: '2 ^ 3 * 2', result: 16 },
    { to_parse: '17 % 3', result: 2 },
    { to_parse: '2 + 7 + (9 * 3) + 2', result: 38 },
    { to_parse: '(2 * 7) + (9 * 3) + 2', result: 43 },
    { to_parse: '2 + (7 + 9) * 3 + 2', result: 52 },
    { to_parse: '2 * (7 + 9) * (3 + 2)', result: 160 },
    { to_parse: '(2 * (7 + 9) * (3 + 2)) == 160', result: true },

    { to_parse: '2 * (7 + 9) * (3 + 2) == 160', result: true },
    { to_parse: '2 + 2 == 4', result: true },
    { to_parse: '2 * 3 == 6', result: true },
    { to_parse: '2 <=> 3', result: -1 },
    { to_parse: '3 <=> 2', result: 1 },
    { to_parse: '3 <=> 3', result: 0},
    { to_parse: '"apple" <=> "apple"', result: 0},
    { to_parse: '"bob" <=> "alice"', result: 1},
    { to_parse: '"alligator" <=> "zebra"', result: -1},
    { to_parse: '"a" <=> 9', result: 1},
    { to_parse: '9 <=> "a"', result: -1},
    { to_parse: '9.012 <=> "9"', result: 1}, // can't fool me.
    { to_parse: '$meta.bob + 7 == 17', result: true },
    { to_parse: '$meta.bob + 2 * 2 == 14', result: true },
    { to_parse: '"bob" !== "boob"', result: true},
    { to_parse: '$meta.bob == 10', result: true },
    { to_parse: '$meta.bob === 10', result: true },
    { to_parse: '120 / $meta.bob ', result: 12 },
    { to_parse: '"bob" & "boob"', result: "bobboob"},
    { to_parse: '$meta.deep.things == 22', result: true },
    { to_parse: '$meta.deep.things != 26', result: true },
    { to_parse: '$meta.nonexistant.things == undefined', result: true },
    { to_parse: '$meta.nonexistant.things == undef', result: true },
    { to_parse: 'exists($meta.nonexistant.things)', result: false },
    { to_parse: 'exists($meta.deep.things)', result: true },
    { to_parse: 'exists($meta.deep.fiddle)', result: false },
    { to_parse: '((27 * 1) == (26 + 1)) == true', result: true },
    { to_parse: '$meta.bob', result: 10 },
    { to_parse: '$ctx.foo', result: 72 },
    { to_parse: '( $meta.bob + 17 ) == 27', result: true},
    { to_parse: '( $meta.bob *2 ) == 20', result: true},
    { to_parse: '!(!$meta.not_true)', result: false},
    { to_parse: '!(!$meta.Step)', result: true},

    { to_parse: '( 10 + 17 ) == 27', result: true},
    { to_parse: '( $meta.will ) == "no"', result: true},
    { to_parse: '(( $meta.will )) == "no"', result: true},
    { to_parse: '(( $meta.will ) != "no")', result: false},
    { to_parse: 'undef == undefined', result: true },
    { to_parse: 'true != false', result: true },
    { to_parse: 'true == true && 17 == 17', result: true },
    { to_parse: 'true == true && 17 == 12', result: false },
    { to_parse: '17 + 2 == 19 && 12 * 2 == 24', result: true},
    { to_parse: '17 + 2 == 11 || 12 * 2 == 24', result: true},
    { to_parse: '17 + 2 == 11 || 12 * 2 == 26 || $meta.will == "no"', result: true},
    { to_parse: '17 + 2 == 19 && $ctx.foo * 2 == 144', result: true},
    { to_parse: '17 + 2 == 19 && 12 * 2 == 24', result: true},
    { to_parse: '(17 + 2 == 19 && 12 * 2 == 26) || $meta.will == "no"', result: true},
    { to_parse: '!true', result: false},
    { to_parse: '!(11 == 17)', result: true},
    { to_parse: '!(17 + 2 == 19 && 12 * 2 == 26) || $meta.will != "no"', result: true},
    { to_parse: "undefined || '' || $meta.will", result: "no"},
    { to_parse: "'ctx.config'", result: "ctx.config" },
    { to_parse: "'%foo'", result: "%foo" },
    { to_parse: "'.FileSpec'", result: ".FileSpec"},
    { to_parse: "uc('.FileSpec')", result: ".FILESPEC"},
    { to_parse: "lc('.FileSpec')", result: ".filespec"},
    { to_parse: "'>foo'", result: ">foo"},
    { to_parse: "'<foo'", result: "<foo"},
    { to_parse: "'=foo'", result: "=foo"},
    { to_parse: "'!foo'", result: "!foo"},
    { to_parse: "'^foo'", result: "^foo"},
    { to_parse: "'foo>'", result: "foo>"},
    { to_parse: '"<img "', result: "<img "},
    { to_parse: '"26 / 2"', result: "26 / 2" },
    { to_parse: '"foo"', result: "foo"},
    { to_parse: '"foo>s"', result: "foo>s"},
    { to_parse: '$meta.will', result: "no"},
    { to_parse: 'x${meta.will}', result: "xno"},
    { to_parse: '"no"', result: "no"},
    { to_parse: '"I\\\'ll see"', result: "I'll see"},
    { to_parse: "'I\\'ll see'", result: "I'll see"},
    { to_parse: "'I\\\"ll see'", result: 'I"ll see'},
    { to_parse: '"I\\"ll see"', result: 'I"ll see'},
    { to_parse: "($meta.port || $ctx.request.origin.detail.port || 80)", result: 25},
    { to_parse: "($meta.host || $ctx.request.origin.detail.host || 'www.cnn.com')", result: 'www.cnn.com'},

    { to_parse: "length(' ') && length(' ') && length('')", result: 0},
    { to_parse: "length($meta.undef)", result: 0},
    { to_parse: "length($meta.null)", result: 0},
    { to_parse: "length($meta.number)", result: 1},
    { to_parse: "length($meta.boolean)", result: 1},
    { to_parse: "length($meta.obj_list)", result: 4},
    { to_parse: "( '\\(hi\\)' == '(hi)')", result: true},
    { to_parse: "'tHing' =~ /hin/i", result: true},
    { to_parse: "'tHing' =~ /h.*g/i", result: true},
    { to_parse: "'tHing' =~ /h.*l/i", result: false},
    { to_parse: "('tHing' =~ /h.*g/i) && (18 > 9)", result: true},
    { to_parse: "('tHing' =~ /h.*l/i) || (18 + 9)", result: 27},
    { to_parse: "'/mydata.html' =~ m/(receptor_list|user_config|logview|mydetails|mydata)/", result: true},
    { to_parse: "'/mydata.html' =~ /(receptor_list)|(user_config)|(logview)|(mydetails)|(mydata)/", result: true},
    { to_parse: "'/mydata.html' =~ regex('(receptor_list)|(user_config)|(logview)|(mydetails)|(mydata)')", result: true},
    { to_parse: "'/mydata.html' =~ regex(join(['receptor_list' 'user_config' 'logview' 'mydetails' 'mydata'] '|'))", result: true},
    { to_parse: "'application/json' =~ /application\\/json/", result: true },
    { to_parse: "'{ foo: 17 }' =~ m/{.*}/", result: true},
    { to_parse: "'foobar' =~ m/{.*}/", result: false},
    { to_parse: "'\\$meta.will'", result: "$meta.will"},
    { to_parse: "${meta.will}", result: "no"},
    { to_parse: "$199.22", result: undefined},
    { to_parse: "'99.22%'", result: "99.22%"},
    { to_parse: "typeof(99.22)", result: "number"},
    { to_parse: "typeof($ctx.request)", result: "object"},
    { to_parse: "'$b0b'", result: "$b0b"},
    { to_parse: "$b0b", result: undefined},
    { to_parse: "$$foo", result: "william"},
    { to_parse: "$['$foo']", result: "william"},
    { to_parse: "$.$foo", result: "william"},
    { to_parse: "$meta.$foo", result: "foobar"},
    { to_parse: "$meta['$foo']", result: "foobar"},
    { to_parse: 'length($meta.will)', result: 2},
    { to_parse: 'length(random_string("aAa!.####")) ', result: 9},
    // check comments
    { to_parse: '/* inline comment */', result: undefined },
    { to_parse: '"hi" /* inline comment */', result: "hi" },
    { to_parse: '$meta.will /* inline comment */', result: "no" },
    { to_parse: '$meta.boolean /* inline comment */', result: true },
    { to_parse: '$meta.boolean /* false */', result: true },
    { to_parse: '$meta.boolean /* && @(false) */', result: true },
    { to_parse: '/* false && */ $meta.boolean', result: true },
    { to_parse: '/* inline comment */ $meta.will', result: "no" },
    { to_parse: '// eol comment', result: undefined },
    { to_parse: '"hi"// eol comment', result: "hi" },
    { to_parse: '"hi" // eol comment', result: "hi" },
    { to_parse: '$meta.will // eol comment', result: "no" },
    { to_parse: "['a' 'b' 'foo']  // eol comment", result: [ 'a', 'b', 'foo']},
    { to_parse: "['a' 'b' 'foo']// eol comment", result: [ 'a', 'b', 'foo']},
    { to_parse: "['a' /* inline comment */ 'b' 'foo']", result: [ 'a', 'b', 'foo']},
    { to_parse: "( 'foo' /* inline comment #8 */)", result: "foo"},
    { to_parse: "&( 'a' 'b' 'foo' /* inline comment #9 */)", result: "abfoo"},
    { to_parse: "&( 'a' 'b' 'foo')  // eol comment", result: "abfoo"},
    // todo - add more random_string checks! including providing charmap
    { to_parse: "( 'foo' )", result: "foo"},
    { to_parse: "' foo '", result: ' foo '},
    { to_parse: '$meta.will & "bob"', result: "nobob"},
    { to_parse: '$meta.nonexistant & "bob"', result: "bob"},
    { to_parse: '&($meta.will "bob")', result: "nobob"},
    { to_parse: '&($meta.nonexistant "bob")', result: "bob"},

    { to_parse: '$meta.url', result: "http://foo.bar.com/fuzzy/about.php"},
    { to_parse: '${meta.url}', result: "http://foo.bar.com/fuzzy/about.php"},

    { to_parse: '$meta.url == "http://foo.bar.com/fuzzy/about.php"', result: true},
    { to_parse: '`$meta.url`', result: "$meta.url"},
    { to_parse: '"[foo]"', result: "[foo]"},
    { to_parse: '"request"', result: "request"},
    { to_parse: '"reques[]"', result: "reques[]"},
    { to_parse: '"bob" == `bob`', result: true},
    { to_parse: '`foo` & `bob & "182" \\` / 19  == 22`', result: 'foobob & "182" ` / 19  == 22'},
    { to_parse: "`foo` & 'bob & 182 \\' / 19  == 22'", result: "foobob & 182 ' / 19  == 22"},
    { to_parse: ' "$meta.will" & `bob`', result: "$meta.willbob"},
    { to_parse: " '$meta.will' & `bob`", result: "$meta.willbob"},
    // { to_parse: "`foo` _ '$meta.will' _ `bob`", result: "foo$meta.willbob"},
    { to_parse: "'foo' & '$meta.will' & `bob`", result: "foo$meta.willbob"},
    { to_parse: "&('foo'  '$meta.will'  `bob`)", result: "foo$meta.willbob"},
    { to_parse: " `$meta.will` & `bob`", result: "$meta.willbob"},
    { to_parse: ' "will + bob"', result: "will + bob"},
    { to_parse: "$ctx.request.origin.detail[($meta.thing)]", result: 25},
    { to_parse: "$ctx.request.origin.detail[$meta.thing]", result: 25},
    { to_parse: "$ctx['request'].origin.detail[$meta.thing]", result: 25},
    { to_parse: "$ctx['request']['origin']['detail'][$meta.thing]", result: 25},
    { to_parse: "$ctx[request].origin.detail[$meta.thing]", result: 25},
    { to_parse: "$meta.list[2]", result: "will"},
    { to_parse: "$meta.list[$meta['Step']]", result: "shallow"},
    { to_parse: "$meta.list[$meta[Step]]", result: "shallow"},
    { to_parse: "$meta.list[$meta.Step]", result: "shallow"},
    { to_parse: "$meta.list[$meta.step]", result: undefined},
    { to_parse: "$meta.list[${meta.Step}]", result: "shallow"},
    { to_parse: "${meta.list[${meta.Step}]}", result: "shallow"},
    { to_parse: "$meta.wacky.'foo+bar'", expect_exception: true},
    { to_parse: "$meta.wacky['foo+bar']", result: "one"},
    { to_parse: "$meta.wacky['foo<bar']", result: "two"},
    { to_parse: "$meta.wacky['foo-bar']", result: "three"},
    { to_parse: "$meta.wacky['foo..bar']", result: "four"},
    { to_parse: "$meta.wacky[['foo..bar']]", result: "four"},
    { to_parse: "$meta.wacky['12..18']", result: "five"},
    { to_parse: "$meta.wacky['foo=>bar']", result: "six"},
    { to_parse: "$meta.wacky['foo]bar']", result: "seven"},
    { to_parse: "$meta.wacky['foo].bar']", result: "eight"},
    { to_parse: "$meta.wacky['[foo]\.baz']", result: "nine"},
    { to_parse: "$meta.wacky[$meta.wacky_key]", result: "nine"},
    { to_parse: "url_encode($meta.long_url)", result: "http%3A%2F%2Ffoo.bar.com%3A900%2Fpath%2Fto%2Fdo%3Fa%3D1"},
    { to_parse: "url_decode('pack-%3Ewindowmemory%3D200m')", result: "pack->windowmemory=200m"},

    { to_parse: "#('25')", result: 25},
    { to_parse: "num('25')", result: 25},
    { to_parse: "#('25.0')", result: 25},
    { to_parse: "num('25.0')", result: 25},
    { to_parse: "#('25.623')", result: 25.623},
    { to_parse: "num('25.623')", result: 25.623},
    { to_parse: "#('25.623')", result: 25.623},
    { to_parse: "num('24.7a')", result: 24.7},
    { to_parse: "#('24.7a')", result: 24.7},
    { to_parse: "num($meta.numbers[0])", result: 1},
    { to_parse: "#($meta.numbers[0])", result: 1},
    { to_parse: "num('val')", result: undefined},
    { to_parse: "#('b0b')", result: undefined},
    { to_parse: "num($meta.number_thing)", result: 192381.110000001},
    { to_parse: "#($meta.number_thing)", result: 192381.110000001},
    { to_parse: "num($meta.number_thing & 1)", result: 192381.1100000011},
    { to_parse: "#($meta.number_thing & 1)", result: 192381.1100000011},
    { to_parse: "num($meta.nonexistant)", result: undefined},
    { to_parse: "#($meta.nonexistant)", result: undefined},
    { to_parse: "num($meta.numbers)", result: undefined},
    { to_parse: "#($meta.numbers)", result: undefined},
    { to_parse: "tofixed(9.238123 3)", result: 9.238},
    { to_parse: "tofixed(19.200001 2)", result: 19.2},
    { to_parse: "tofixed(9.238123 3)", result: 9.238},
    { to_parse: "tofixed(0.194 2)", result: 0.19},
    { to_parse: "tofixed(0.199 2)", result: 0.2},
    { to_parse: "tofixed(0.199 3)", result: 0.199},
    { to_parse: "tofixed(9.238123 3)", result: 9.238},
    { to_parse: "tofixed(9.1 3)", result: 9.1},
    { to_parse: "$ctx[request].origin.detail[$meta.thing]", result: 25},
    { to_parse: "$ctx[request].origin.detail[$meta.thing]", result: 25},
    { to_parse: "$ctx[request].origin.detail[$meta.thing]", result: 25},
    { to_parse: "$ctx[request].origin.detail[$meta.thing]", result: 25},

    // { to_parse: "${meta.list[${meta.Step}]}", result: "shallow"},
    // { to_parse: "${meta.list[${meta.Step}]}", result: "shallow"},

    { to_parse: "&($meta.list 'Robert')", result: ["bob", "john", "will", "shallow", "Robert"]},
    { to_parse: "join($meta.list ', ')", result: "bob, john, will, shallow"},
    { to_parse: "join(head($meta.sub_numbers 3) ':')", result: "1:2:3"},


    // appending to nonexistant equals an array with just the appended stuff there.
    { to_parse: "&($meta.nonexist [] 'bob' )", result: ['bob']},
    { to_parse: "&($meta.nonexist ['bob' 'baz' 'bat'] )", result: ['bob', 'baz', 'bat']},
    { to_parse: "&($meta.list ['bill' 'jim'])", result: ['bob', "john", "will", "shallow", 'bill', 'jim']},
    { to_parse: "&($meta.filter_me $meta.key)", result: { name: 'a name', foo: 'a foo', url: 'http://foo.bar.com/?x=1&m=500', is: 'meta.deep.things' }},
    { to_parse: "&({} $meta.filter_me $meta.key)", result: { name: 'a name', foo: 'a foo', url: 'http://foo.bar.com/?x=1&m=500', is: 'meta.deep.things' }},
    { to_parse: "&({} $meta.null $meta.key [ 'bob' ])", result: { '0': 'bob', is: 'meta.deep.things' }},

    { to_parse: "&({} $meta.key)", result: { is: 'meta.deep.things' }},
    { to_parse: "&({} $meta.list 'bob' 'frank' 'howard')", result: { '0': 'bob', '1': 'john', '2': 'will', '3': 'shallow', bob: 'bob', frank: 'frank', howard: 'howard' }},

    { to_parse: "&($meta.nonexist $meta.key)", result: { is: 'meta.deep.things' }},
    { to_parse: "&([] $meta.nonexist $meta.key)", result: [ { is: 'meta.deep.things' } ]},
    { to_parse: "['groups' &([] $meta.numbers)]", result: [ 'groups', [1, 2, 3, 4, 5] ] },
    { to_parse: "['groups' (&([] $meta.numbers))]", result: [ 'groups', [1, 2, 3, 4, 5] ] },

    //{ to_parse: "&($meta.list ['bill' 'jim'])[2]", result: ['bob', "john", "will", "shallow", 'bill', 'jim']},
    { to_parse: "$meta.asdallf", result: undefined},
    { to_parse: "empty($meta.foo)", result: true},
    { to_parse: "empty($meta.list)", result: false},
    { to_parse: "empty(\"\")", result: true},
    { to_parse: "!empty(\"\")", result: false},
    { to_parse: "$meta['content-type']", result: 'text/plain'},
    { to_parse: "$meta['content-type'] =~ /text\\/plain/", result: true},

    { to_parse: "$meta.mime", result: undefined},
    { to_parse: '$meta.nonexistant.things', result: undefined },
    { to_parse: "$meta['this.thing']", result: 173 },
    { to_parse: "$meta['foo,bar']", result: 'foobar'},

    { to_parse: '${meta}', result: container.meta},
    { to_parse: "$[split($meta.key.is '.')]", result: 22},
    { to_parse: '$[[$meta.key.is]]', result: 22},
   // { to_parse: '${$meta.key.is}', result: '22'},

    { to_parse: "uuid()", regex: "^[0-9a-z]{8,8}\-[0-9a-z]{4,4}\-[0-9a-z]{4,4}\-[0-9a-z]{4,4}\-[0-9a-z]{12,12}$"},
    //{ to_parse: 'A bunch of things', result: "A bunch of things" },
    { to_parse: '( "/index.html" =~ m/^\\/static/ )', result: false },
//    { to_parse: "empy($meta.foo)", result: true},

    { to_parse: ' "will" & `bob`', result: "willbob"},
    { to_parse: "to_base64( &($meta.will  ':'  $meta.will) )", result: 'bm86bm8=' },
    // { to_parse: "sha1($meta.encode_me)", result: "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed"},
    // { to_parse: "md5($meta.encode_me)", result: "5eb63bbbe01eeed093cb22bb8f5acdc3"},
    { to_parse: "hash('sha1' $meta.encode_me)", result: "2aae6c35c94fcfb415dbe95f408b9ce91ee846ed"},
    { to_parse: "hash('md5' $meta.encode_me)", result: "5eb63bbbe01eeed093cb22bb8f5acdc3"},
    { to_parse: "hash('foobar' $meta.encode_me)", result: undefined},
    // { to_parse: "clone($ctx.request)", result: container.ctx.request},
    { to_parse: "to_json($ctx.request)", result: '{"origin":{"detail":{"port":25}}}'},
    { to_parse: "to_json({ ['foo' undef ]['bar' 1]} 2)", result: "{\n  \"bar\": 1\n}" },
    { to_parse: "to_json({ ['foo' undef ]['bar' 1]} '   ')", result: "{\n   \"bar\": 1\n}" },
    { to_parse: "to_json($meta.json_test)", result: '{"name":"testy"}'},
    { to_parse: "to_json($meta.json_test undef true)", result: '{"name":"testy","value":null}'},
    { to_parse: "from_json('{\"origin\": { \"detail\": { \"port\": 25 }}}')", result: {"origin": { "detail": { port: 25 }}}},
    { to_parse: "substr($meta.nonexistant 0 3)", result: undefined},
    { to_parse: "substr($meta.long_path 0 3)", result: 'the'},
    { to_parse: "substr($meta.long_path 4 8)", result: 'long'},
    { to_parse: "?( ($meta.deep.things == 22) 'it is true' 'or not')", result: 'it is true'},
    { to_parse: "?( ($meta.deep.things != 22) 'it is true' 'or not')", result: 'or not'},
    { to_parse: "?( ($meta.deep.things == 22) 'it is true' fooble('wizywit'))", result: 'it is true'},
    { to_parse: "fne('' 'bob')", result: 'bob'},
    { to_parse: "substr($meta.long_path 4)", result: 'long/path/to/do/the/thing'},
    { to_parse: "substr($meta.long_path, 4)", result: 'long/path/to/do/the/thing'},
    { to_parse: "replace('foobaOr' '/o/ig' '00')", result: "f0000ba00r"},
    { to_parse: "replace('foobaOr' /o/ig '00')", result: "f0000ba00r"},
    { to_parse: "replace('foobar' '/o/' '00')", result: "f00obar"},
    { to_parse: "replace('foobar' /o/ '00')", result: "f00obar"},
    { to_parse: "replace('fOobar' '/o/g' '00')", result: "fO00bar"},
    { to_parse: "replace('fOobar' /o/g '00')", result: "fO00bar"},
    { to_parse: "match('foobar' '/c,d/')", result: []},
    { to_parse: "match('foobar' '#c,d#')", result: []},
    { to_parse: "match('foobar' regex($meta.reg))", result: ['foo']},
    { to_parse: "empty(match('foobar' '/c,d/'))", result: true},
    { to_parse: "'foobar' =~ m/c,d/", result: false},
    { to_parse: "match('FOobar' '/foo/i')", result: ['FOo'] },
    { to_parse: "match('FOobar' ['foo' 'i'])", result: ['FOo'] },
    { to_parse: "match('FOobar' regex($meta.reg))", result: [] },
    { to_parse: "match('FOobar' regex($meta.reg 'i'))", result: ['FOo'] },
    { to_parse: "match('FOobar' regex(&('Oo' '.')))", result: ['Oob'] },
    { to_parse: "match('FOobar' regex(&('^Oo' '.')))", result: [] },
    { to_parse: "match('FOobar' regex(&('^F.' 'o')))", result: ['FOo'] },
    // making a regex from a non-string is unmatchable
    { to_parse: "match('FOobar' regex($meta 'i'))", result: [] },
    { to_parse: "match('FOobar' ['foo' 'u'])", result: [] },
    { to_parse: "'FOobar' =~ m/foo/i", result: true},
    { to_parse: "'FOobar' =~ regex($meta.reg 'i')", result: true},
    { to_parse: "'FOobar' =~ regex($meta.reg)", result: false},
    { to_parse: "!empty(match('FOobar' '/foo/i'))", result: true},
    { to_parse: "!empty(match('LOobar' '/foo/i'))", result: false},
    { to_parse: "match('foobar' '/([f,b])(.)/')", result: [ 'fo', 'f', 'o' ]},
    { to_parse: "match('foobarbaz' '/(f(..)bar)../')", result: [ 'foobarba', 'foobar','oo' ]},
    { to_parse: "replace('foobar' '/([f,b])(.)/g' '$2$1')", result: "ofoabr"},
    { to_parse: "replace('foobar' /([f,b])(.)/g '$2$1')", result: "ofoabr"},
    { to_parse: "! $meta.not_true", result: true },
    { to_parse: "$meta.not_true == false", result: true },
    { to_parse: "$meta.not_true == 'false'", result: false },
    { to_parse: "!empty($meta.phone) && $meta.not_true == false", result: true },
    { to_parse: "!empty($meta.phone) && $meta.not_true", result: false },
    { to_parse: "!empty($meta.zeebraeoadfs) && $meta.not_true != false ", result: false },
    { to_parse: "!empty($meta.zeebraeoadfs) && $meta.not_true == false", result: false },
    { to_parse: "$meta.numbers[$meta.deep.things - 24]", result: '4' },
    { to_parse: "$.", result: container },
    { to_parse: "$meta['will']", result: 'no'},
    { to_parse: "capitalize('bubbaBoBobBrain')", result: 'BubbaBoBobBrain'},

    // Arrays & objects constructors
    { to_parse: "['foo' 'bar']", result: ['foo', 'bar'] },
    { to_parse: "('foo':'bar')", result: ['foo', 'bar'] },
    { to_parse: "('foo' 'bar')", result: ['foo', 'bar'] },
    { to_parse: "{['foo' 'bar']}", result: {'foo': 'bar'} },
    { to_parse: "['foo', 'bar']", result: ['foo', 'bar'] },
    { to_parse: "[ 12 25 ]", result: [12, 25] },
    { to_parse: "[ 12, -25 ]", result: [12, -25] },
    { to_parse: "[ 12 -25 ]", result: [-13] },
    { to_parse: "0..5", result: [0,1,2,3,4,5]},
    { to_parse: "5..0", result: [5,4,3,2,1,0]},
    { to_parse: "$meta.bob..($meta.Step+3)", result: [10, 9, 8, 7, 6] },
    { to_parse: "$meta['@unusual:']", result: 'is ok'},
    { to_parse: "{ $meta.pair }", result: { 'the_key': "the_value"}},
    { to_parse: "{ $meta.pairs }", result: { 'key2': "value2", 'key3': "value3"}},
    { to_parse: "pairs({ $meta.pairs })", result: [['key2', 'value2'], ['key3', 'value3']] },
    { to_parse: "{['foo' 'bar'] ['baz' 'bat']}", result: {'foo': 'bar', 'baz': 'bat'} },
    { to_parse: "{('foo': 'bar') ('baz': 'bat')}", result: {'foo': 'bar', 'baz': 'bat'} },
    { to_parse: "{['foo' 'bar'] [$meta.will 'way']}", result: {'foo': 'bar', 'no': 'way'} },
    { to_parse: "{('foo': 'bar') ($meta.will: 'way')}", result: {'foo': 'bar', 'no': 'way'} },
    { to_parse: "{('foo': {($meta.will: 'way')})}", result: {'foo': {'no': 'way'}} },
    { to_parse: "('foo' 'bar' 'baz' 'bat')", result: ['foo', 'bar', 'baz', 'bat'] },
    { to_parse: "reverse($meta.numbers)", result: [5,4,3,2,1]},
    { to_parse: "reverse('a cat without a grin')", result: 'nirg a tuohtiw tac a'},
    { to_parse: "flatten($meta.sub_numbers)", result: [1,2,3,4,5]},
    { to_parse: "flatten($meta.deep_numbers)", result: [ 1, 2, 3, 4, 5, 6, 7, 9, 12, 22, 33, 45, 63, 88, 12 ]},
    { to_parse: "flatten($meta.deep_numbers 2)", result: [1,2,3,4,5,6,7,9,12,22,[33,[45,63,[88,12]]]]},
    { to_parse: "flatten($ctx)", result: { "foo": 72, "request.origin.detail.port": 25 }},
    { to_parse: "unflatten(flatten($meta '%') '%')", result: container.meta},

    { to_parse: "transform($meta.obj_list.abc { ['out' '(: $.name :)']} )", result: 'abc'},
    { to_parse: "transform($meta.obj_list.abc '(: $.name :)' )", result: 'abc'},
    { to_parse: "^($meta.obj_list.abc '(: $.name :)' )", result: 'abc'},
    { to_parse: "^($meta.obj_list.abc ( &('(:' '$.name'  ':)') ))", result: 'abc'},

    { to_parse: "{ ('key':'value') ('key2':'value2') ('key3':'value3')}", result: { "key": "value", "key2": "value2", "key3": "value3"}},
    { to_parse: "{ ('key' 'value') ('key2' 'value2') ('key3' 'value3')}", result: { "key": "value", "key2": "value2", "key3": "value3"}},
    { to_parse: "&(['foo' 'bar'] ['baz' 'bat'])", result: ['foo', 'bar', 'baz', 'bat'] },
    { to_parse: "['foo' 'bar']", result: ['foo', 'bar'] },
    { to_parse: "sprintf('%05.2f %08d %12s' 2.33 7 'bob')", result: '02.33 00000007          bob'},
    { to_parse: "sprintf('%05.2f %08d %12s' [2.33 7 'bob'])", result: '02.33 00000007          bob'},
    { to_parse: "sprintf('key: %12s value: %17s' $meta.pair)", result: 'key:      the_key value:         the_value'},
    { to_parse: 'sprintf("%08X" 0xABCD)', result:	"0000ABCD"},
    { to_parse: 'sprintf("%lu" 43981)', result :'43981'},
    { to_parse: 'sprintf("%10s" "string")', result:  '    string'},
    { to_parse: 'sprintf("%*s" 10 "string")', result:'    string'},
    { to_parse: 'sprintf("%-10s" "string")', result: 'string    '},
    { to_parse: 'sprintf("%-10.10s" "truncateiftoolong")', result :'truncateif'},
    { to_parse: "(['foo' 'bar'])[0]", result: 'foo' },
    { to_parse: "({ ('key' 'value') ('key2' 'value2') ('key3' 'value3')})['key2']", result: "value2"},
    { to_parse: "({ ('key' 'value') ('key2' 'value2') ('key3' 'value3')}).key2", result: "value2"},
    { to_parse: "({ ('key' 'value') ('key2' 'value2') ('key3' 'value3')})", result:  { "key": "value", "key2": "value2", "key3": "value3"}},
    { to_parse: "(flatten($meta.deep_numbers))[10]", result: 33},
    { to_parse: "(flatten($meta.deep_numbers)).10", result: 33},
    { to_parse: "(flatten($meta.deep_numbers))[$meta.sortable_numeric[0].val]", result: 33},
    { to_parse: "(flatten($meta.deep_numbers 2)).10.1", result: [45,63,[88,12]]},
    { to_parse: "(flatten($meta.deep_numbers 2))[10][1][0]", result: 45},
    { to_parse: "&( [] fne($meta.obj_list []) transform($meta.deep '(: $. :)') )", result: [ { fff: { name: 'fff' }, abc: { name: 'abc' }, zz: { name: 'zz' }, ccf: { name: 'ccf', bar: null } }, { things: 22 } ]},
    { to_parse: "&( [] fne($meta.obj_list []) @('deep' transform($meta.deep '(: $. :)')) )", result: [ { fff: { name: 'fff' }, abc: { name: 'abc' }, zz: { name: 'zz' }, ccf: { name: 'ccf', bar: null } }, { things: 22 } ]},
    { to_parse: "&( [] fne($meta.obj_list []) @(transform($meta.deep '(: $. :)')) )", result: [ { fff: { name: 'fff' }, abc: { name: 'abc' }, zz: { name: 'zz' }, ccf: { name: 'ccf', bar: null } }, { things: 22 } ]},
    { to_parse: "extract($meta.letters 8 5 12 12 15 )", result: ['h','e','l','l','o'] },
    { to_parse: "extract($meta.letters, 8, 5, 12, 12, 15 )", result: ['h','e','l','l','o'] },
    { to_parse: "extract($meta.letters 15 13 7 24..26 )", result: ['o','m','g','x','y','z']},
    { to_parse: "extract($meta.letters 4..5 9..13 19..23)", result: ['d','e','i','j','k','l','m','s','t','u','v','w' ]},
    { to_parse: "extract($meta.letters 4 [ 5 9 8 2 ])", result: ['d','e','i','h','b'] },
    { to_parse: "extract($meta.obj_list 'abc' 'zz')", result: { abc: { name: 'abc' }, zz: { name: 'zz' }} },
    { to_parse: "extract($meta.obj_list 'abc' ['fff' 'zz'])", result: { abc: { name: 'abc'}, fff: { name: 'fff' }, zz: { name: 'zz' }} },
    { to_parse: "extract($meta.obj_list ['abc' 'zz'] 'fff')", result: { abc: { name: 'abc'}, fff: { name: 'fff' }, zz: { name: 'zz' }} },
    { to_parse: "extract($meta.obj_list ['abc' 'zz'] 'fff')", result: { abc: { name: 'abc'}, fff: { name: 'fff' }, zz: { name: 'zz' }} },
    { to_parse: "'1.22' =~ /\\d\\.\\d/g", result: true },
    { to_parse: "'1.22' =~ /\\\\d\\\\.\\\\d/g", result: false },
    { to_parse: "/foo/ == /foo/", result: true },
    { to_parse: "/foo/g", result: new RegExp('foo', 'g') },
    // these are meant to fail.
    // { to_parse: "{ ('key' $ 'value' ('key2' 'value2') ('key3' 'value3')}", result: { "key": "value", "key2": "value2", "key3": "value3"}},
    // { to_parse: "ucfirst('bubbaBoBobBrain'\n", result: 'BubbaBoBobBrain'},


    // { to_parse: "$.", result: container },


    // unquoted strings with lots of operator characters cause trouble.  Not sure we can fix this.
    //{ to_parse: 'http://foo.bar.com/fuzzy/about.php', result: "http://foo.bar.com/fuzzy/about.php"},
];


    describe('DTL Expression Parsing', function(done) {

    describe('Basic', function() {
        tests.forEach(function(test, i) {

            it("Parsing '" + test.to_parse +"'", function() {
                var result;
                var res;
//                result = DTLExpressions.parse(test.to_parse, container);
                try {
                    result = DTL.apply(container, { out: "(: " + test.to_parse + " :)" });

                    if (test.regex ) {
                        var r = new RegExp(test.regex);
                        assert.ok(r.test(result), 'RegExp passes');
                    } else {
                        if (typeof test.result == 'object') {
                            assert.deepEqual(result, test.result, "Produces expected results: " + util.inspect(result, { depth: null}) + " = " + util.inspect(test.result, {depth: null}) );
                        } else {
                            assert.strictEqual(result, test.result, "Produces expected results: " + result + " = " + test.result );
                        }
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
