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
var PEG = require('peggy');
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


var tests = [
    { to_parse: '99', result: 99},
    { to_parse: '98.6', result: 98.6},



    // unquoted strings with lots of operator characters cause trouble.  Not sure we can fix this.
    //{ to_parse: 'http://foo.bar.com/fuzzy/about.php', result: "http://foo.bar.com/fuzzy/about.php"},
];


    describe('DTL Transforms', function() {

    describe('Basic', function() {

        it("Identity Transform", function() {
            var result;

            result = DTL.apply(input_user, { out: "(: $. :)" });
            assert.deepEqual(result, input_user, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });
        it("Relocate as is", function() {
            var result;

            result = DTL.apply(input_user, { out: { original: "(: $. :)" }});
            assert.deepEqual(result, { original: input_user} , "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });

        it("Grab Sub Element", function() {
            var result;

            result = DTL.apply(input_user, { out: { user_profile: "(: $profile :)" }});
            assert.deepEqual(result, { "user_profile": input_user.profile} , "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });

        it("New Structure", function() {
            var result;
            var transform = {
                out: {
                    full_name: "(: $profile.real_name :)",
                    username: "(: $name :)",
                    status: "(: ?($deleted == false 'active' 'deleted') :)",
                    description: "(: $profile.title :)",
                    source: "SlackUsers",
                    import_id: 123123123
                }
            };

            var expected_result = { full_name: 'Jay Kuri', username: 'jaykuri', status: 'active',
                                    description: 'Hookify.io: we build stuff so you can focus on what you want to build.',
                                    source: 'SlackUsers', import_id: 123123123 };

            result = DTL.apply(input_user, transform);

            // console.log("Transformed:");
            // console.log(util.inspect(result));
            assert.deepEqual(result, expected_result, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });

        it("Null check doesn't explode", function() {
            var result;
            var transform = {
                out: {
                    foo: null,
                    source: "SlackUsers",
                    import_id: 123123123
                }
            };

            var expected_result = { foo: undefined, source: 'SlackUsers', import_id: 123123123 };

            result = DTL.apply(input_user, transform);

            // console.log("Transformed:");
            // console.log(util.inspect(result));
            assert.deepEqual(result, expected_result, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });

        it("Secondary Transform", function() {
            var result;
            var transform = {
                out: {
                    full_name: "(: $profile.real_name :)",
                    username: "(: $name :)",
                    status: "(: ?($deleted == false 'active' 'deleted') :)",
                    description: "(: $profile.title :)",
                    source: "SlackUsers",
                    import_id: 123123123,
                    avatars: "(: transform( $.profile 'avatar_transform') :)"
                },
                avatar_transform: {
                    small: "(: $.image_24 :)",
                    large: "(: $.image_192 :)",
                },
            };

            var expected_result = { full_name: 'Jay Kuri', username: 'jaykuri', status: 'active',
                                    description: 'Hookify.io: we build stuff so you can focus on what you want to build.',
                                    source: 'SlackUsers', import_id: 123123123, avatars:
                                     { small: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-04-10/4416156249_908b9f7fd1e07a1e4cd1_24.jpg',
                                       large: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-04-10/4416156249_908b9f7fd1e07a1e4cd1_192.jpg' }  };

            result = DTL.apply(input_user, transform);

            // console.log("Transformed:");
            // console.log(util.inspect(result));
            assert.deepEqual(result, expected_result, "Produces expected results: " + util.inspect(result) + " = " + util.inspect(input_user) );
        });

        it("Sub-Transform cycles don't go infinite", function() {
            var result;
            var transform = {
                out: {
                    full_name: "(: $profile.real_name :)",
                    avatars: "(: transform( $.profile 'avatar_transform') :)"
                },
                avatar_transform: {
                    small: "(: $.image_24 :)",
                    large: "(: $.image_192 :)",
                    other: "(: transform( $. 'other') :)"
                },
                other: {
                    thing: "(: transform( $. 'avatar_transform') :)"
                }
            };

            var expected_result = { full_name: 'Jay Kuri', username: 'jaykuri', status: 'active',
                                    description: 'Hookify.io: we build stuff so you can focus on what you want to build.',
                                    source: 'SlackUsers', import_id: 123123123, avatars:
                                     { small: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-04-10/4416156249_908b9f7fd1e07a1e4cd1_24.jpg',
                                       large: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatars/2015-04-10/4416156249_908b9f7fd1e07a1e4cd1_192.jpg' }  };

            var failed = false;
            try {
                result = DTL.apply(input_user, transform);
            } catch (e) {
                if (e.toString() == 'Error: Maximum nested transform depth exceeded') {
                    failed = true;
                }
                //console.log(e);
            }
            // console.log("Transformed:");
            // console.log(util.inspect(result));
            assert.ok(failed, "Nested transform loops fail properly");
        });

    });


});
