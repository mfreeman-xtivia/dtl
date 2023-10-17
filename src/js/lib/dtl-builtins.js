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
const uuid = require('uuid');
const sprint = require('sprint').sprint;
const strftime = require('strftime');
const BigNumber = require('bignumber.js');
const deepEqual = require('fast-deep-equal');

var random_charmap = {
    'a': 'abcdefghijklmnopqrstuvwxyz',
    'A': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'b': 'bcdfghjklmnpqrstvwxyz',
    'B': 'BCDFGHJKLMNPQRSTVWXYZ',
    'e': 'aeiouy',
    'E': 'AEIOUY',
    'F': '0123456789abcdef',
    '#': '0123456789',
    '!': '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\',
    '.': 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\'
};

// given a thing, try to create a regexp from it. If given a string
// that isn't in the form '/.../' - return the string as is, if
// we are given something that can't be made into a regexp,
// return a regexp that can not match anything.
function obtain_regex_from(thing) {
    var re;
    var typeof_thing = typeof thing;
    if (typeof_thing == 'object') {
        if (thing instanceof RegExp) {
            re = thing;
        } else if (Array.isArray(thing)) {
            re = new RegExp(thing[0], thing[1]);
        } else {
            re = new RegExp(thing.toString());
        }
    } else if (typeof_thing == 'string') {
        var check = thing.match(/^\/(.*)\/([gimy]+)*$/);
        if (check !== null) {
            re = new RegExp(check[1], check[2]);
        } else {
            var check = thing.match(/^\#(.*)\#([gimy]+)*$/);
            if (check !== null) {
                re = new RegExp(check[1], check[2]);
            } else {
                re = thing;
            }
        }
    } else {
        // we can't make a regex out of whatever it is they gave us...
        // so we need a regex that can't ever match anything.
        // this may look odd, but it _is_ a regex that can never match.
        // Look ahead, the next letter should be a... but also b.
        re = new RegExp('^(?=a)b');
    }
    return re;
}

function safe_object(obj) {
    // This function returns the original object - UNLESS the object is null
    // then we return an empty object in it's stead, so we don't have to keep
    // checking for null constantly.
    if (typeof obj != 'undefined' && obj === null) {
        return {};
    } else {
        return obj;
    }
}

// returns a deep copy of an object disconnected from the original.
// may not be the most efficient way. worth investigating further.
function isolate_object(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function make_iteratee_arguments(collection, index, value) {
    var result = {};
    result.index = index;
    result.all = collection;
    if (typeof value !== 'undefined') {
        result.item = value;
    } else {
        result.item = collection[index];
    }
    return result;
}

function transform_helper(options, input_data, transforms, transform_name) {
    var results;
    let transform_options = {};
    Object.assign(transform_options, options);

    // at this level, we always return bignumbers. Let the top-level apply clean
    // them up if necessary.
    
    transform_options.return_bignumbers = true;
    if (typeof transforms == 'undefined' && typeof transform_name == 'undefined' &&
        typeof input_data == 'string') {
        // we have only a single argument and it's a string, we will treat that
        // as though we are passing the current data into the named transform.
        transforms = input_data;
        input_data = transform_options.input_data;
    }
    

    if (typeof transform_name == 'undefined' && typeof transforms == 'string') {
        transform_name = transforms;
        transforms = transform_options.transforms;
    }
    results = transform_options.transformer(input_data, transforms, transform_name, transform_options);
    return results;
}

// if eat_undefined is set, then we don't push undefined onto the list
function map(set, func, eat_undefined) {
    var list; //, index, item;
    var result = [],
        res, i;
    if (typeof set != 'object') {
        if (typeof set == 'undefined') {
            set = [];
        } else {
            set = [set];
        }
    }
    if (Array.isArray(set)) {
        for (i = 0; i < set.length; i++) {
            res = func(set[i], i, set);
            if (!eat_undefined || res !== undefined) {
                result.push(res);
            }
        }
    } else {
        list = Object.keys(set).sort();
        for (i = 0; i < list.length; i++) {
            res = func(set[list[i]], list[i], set);
            if (!eat_undefined || res !== undefined) {
                result.push(res);
            }
        }
    }
    return result;
}

function reduce(set, func, memo) {
    var list, previous_res = memo;
    var i;
    if (typeof set != 'object') {
        if (typeof set == 'undefined') {
            set = [];
        } else {
            set = [set];
        }
    }
    if (Array.isArray(set)) {
        previous_res = set.reduce(func, memo);
    } else {
        list = Object.keys(set);
        previous_res = list.reduce(function(res, item, index, list) {
            return func(res, set[item], item, set);
        }, memo);
    }
    return previous_res;
}

function obj_keys(obj) {
    var all_keys, i;
    var keys = [];
    if (typeof obj == 'object') {
        all_keys = Object.keys(obj);
        if (typeof obj.prototype == 'undefined') {
            keys = all_keys;
        } else {
            keys = [];
            for (i = 0; i < all_keys.length; i++) {
                if (Object.prototype.hasOwnProperty.call(obj, all_keys[i])) {
                    keys.push(all_keys[i]);
                }
            }
        }
    } else {
        keys = [];
    }
    return keys;

}

function concat() {
    var args = Array.prototype.slice.call(arguments);
    var type = 'undefined';
    // find the type of the first non-empty item
    // so we can do the concat correctly ( otherwise 'undefined' at the start confuses things)
    // also allows casting by providing [] or {} at the start.
    var item, i = 0;
    while (type == 'undefined' && args.length > 0) {
        item = args[i];
        type = typeof item;
        if (type == 'object' && Array.isArray(item)) {
            type = 'array';
        }
        if (type == 'undefined') {
            args.shift();
        } else {
            i++;
        }
    }
    var out;
    if (type == 'array') {
        out = [];
        args.forEach(function(item) {
            if (typeof item != 'undefined' && item !== null) {
                if (Array.isArray(item)) {
                    out = out.concat(item);
                } else {
                    out = out.concat([item]);
                }
            }
        });
    } else if (type == 'object') {
        out = {};
        args.forEach(function(item, index) {
            if (typeof item != 'undefined' && item !== null) {
                if (typeof item == 'string') {
                    out[item] = item;
                } else {
                    for (var key in item) {
                        if (Object.prototype.hasOwnProperty.call(item, key)) {
                            if (typeof item[key] == 'object') {
                                out[key] = isolate_object(item[key]);
                            } else {
                                out[key] = item[key];
                            }
                        }
                    }
                }
            }
        });
    } else {
        out = "";
        args.forEach(function(item) {
            if (typeof item != 'undefined' && item !== null) {
                if (typeof item == 'string') {
                    out += item;
                } else if (typeof item.toString == 'function') {
                    out += item.toString();
                }
            }
        });
    }
    return out;
}

function to_base64(thing) {
    if (typeof Buffer != 'undefined') {
        if (Buffer.isBuffer(thing)) {
            return thing.toString('base64');
        } else {
            return Buffer.from(thing).toString('base64');
        }
    } else {
        // fallback to browser compat
        return btoa(thing);
    }

}

function from_base64(str) {
    if (typeof Buffer != 'undefined') {
        return Buffer.from(str, 'base64').toString('utf8');
    } else {
        // fallback to browser compat
        return atob(str);
    }
}

function to_number(str) {
    let new_str = str.replace(/^([\.0-9]+)(.)*/, "$1");
    var res = BigNumber(new_str);
    if (isNaN(res)) {
        return undefined;
    } else {
        return res;
    }
}

function deep_bignumber_convert(bignumber_as_string, obj) {
    let new_obj;
    if (BigNumber.isBigNumber(obj)) {
        if (bignumber_as_string) {
            return obj.toString();
        } else {
            return obj.toNumber();
        }
    } else if (typeof obj == 'object') {
        if (obj === null || obj instanceof RegExp) {
            // if the object is null or it's a regex, we return it untouched.
            return obj;
        } else if (Array.isArray(obj)) {
            new_obj = [];
            for(let i = 0; i < obj.length; i++) {
                if (typeof obj[i] == 'object') {
                    new_obj[i] = deep_bignumber_convert(bignumber_as_string, obj[i]);
                } else {
                    new_obj[i] = obj[i];
                }
            }
        } else {
            new_obj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] == 'object') {
                        new_obj[key] = deep_bignumber_convert(bignumber_as_string, obj[key]);
                    } else {
                        new_obj[key] = obj[key];
                    }
                }
            }
        }
        return new_obj;
    } else {
        return obj;
    }
}


function json_preserve_undefined(k, v) { 
    if ( v === undefined ) {
        return null;
    } else {
        return v;
    }
}


// ALL FUNCTIONS SHOULD TAKE ARGS IN THE FOLLOWING ORDER:
// THING TO OPERATE ON, PARAMETERS.

var helper_list = {
    'from_base64': {
        "meta": {
            "syntax": 'from_base64( $base64string )',
            'returns': 'The result of base64 decoding the provided `$base64string`',
            "description": [
                'The `from_base64()` helper decodes the given `$base64string` and returns the',
                'decoded string.'
            ],
        },
        'string': function(str) {
            return from_base64(str);
        },
    },
    'to_base64': {
        "meta": {
            "syntax": 'to_base64( $string )',
            'returns': 'The result of base64 encoding the provided `$string`',
            "description": [
                'The `to_base64()` helper encodes the given `$string` and returns the',
                'encoded string.'
            ],
        },
        'string': function(thing) {
            return to_base64(thing);
        },
    },
    // ******************************************************************
    // * below here are valid DTL helpers. Above are not yet determined *
    // ******************************************************************
    '?': {
        "meta": {
            "syntax": '?( condition trueexpression falseexpression )',
            'returns': 'Trueexpression if condition is true, falseexpression if condition is not true',
            "description": [
                'The `?()` helper is a simple conditional operator. Given a condition, the helper',
                'will evaluate the condition and if the result is truthy it will evaluate and ',
                'return the `trueexpression`. If the condition result is falsy, it will evauate and ',
                'return the `falseexpression`. ',
                'The `?()` is one of the primary decision mechanisms in DTL.  It is important to ',
                'understand that the `trueexpression` and `falseexpression` are not interpreted until',
                'the condition has been evaluated. This means the `?()` can be used to execute',
                'significantly complex logic only when needed. It can also be used to control which',
                'of multiple transforms might be used for a given part of input data.'
            ],
        },
        'unprocessed_args': function() {
            var args = Array.prototype.slice.call(arguments);
            var options = args.shift();
            var expr = options.interpret_operation(options, args.shift());
            if (expr) {
                return options.interpret_operation(options, args[0]);
            } else {
                if (typeof args[1] !== 'undefined') {
                    // if (args[1] == ":" && typeof args[2] !== 'undefined') {
                    //     return args[2];
                    // } else {
                    //     return args[1];
                    // }
                    return options.interpret_operation(options, args[1]);
                } else {
                    return undefined;
                }
            }
        }
    },
    'num': {
        "meta": {
            "syntax": 'num($string)',
            'returns': 'The passed string converted to a number, if possible',
            "description": [
                'The num() helper, or its alias #() takes a string as input and converts ',
                'it to a real number. If the data passed can not be parsed as a valid number, ',
                'num() will return undefined. If you must have a numeric value, the fne() helper ',
                'can be used in conjunction with num() in order to ensure a valid default value. ',
                'For example: fne(num($data.val) 0) will provide a $data.val as a number, or if it',
                'is not present or cannot be converted, will return 0.'
            ],
        },
        "aliases": ['#'],
        "handles_bignumbers": true,
        "string": to_number,
        "undefined": function() {
            return undefined;
        },
        "bignumber": function(bignumber) {
            return bignumber;
        },
        "number": function(num) {
            return BigNumber(num);
        },
        "*": function(thing) {
            if (typeof thing.toNumber == 'function') {
                return BigNumber(thing.toNumber());
            } else {
                return undefined;
            }
        }
    },
    "@": {
        'meta': {
            'syntax': '@( $data_item )',
            'returns': 'Passed value',
            'description': [
                'Debug, causes the value of the item to be output to the debug console. ',
                'Has no effect on the value and simply returns what is passed unchanged. ',
                'This is useful to see the values of something while it is being processed.'
            ]
        },
        "*": function(options, label, thing) {
            var debug_msg = options.debug; // || console.log.bind(console);
            if (typeof thing == 'undefined') {
                thing = label;
                debug_msg("debug", thing);
            } else {
                debug_msg(label, thing);
            }
            return thing;
        },
        "wants_options": true
    },
    "&": {
        'meta': {
            'syntax': '&( $data_item1 $data_item2 [ $data_item3 ... ] )',
            'returns': 'The passed items concatenated together',
            'description': [
                'Returns the passed items concatenated together. The type of item returned ',
                'is determined by the first argument. If the first argument is a list, the ',
                'remaining items will be added to the end of that list. If the first argument ',
                'is a string, the following items will be concatenated to the end of the string, ',
                'first being converted to strings if they are not already. ',
                'If the first item is an object, and the additional items are also objects, ',
                'the returned item will represent the objects merged at the top level.'
            ]
        },
        "*": concat,
    },
    "empty": {
        'meta': {
            'syntax': 'empty( $data_item )',
            'returns': 'boolean indicating whether the passed item is empty',
            'description': [
                'Returns true when the passed item is empty. ',
                'Empty means undefined, of length 0 (in the case of an array or string) ',
                'or in the case of an object, containing no keys'
            ]
        },
        'array,string': function(thing) {
            return (thing.length === 0);
        },
        'object': function(obj) {
            if (obj === null) {
                return true;
            }
            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
            }
            return true;
        },
        '*': function(thing) {
            if (thing === undefined) {
                return true;
            } else {
                return false;
            }
        }
    },
    "exists": {
        'meta': {
            'syntax': 'exists( $data_item )',
            'returns': 'boolean indicating whether the passed item is defined at all.',
            'description': [
                'Returns true when the passed item is not undefined.',
            ]
        },
        "undefined": function(thing) {
            return false;
        },
        "*": function() {
            return true;
        }
    },
    "group": {
        'meta': {
            'syntax': 'group( $items $bucket_name_transform [ $value_transform ] )',
            'returns': 'An object containing groups of values, grouped by the results of $bucket_name_transform',
            'description': [
                'Returns an object containing the values provided grouped into named buckets. ',
                'The bucket an item goes into is based on the $bucket_name_transform provided. ',
                'The $bucket_name_transform receives each item in turn and should return the ',
                'name of the bucket that item belongs to. The $value_transform argument is ',
                'optional and when provided will allow you to put a calculated value into the ',
                'resulting group, rather than the input value.  The $value_transform receives ',
                'the item and should return the value to be stored.'
            ]
        },
        "array,object": function(options, input, key_transform, value_transform) {
            var result = {};
            map(input, function group_function(value, key, list) {
                var new_input_data = make_iteratee_arguments(list, key, value);
                var bucket_name = transform_helper(options, new_input_data, key_transform);
                if (typeof bucket_name == 'undefined') {
                    return;
                }
                var data = value;
                if (typeof value_transform != 'undefined') {
                    data = transform_helper(options, new_input_data, value_transform);
                }
                if (typeof result[bucket_name] == 'undefined') {
                    result[bucket_name] = [];
                }
                result[bucket_name].push(data);
            });
            return result;
        },
        "coerce": ["array"],
        "wants_options": true
    },
    "explode": {
        'meta': {
            'syntax': 'explode( $string )',
            'returns': 'An array of single characters representing the contents of the string provided',
            'description': [
                'Returns the string as an array of single characters .',
            ]
        },
        "string": function(string) {
            var len = string.length;
            var arr = new Array(len);
            for (var i = 0; i < len; i++) {
                arr[i] = string.charAt(i);
            }
            return arr;
        }
    },
    "first": {
        'meta': {
            'syntax': 'first( $array [ $transform ] )',
            'returns': 'The first item in the array that matches the condition',
            'description': [
                'Returns the first item in the provided array that $transform returns true for. ',
                'The default for $transform is "(: !empty($item) :)" - so by default first() ',
                'returns the first non-empty item in the provided array.'
            ]
        },
        "array": function(options, input, transform, extra) {
            var results = [];
            var i_should_include_it;
            if (transform == undefined) {
                transform = options.transform_quoter('!empty($item)');
            }
            for (var i = 0; i < input.length; i++) {
                var new_input_data = make_iteratee_arguments(input, i, input[i]);
                if (typeof extra !== 'undefined') {
                    new_input_data.extra = extra;
                }
                i_should_include_it = false;
                i_should_include_it = transform_helper(options, new_input_data, transform);
                if (i_should_include_it) {
                    return input[i];
                }
            }
            // if we get here, nothing matched
            return undefined;
        },
        "coerce": ["array"],
        "wants_options": true
    },
    "grep": {
        'meta': {
            'syntax': 'grep( $array_or_object $search_transform [ $value_transform ] [ $extra ])',
            'returns': 'An array containing all the items that match $search_transform',
            'description': [
                'Returns an array or object containing all the items in $array_or_object ',
                'that match the $search_transform. The $search_transform receives each $item ',
                'in turn and should return true or false on whether the item should be included ',
                'in the result. By default the item is placed into the resulting array.  If, ',
                'however, a $value_transform is provided, the $item is provided to the $value_transform ',
                'and the value returned from $value_transform is placed into the results instead. ',
                'The $extra data, if provided, is also available in the transform as $extra.'
            ]
        },
        "array": function(options, input, transform, value_transform, extra) {
            var results = [];
            var i_should_include_it;
            if (transform == undefined) {
                transform = options.transform_quoter('!empty($item)');
            }
            for (var i = 0; i < input.length; i++) {
                var new_input_data = make_iteratee_arguments(input, i, input[i]);
                new_input_data.extra = extra;
                i_should_include_it = false;
                i_should_include_it = transform_helper(options, new_input_data, transform);
                if (i_should_include_it) {
                    if (value_transform == undefined) {
                        results.push(input[i]);
                    } else {
                        results.push(transform_helper(options, new_input_data, value_transform));
                    }
                }
            }
            return results;
        },
        "object": function(options, input, transform, value_transform, extra) {
            var results = {};
            if (transform == undefined) {
                transform = options.transform_quoter('!empty($item)');
            }
            map(input, function(value, key, list) {
                var new_input_data = make_iteratee_arguments(list, key, value);
                new_input_data.extra = extra;
                var i_should_include_it = transform_helper(options, new_input_data, transform);
                if (i_should_include_it) {
                    results[key] = value;
                    if (value_transform == undefined) {
                        results[key] = value;
                    } else {
                        results[key] = (transform_helper(options, new_input_data, value_transform));
                    }
                }
            });
            return results;
        },
        "coerce": [ "array" ],
        "wants_options": true
    },
    // need to make derive more robust
    "derive": {
        'meta': {
            'syntax': 'derive( $data $action_map )',
            'returns': 'Resulting data from the $action_map provided, or undefined if no matching rule was found.',
            'description': [
                'Derive processes the provided data through the action_map given. ',
                'An action map is an array of transformation pairs, where the first item in the pair ',
                'is the test to perform on the data, and the second item is a transform which returns ',
                'the data if the test is successful. During processing of the data, the first test which ',
                'produces a true result will be used, and no further checks will be done. See the ',
                'wiki (or the unit tests) for more details and examples.'
            ]
        },
        "*": function(options, input, action_map_provided) {
            var action_map;
            var results = [];
            if (typeof action_map_provided == 'string') {
                action_map = options.transforms[action_map_provided];
            } else if (Array.isArray(action_map_provided)) {
                action_map = action_map_provided;
            }
            var action_map_length = action_map.length;

            if (action_map != undefined) {
                var result;
                var match;
                var new_input_data = input;
                for (var i = 0; i < action_map_length; i++) {
                    match = transform_helper(options, new_input_data, action_map[i][0]);
                    if (!!match) {
                        // action_map[i][1] is the action:
                        result = transform_helper(options, new_input_data, action_map[i][1]);
                        break;
                    }
                }
                return(result);
            }
        },
        "wants_options": true
    },
    'chain': {
        'meta': {
            'syntax': 'chain( $data $transform_chain)',
            'returns': 'An array of items transformed using the transform chain',
            'description': [
                'Chain processes the provided data through the transform_chain provided. ',
                'A transform chain is simply an array of transforms. The data is provided to the first ',
                'transform, and the output of that transform becomes the input to the next, and so on. ',
                'This allows you to describe complex data transformations in a concise way. Even when ',
                'the transformation requires multiple steps to complete.'
            ]
        },
        '*': function(options, input, action_list_provided) {
            var action_list;
            var results = [];
            if (typeof action_list_provided == 'string') {
                action_list = options.transforms[action_list_provided];
            } else if (Array.isArray(action_list_provided)) {
                action_list = action_list_provided;
            }
            var action_list_length = action_list.length;

            var data = input;
            if (action_list != undefined) {
                for (var i = 0; i < action_list_length; i++) {
                    // action_map[i][0] is the test item for this pair
                    data = transform_helper(options, data, action_list[i]);
                }
            }
            return data;

        },
        "wants_options": true
    },

    'fne': {
        'meta': {
            'syntax': 'fne( $item1 $item2 $item3 ...)',
            'returns': 'The first non-empty item in the provided arguments',
            'description': [
                'The fne (First Non Empty) helper returns the first non-empty item in the provided arguments. ',
                'This is a useful way to obtain a piece of data from one of several places.  It is ',
                'especially useful when you would like to use a piece of provided input data, or use ',
                'an item can be defined, but still be empty, this is much safer to use than a standard ',
                '"if exists" type construct. The method for determining empty is exactly the same as ',
                'the empty() helper.'
            ]
        },

        "*": function() {
            var args = Array.prototype.slice.call(arguments);
            for (var i = 0; i < args.length; i++) {
                var has_value = false;
                var thing_type = typeof args[i];
                if (Array.isArray(args[i]) || thing_type == 'string') {
                    has_value = (args[i].length !== 0);
                } else if (thing_type == 'object') {
                    var obj = safe_object(args[i]);
                    for (var key in obj) {
                        if (Object.prototype.hasOwnProperty.call(args[i], key)) {
                            has_value = true;
                        }
                    }
                } else {
                    if (args[i] !== undefined) {
                        has_value = true;
                    }
                }
                if (has_value) {
                    return args[i];
                }
            }
            return '';
        }
    },
    "now": {
        'meta': {
            'syntax': 'now( $seconds_only )',
            'returns': 'The current time in milliseconds since epoch',
            'description': [
                'now() returns the current time in milliseconds since epoch.  If $seconds_only is ',
                'passed and is true, the return value will be seconds since epoch and any milliseconds ',
                'will be discarded.'
            ]
        },

        "*": function(secondsonly) {
            var now = Date.now();
            if (secondsonly) {
                return Math.floor(now / 1000);
            } else {
                return now;
            }
        },
    },
    "strftime": {
        'meta': {
            'syntax': 'strftime( $time_format $time_since_epoch [ $timezone ] )',
            'returns': 'The a string formatted version of the timestamp given',
            'description': [
                'strftime() returns a string representing the provided time in the format provided in ',
                'the $time_format argument. The options available in $time_format are those provided for ',
                'in the ISO-C (and therefore POSIX) strftime function'
            ]
        },
        "*": function(string, time, timezone) {
            // time in strftime is assumed to be 'local' unless a timezone argument is provided.
            // to work with UTC times, simply provide a timezone of '+0000'

            var my_strftime = strftime;
            var t;
            var timestamp, date;
            var tz = false;
            if ((typeof timezone == 'string' && /^[+\-][0-9][0-9][0-9][0-9]$/.test(timezone)) || (typeof timezone == 'number')) {
                my_strftime = strftime.timezone(timezone);
                tz = true;
            } else if (typeof timezone != 'undefined') {
                return undefined;
            }
            if (typeof time == 'number') {
                timestamp = time;
                date = new Date(time);
            } else if (typeof time == 'object') {
                if (Array.isArray(time)) {
                    t = [undefined].concat(time);
                    if (typeof t[2] == 'number' || BigNumber.isBigNumber(t[2])) {
                        t[2] = t[2] - 1;
                    }
                    if (tz) {
                        t.shift();
                        date = new Date(Date.UTC.apply(undefined, t));
                    } else {
                        date = new(Function.prototype.bind.apply(Date, t));
                    }
                } else {
                    if (tz) {
                        date = new Date(Date.UTC(time.year, (time.month - 1 || 0), (time.day || 1), (time.hour || 0), (time.minutes || 0), (time.seconds || 0), (time.milliseconds || 0)));
                    } else {
                        date = new Date(time.year, (time.month - 1 || 0), (time.day || 1), (time.hour || 0), (time.minutes || 0), (time.seconds || 0), (time.milliseconds || 0));
                    }
                }
            } else if (typeof time == 'string') {
                if (/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d(:\d\d)?(\.\d+)?([\+\-]\d\d:\d\d)?$/.test(time)) {
                    date = new Date(time);
                    my_strftime = strftime.timezone('+0000');
                } else if (time == 'now') {
                    date = new Date();
                    my_strftime = strftime.timezone('+0000');
                }
            } else if (typeof time == 'undefined') {
                return undefined;
            }
            return my_strftime(string, date);
        },
    },
    "random_string": {
        'meta': {
            'syntax': 'random_string( $template [ $charmap ] )',
            'returns': 'random string created using the mask and charmap given',
            'description': [
                'The random_string() helper produces a random set of characters based on the template ',
                'provided. The $charmap is an object where each key is a single character, and the ',
                'associated value is a string containing all the charcters that can be cnosen for that ',
                'key character. Each character in the $template is looked up in the charmap and a random ',
                'character from the charmap is chosen. The default charmap (which is used when none is provided ',
                'provides the following values: "a": lowercase alphabetical characters, "A": uppercase ',
                'alphabetical characters, "b": lowercase consonants, "B": uppercase consonants, ',
                '"e": lowercase vowels, "E": uppercase consonants, "#": Digits 0-9, "F": hexadecimal digit (0-f), ',
                '"!": punctuation mark or ".": any printable character (ASCII set). Other languages / methods ',
                'are supported by providing your own character map.'
            ]
        },

        "*": function(mask, charmap) {
            var result = '';
            var character_map = random_charmap;
            var default_map = random_charmap['.'];
            // allow charmap to override our default map;
            if (typeof charmap == 'object') {
                character_map = charmap;
                default_map = charmap[Object.keys(charmap)[0]];
            } else if (typeof charmap == 'string') {
                default_map = charmap;
            }
            var current_char_map;
            for (var i = 0; i < mask.length; i++) {
                current_char_map = undefined;
                if (typeof character_map == 'object' && typeof character_map[mask[i]] == 'string') {
                    current_char_map = character_map[mask[i]];
                }
                if (typeof current_char_map == 'undefined') {
                    current_char_map = default_map;
                }
                result += current_char_map[Math.round(Math.random() * (current_char_map.length - 1))];
            }
            return result;
        }
    },
    "keys": {
        'meta': {
            'syntax': 'keys( $object )',
            'returns': 'The keys in the $object provided',
            'description': [
                'The keys() helper retrieves the keys present in the given object. If given an ',
                'array, the indexes present will be returned.'
            ]
        },
        "object": function(obj) {
        // var list = [];
        // for (var key in obj) {
        //         list.push(key);
        // }
            return obj_keys(obj);
        },
        "array": function(arr) {
            var result = [];

            // Though it should not be possible to create sparse arrays natively
            // in DTL, they can come from the data source / source language.
            // This handles retrieving the indexes from sparse arrays properly.
            arr.forEach(function(item, index) {
                result.push(index);
            });
            return result;

        },
        "*": function(thing) {
            return [];
        }
    },
    "length": {
        'meta': {
            'syntax': 'length( $item )',
            'returns': 'The length of the $item provided',
            'description': [
                'The length() helper returns the length of the given item. If $item is a string ',
                'the length in characters will be returned. If $item is an array, the number of ',
                'items in the array will be returned. If $item is an object, the number of keys ',
                'in the object will be returned. For all other types, 1 will be returned, with ',
                'the exception of undefined, which has a length of 0.'
            ]
        },
        "string": function(str) {
            return str.length;
        },
        "array": function(arr) {
            return arr.length;
        },
        "undefined": function(undef) {
            return 0;
        },
        "object": function(obj) {
            if (obj == null) {
                return 0;
            } else {
                return Object.keys(obj).length;
            }
        },
        "*": function(thing) {
            return 1;
        }
    },
    "url_encode": {
        'meta': {
            'syntax': 'url_encode( $string )',
            'returns': 'The string provided encoded using Percent Encoding.',
            'description': [
                'The url_encode() helper returns the string represented using Percent Encoding'
            ]
        },
        "string": function(raw_string) {
            return encodeURIComponent(raw_string);
        }
    },
    "url_decode": {
        'meta': {
            'syntax': 'url_decode( $encoded_string )',
            'returns': 'The results of decoding $encoded_string using Percent Encoding.',
            'description': [
                'The url_decode() helper returns the string decoded using Percent Encoding.',
                'Undoes url_encode().'
            ]
        },
        "string": function(encoded_str) {
            return decodeURIComponent(encoded_str);
        }
    },
    "escape": {
        'meta': {
            'syntax': 'escape( $string [ $characters ] )',
            'returns': 'The $string provided, with any occurances of special characters prefixed with a \\ ',
            'description': [
                'The escape() helper adds backslashes to protect any special characters found in the ',
                'provided string. This is especially useful in subscripts when a key might have odd ',
                'characters in it. If the $characters argument is provided, escape() will add escaping ',
                'to those characters instead of its default list: ( ) [ ] and .'
            ]
        },
        "string": function(str, characters) {
            var chars = characters || '([\.])';
            var re = new RegExp(chars, 'g');
            return str.replace(re, '\\$1');
        },
        "*": function(arg) {
            return arg;
        }
    },
    "regex": {
        'meta': {
            'syntax': 'regex( $pattern [ $flags ] )',
            'returns': 'A regex created using the patter and flags provided.',
            'description': [
                'The regex() helper creates a regular expression dynamically, allowing you to create ',
                'a functional regular expression from input data. Regular expressions created in this ',
                'way can be used in any location where a literal regular expression can be used.'
            ]
        },
        "string,object": function(pattern, flags) {
            let re;
            if (typeof pattern == 'string' || pattern instanceof RegExp) {
                re = new RegExp(pattern, flags);
            } else {
                // this regex is impossible to match. Start of string, look ahead is a,
                // but next character is b. The only way to match this is a string
                // whose first character is both an 'a' and a 'b' at the same time.
                re = new RegExp('^(?=a)b');
            }
            return re;
        }
    },
    "replace": {
        'meta': {
            'syntax': 'replace( $string $search $replacement )',
            'returns': 'The $string provided, with occurances of $search replaced with $replacement',
            'description': [
                'The replace() helper searches in $string for any occurrences of $search. The $search',
                'can be a string or a regex. To use a regex, use slashes around the search term. If a ',
                'string is provided, only the first occurrance of the string will be replaced. If you ',
                'wish to replace all occurrances of a string, use the regex form, providing the `g` flag. ',
                'For example, to replace all occurrances of `a`, use `/a/g` as the search parameter. '
            ]
        },
        "string": function(str, search, replacement) {
            var re = obtain_regex_from(search);
            return str.replace(re, replacement);
        },
        "*": function() {
            return "";
        }
    },
    // TODO: we need a "match" that can capture from a regexp
    "match": {
        'meta': {
            'syntax': 'match( $string $search )',
            'returns': 'An array of the matches within the string',
            'description': [
                'The match() helper tests the provided `$string` against the provided `$search` ',
                'regular expression. It then returns an array containing the matched portions of',
                'the string. The first item in the array is the matching string, and the remaining',
                'elements contain the results of any captures in the regex.  Returns an empty array',
                'if the string did not match.'
            ]
        },
        "string": function(str, search) {
            var result, re;
            re = obtain_regex_from(search);
            result = str.match(re);
            if (result === null) {
                result = [];
            }
            // we want a real array, not an array-like thing;
            return Array.prototype.slice.call(result);
        },
        "*": function() {
            return [];
        }
    },

    "flatten": {
        'meta': {
            'syntax': 'flatten( $array_or_object [ $separator ] [ $prefix ] )',
            'returns': 'A structure representing the given nested structure flattened into a single-level structure',
            'description': [
                'The `flatten()` helper takes either an array or an object. If given an array, ',
                'the `flatten()` helper will descend into any nested arrays and return a single',
                'array composed of all of the values found. This array is constructed in depth-first',
                'order. ',
                'When given an object, the `flatten()` helper creates a new object created by',
                'descending into all sub-objects and arrays in the provided object. ',
                'Each value found in a sub-object is added to the new object using the full ',
                'key path encoded using dot-notation (by default, if `$separator` is provided, ',
                'the given separator is used in place of `.` ) This creates a single layer object while',
                'still encapsulating the original structure within the key. If provided, $prefix ',
                'is added to the beginning of each top-level key. This process can be reversed ',
                'for objects using the `unflatten()` helper.'
            ]
        },
        'array': function flatten(arr, depth) {
            var new_depth;
            var new_list = [];
            var lower;
            if (typeof depth == 'undefined') {
                new_depth = depth;
            } else {
                new_depth = depth - 1;
            }
            for (var i = 0; i < arr.length; i++) {
                if ((depth === undefined || depth) && Array.isArray(arr[i])) {
                    lower = flatten(arr[i], new_depth);
                    for (var j = 0; j < lower.length; j++) {
                        new_list.push(lower[j]);
                    }
                } else {
                    new_list.push(arr[i]);
                }
            }
            return new_list;
        },
        "object": function flatten_obj(obj, separator, prefix) {
            var new_obj;
            var new_key;
            // var pairs = {};
            // var lists;
            var keys, j, i;
            var results = [];
            var sep = separator;
            if (typeof separator == 'undefined') {
                separator = '.';
            }

            if (typeof prefix == 'undefined') {
                prefix = '';
                sep = '';
            }
            if (typeof obj !== 'object' || obj == null) {
                new_obj = {};
                new_obj[prefix] = obj;
                results.push(new_obj);
            } else if (Array.isArray(obj)) {
                new_obj = {};
                for (i = 0; i < obj.length; i++) {
                    new_key = prefix + sep + i;
                    results = results.concat(flatten_obj(obj[i], separator, new_key));
                }
            } else {
                keys = Object.keys(obj);
                for (i = 0; i < keys.length; i++) {
                    new_key = prefix + sep + keys[i];
                    results = results.concat(flatten_obj(obj[keys[i]], separator, new_key));
                }
            }
            new_obj = {};
            for (i = 0; i < results.length; i++) {
                keys = Object.keys(results[i]);
                for (j = 0; j < keys.length; j++) {
                    new_obj[keys[j]] = results[i][keys[j]];
                }
            }
            return new_obj;
        },
        "coerce": ['array'],
    },
    "unflatten": {
        'meta': {
            'syntax': 'unflatten( $object [ $separator ])',
            'returns': 'A nested structure created by interpreting the keys of `$object` as dot-notation nested keys.',
            'description': [
                'The `unflatten()` helper takes an object containing a single layer of key / value pairs and ',
                'interprets the keys using dot-notation. It creates a new object using the nested structure ',
                'encoded in the keys. If `$separator` is provided, it is used in place of `.` for the purposes',
                'of decoding the keys. This effectively reverses the result of calling `flatten()` on an object.'
            ]
        },
        "object": function unflatten(obj, separator) {
            var result = {};
            var value, keys, key, current_obj, tmp;
            var last_key, last_obj;
            var root_keys = Object.keys(obj);
            if (typeof separator == 'undefined') {
                separator = /\./;
            }

            for (var j = 0; j < root_keys.length; j++) {
                value = obj[root_keys[j]];
                keys = root_keys[j].split(obtain_regex_from(separator));
                current_obj = result;
                for (var i = 0; i < keys.length; i++) {
                    key = keys[i];
                    // if the current object is an array, but the new key is not numeric
                    // the current object must become an actual object.  this does that.
                    if (!/^[0-9]+$/.test(key) && Array.isArray(current_obj)) {
                        tmp = {};
                        for (var k = 0; k < current_obj.length; k++) {
                            tmp[k] = current_obj[k];
                        }
                        last_obj[last_key] = tmp;
                        current_obj = last_obj[last_key];
                    }
                    if (i < keys.length - 1) {
                        if (typeof current_obj[key] != 'object') {
                            if (/^[0-9]+$/.test(keys[i + 1])) {
                                current_obj[key] = [];
                            } else {
                                current_obj[key] = {};
                            }
                        }
                        last_key = key;
                        last_obj = current_obj;
                        current_obj = current_obj[key];
                    } else {
                        current_obj[key] = value;
                    }
                }
            }
            return result;

        },
        "coerce": ['array'],
    },
    "sort_by": {
        'meta': {
            'syntax': 'sort_by( $array $extractor )',
            'returns': 'A new array containing elements from the input array sorted according to the value returned by $extractor.',
            'description': [
                'The `sort_by()` helper takes an array and sorts it according to the results of `$extractor`',
                'which can be a DTL expression or transform. The `$extractor` transform is given each value',
                'from the array in turn, and should result in the value to be used when sorting the array. ',
                'This is especially useful in sorting arrays of objects by a certain field in the object. ',
                'The `$extractor` should simply evaluate to the value to sort by.'
            ]
        },
        "array": function(options, original_list, transform) {
            // in order to avoid running the transform multiple times over
            // each items, we have to get the values first, then sort. It is a
            // three step process: map over original running each transform
            // sort based on the resulting values.
            // create new list from sorted results

            var value_list = map(original_list, function(value, ind, all) {
                var val = transform_helper(options, value, transform);
                return {
                    type: typeof val,
                    index: ind,
                    value: val
                };
            });

            value_list.sort(function(a, b) {
                if (a.type == 'string') {
                    return a.value.localeCompare(b.value);
                } else if (a.type == 'number') {
                    return a.value - b.value;
                } else {
                    return a.index - b.index;
                }
            });

            var new_list = [];
            map(value_list, function(value, ind, list) {
                new_list.push(original_list[value.index]);
            });
            return new_list;
        },
        "coerce": ['array'],
        wants_options: true

    },
    "sort": {
        'meta': {
            'syntax': 'sort( $array $comparison )',
            'returns': 'A new array containing elements from the input array sorted according to the comparison expression provided.',
            'description': [
                'The `sort()` helper takes an array and sorts it according to the results of `$comparison`',
                'which can be a DTL expression or transform. The comparison is provided an object containing',
                'an `$a` item and a `$b` item and should evaluate to a positive value if `$a` should be sorted',
                'after `$b`, a negative value if `$a` should be sorted before `$b` or 0 if `$a` and `$b` are',
                'equal for the purposes of sorting. Note that the `$comparison` may be arbitrarily complex',
                'and may compare multiple elements to arrive at the result.'
            ]
        },
        "array": function(options, list, transform) {
            var new_list;
            if (typeof transform == 'undefined') {
                new_list = [].concat(list);
                new_list.sort();
                return new_list;
            } else {
                new_list = [].concat(list);
                new_list.sort(function(a, b) {
                    return transform_helper(options, {
                        "a": a,
                        "b": b
                    }, transform);
                });
                return new_list;
            }
        },
        "coerce": ['array'],
        wants_options: true

    },
    'reverse': {
        'meta': {
            'syntax': 'reverse( $array_or_string )',
            'returns': 'A new array consisting of the elements of the array or string provided in reversed order',
            'description': [
                'The `reverse()` helper takes an array or string, and reverses it, returning a new array or',
                'string with the elements in reversed order from the original.'
            ]
        },
        'array': function(list) {
            var new_list = [].concat(list);
            new_list.reverse();
            return new_list;
        },
        "string": function(str) {
            return str.split("").reverse().join("");
        }
    },
    'split': {
        'meta': {
            'syntax': 'split( $string $regexp )',
            'returns': 'An array containing the elements of the string split according to `$regexp`',
            'description': [
                'The `split()` helper takes a string and a regular expression and uses the regular',
                'expression to divide the string. The result is an array of substrings containing the',
                'elements of the string separated by the `$regexp`.'
            ]
        },
        "string": function(list, regex) {
            return list.split(obtain_regex_from(regex));
        },
        "*": function(list, regex) {
            return list;
        }
    },
    'join': {
        'meta': {
            'syntax': 'join( $array $separator )',
            'returns': 'A string containing the elements of the array joined with `$separator`.',
            'description': [
                'The `join()` helper takes an array of strings and a separator and produces a new',
                'string by appending each string in the array with a `$separator` in between each.',
                'value.'
            ]
        },
        "array": function(list, separator) {
            return list.join(separator);
        },
        "*": function(list, separator) {
            return list;
        }
    },
    'substr': {
        'meta': {
            'syntax': 'substr( $string $start $end )',
            'returns': 'A string containing the characters of the original string beginning at `$start` offset and ending at `$end` offset.',
            'description': [
                'The `substr()` helper takes an string and a start and end position and returns the',
                'characters in the original string beginning at `$start` and ending at `$end` characters',
                'from the beginning of the string.'
            ]
        },
        "string": function(str, start, end) {
            return str.substring(start, end);
        },
        "*": function(item, start, end) {
            return undefined;
        }
    },
    'typeof': {
        'meta': {
            'syntax': 'typeof( $thing )',
            'returns': 'A string containing a word describin the type of `$thing`',
            'description': [
                'The `typeof()` helper takes an item of any type and returns a string indicating',
                'what type of thing `$thing` is. Possible values are: `string`, `number`, `boolean`,',
                '`object`, `array` and `undefined`. Note that `undefined` is not the same as empty.',
                'For a value that consists, for example, of an empty string: `\'\'` `typeof()` will',
                'return `string`.  For this reason, it is best not to use typeof to check for a ',
                'missing value, and in that case the `empty()` helper should be preferred.'
            ]
        },
        '*': function(thing) {
            var type = typeof thing;
            if (type == 'object') {
                if (Array.isArray(thing)) {
                    type = 'array';
                }
            }
            return type;
        },
    },
    "uuid": {
        'meta': {
            'syntax': 'uuid([ $version ] [ $name ] [ $namespace ])',
            'returns': 'A UUID string',
            'description': [
                'The `uuid()` helper returns a newly generated uuid string (v4 by default).',
                'Version may be 1, 3, 4 or 5. If a version is provided, generate a uuid using that version.',
                'If version 3 or 5 is provided, then a name and namespace must also be provided.'

            ]
        },
        '*': function(version, name, namespace) {
            if (typeof version == 'undefined') {
                version = 4;
            }
            switch(version) {
                case 1:
                    return uuid.v1();
                    break;
                case 3:
                    if (typeof namespace != 'string' || namespace.length != 36) {
                        throw new Error('Unable to generate v3 uuid, bad namespace');
                    }
                    return uuid.v3(name, namespace);
                    break;
                case 4:
                    return uuid.v4();
                    break;
                case 5:
                    if (typeof namespace != 'string' || namespace.length != 36) {
                        throw new Error('Unable to generate v3 uuid, bad namespace');
                    }
                    return uuid.v5(name, namespace);
                    break;
                default:
                    return undefined;
                    break;
            }
        }
    },
    "transform": {
        'meta': {
            'syntax': 'transform($input $transform_or_expression)',
            'returns': 'The result of providing `$input` as `$.` to the given `$transform_or_expression`',
            'description': [
                'The `transform()` helper executes the provided `$transform_or_expression` with ',
                'the provided `$input` as `$.`. The result of the transform or expression is returned.',
                'This is used so frequently in DTL that there are two alternate forms of this helper, ',
                '`^($input $transform)` performs exactly the same action. Another form is expressed like',
                'an operator: `$input -> $transform` where $transform is either a direct DTL expression ',
                'or, more commonly, the name of a transform you wish to use. Finally, there is a shortcut ',
                'version where only the transform is provided, such as `^(\'tx_name\')`. When used ',
                'this way, the input data will be set to `$.` - This can be especially useful for ',
                'pulling in complex data structures from the transform itself. '
            ]
        },
        "*": transform_helper,
        "wants_options": true,
        "aliases": ['^'],
    },
    "values": {
        'meta': {
            'syntax': 'values( $object )',
            'returns': 'An array containing the values extracted from the passed `$object`',
            'description': [
                'The `values()` helper obtains the values from the given $object and returns',
                'them in an array. If an array is provided instead of an object, the array is ',
                'returned, as it is already a list of values. If you provide a scalar value ',
                '(something not an array or an object) `values()` will return an array containing ',
                'the single value passed in. Note that in all cases, there is no guaranteed ',
                'ordering in the provided results.'
            ],
        },
        "object": function(obj) {
            var list = [];
            for (var key in obj) {
                list.push(obj[key]);
            }
            return list;
        },
        "array": function(thing) {
            return thing;
        },
        "*": function(thing) {
            return [thing];
        }
    },
    "lc": {
        'meta': {
            'syntax': 'lc( $string )',
            'returns': 'A new string consisting of the characters in the passed string converted to lowercase.',
            'description': [
                'The `lc()` helper returns a new string containing the characters from the provided `$string`',
                'converted to their lowercase equivalents.'
            ],
        },
        'string': function(str) {
            if (typeof str == 'string') {
                return str.toLowerCase();
            } else {
                return '';
            }
        }
    },
    "uc": {
        'meta': {
            'syntax': 'uc( $string )',
            'returns': 'A new string consisting of the characters in the passed string converted to uppercase.',
            'description': [
                'The `uc()` helper returns a new string containing the characters from the provided `$string`',
                'converted to their uppercase equivalents.'
            ],
        },
        'string': function(str) {
            if (typeof str == 'string') {
                return str.toUpperCase();
            } else {
                return '';
            }
        },
    },
    "capitalize": {
        'meta': {
            'syntax': 'capitalize( $string )',
            'returns': 'A new string consisting of the characters in the passed string, with the first character converted to uppercase.',
            'description': [
                'The `capitalize()` helper returns a new string containing the characters from the provided `$string`',
                'with the first character converted to it\'s uppercase equivalent.'
            ],
        },
        'string': function(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
    },
    'sprintf': {
        'meta': {
            'syntax': 'sprintf( $formatstring [$args...] )',
            'returns': 'Returns a string formatted according to the format string provided',
            'description': [
                'The `sprintf()` helper returns a new string formatted according to the format string',
                'provided, using the standard conventions of the `sprintf` function from the standard',
                'C library.'
            ],
        },
        'string': function() {
            var args = Array.prototype.slice.call(arguments);
            var tmp;
            // if we only get two args, and the second is an array
            // we treat it as a list of args for sprint.
            if (args.length == 2 && Array.isArray(args[1])) {
                tmp = args.pop();
                args = args.concat(tmp);
            }
            return sprint.apply(undefined, args);
        }
    },
    "tofixed": {
        'meta': {
            'syntax': 'tofixed( $number $precision $as_string)',
            'returns': 'A new number with the given level of precision',
            'description': [
                'The `tofixed()` helper returns a new number with up to $precision digits to',
                'the right of the decimal. This will be returned as a number unless $as_string',
                'is set to true, in which case a string is returned. When returning a number', 
                'the number will be rounded to the appropriate precision.  It should be noted',
                'that if using BigNumbers is disabled, exact precision it is not guaranteed and',
                'the number returned may not have exactly $precision digits after the decimal point.'
            ],
        },
        'bignumber': function(bignum, precision, as_string) {
            let new_num = bignum.toPrecision(precision);
            if (as_string) {
                return new_num.toString();
            } else {
                return new_num;
            }
        },
        'number': function(num, precision, as_string) {
            let new_num = num.toFixed(precision);
            if (as_string) {
                return new_num;
            } else {
                return Number.parseFloat(new_num);
            }
        }
    },
    "bignumber_clean": {
        'meta': {
            'syntax': 'bignumber_clean( $thing $use_strings )',
            'returns': '$thing with all bignumbers within converted to scalars',
            'description': [
                'The `bignumber_clean()` helper returns a copy of $thing with all BigNumbers',
                'contained within converted to scalars. By default they will be converted ',
                'to numbers, if $use_strings is set to true, BigNumbers will be converted to',
                'strings instead, preserving their precision.'
            ]
        },
        "*": function(thing, use_strings) {
            return deep_bignumber_convert(use_strings, thing);
        }
    },
    'from_json': {
        'meta': {
            'syntax': 'from_json( $json_string )',
            'returns': 'Returns the value or object described in the json string provided',
            'description': [
                'The `from_json()` helper parses the string provided as JSON and returns the',
                'value or object described by the JSON string'
            ],
        },
        'string': function(str) {
            var res;
            try {
                res = JSON.parse(str);
            } catch (e) {
                res = "";
            }
            return res;
        }
    },
    'to_json': {
        'meta': {
            'syntax': 'to_json( $value_or_object $pretty $preserve_undefined $bignumbers_as_strings)',
            'returns': 'Returns a string representing the value or object provided as a JSON string.',
            'description': [
                'The `to_json()` helper encodes the provided value or object into a JSON string and',
                'returns the string. If $pretty is true, the resulting string will be padded to be',
                'more readable for humans. If $preserve_undefined is true, then undefined values ',
                'will be placed in the resulting json as null.'
            ],
        },
        "*": function(obj, pretty, preserve_undefined, bignumbers_as_strings) {
            let res;
            let new_obj = obj;
            let preserve_function = null;
            if (pretty == 'pretty') {
                pretty = '    ';
            }
            if (pretty === false) {
                pretty = ''
            }
            if (preserve_undefined) {
                preserve_function = json_preserve_undefined;
            }
            if (!bignumbers_as_strings) {
                new_obj = deep_bignumber_convert(bignumbers_as_strings, obj);
            }
            try {
                res = JSON.stringify(new_obj, preserve_function, pretty);
            } catch (e) {
                res = "{}";
            }
            return res;
        },
    },
    'segment': {
        'meta': {
            'syntax': 'segment( $array [$group_size $start $end ] )',
            'returns': "An array of arrays, grouping $array's values into sub-arrays of length $group_size.",
            'description': [
                'The `segment()` helper breaks the array given into sub-arrays of maximum $group_size length.',
                'If $start and $end are provided, only the elements between $start and $end in the original',
                'array are part of the resulting segments. Each sub-array will have at most $group_size elements,',
                'however, the final sub-array may have less than $group_size elements as it will contain the remainder',
                'of the elements if the $array is not evenly divisible by $group_size.'
            ],
        },
        'array': function(thing, req_group_size, req_start, req_stop) {

            var res = [
                []
            ];
            var start = req_start || 0;
            var stop = req_stop || thing.length - 1;
            var count = 0;
            var group_size;
            if (typeof req_group_size == 'number' && req_group_size !== 0) {
                group_size = Math.ceil(req_group_size);
            } else {
                // if we don't have a group size, then it's one group to hold it all
                group_size = 1 + stop - start;
            }

            for (var i = start; i <= stop; i++) {
                if (res[count].length >= group_size) {
                    count++;
                    res[count] = [];
                }
                res[count].push(thing[i]);
            }
            return res;
        },
        "coerce": ['array'],
    },
    'head': {
        'meta': {
            'syntax': 'head( $array $n )',
            'returns': "An array containing the first $n items in the given array.",
            'description': [
                'The `head()` helper returns the first $n items in the given array'
            ],
        },
        'array': function(thing, count) {
            return thing.slice(0, count);
        },
        "coerce": ['array'],
    },
    'tail': {
        'meta': {
            'syntax': 'tail( $array $n )',
            'returns': "An array containing the the last $n items in the given array.",
            'description': [
                'The `tail()` helper returns the last $n items in the given array'
            ],
        },
        'array': function(thing, count) {
            return thing.slice(count * -1);
        },
        "coerce": ['array'],
    },
    'extract': {
        'meta': {
            'syntax': 'extract( $input_data [ keys to extract ] )',
            'returns': "An array or object containing only the indexes / keys given in the extract list",
            'description': [
                'The `extract()` helper retrieves the values in the $input_data that correspond to the',
                'keys provided.  If $input_data is an object, returns a new object containing only the',
                'elements indicated. If $input_data is an array, returns a new array containing only the',
                'items corresponding to the indexes provided in the order provided.'
            ],
        },
        'array': function() {
            var args = Array.prototype.slice.call(arguments);
            var list = args.shift();
            var results = [];
            for (var i = 0, len = args.length; i < len; i++) {
                if (Array.isArray(args[i])) {
                    for (var j = 0, l = args[i].length; j < l; j++) {
                        results.push(list[args[i][j]]);
                    }
                } else {
                    results.push(list[args[i]]);
                }
            }
            return (results);
        },
        'object': function() {
            var args = Array.prototype.slice.call(arguments);
            var object = args.shift();
            var results = {};
            for (var i = 0, len = args.length; i < len; i++) {
                if (Array.isArray(args[i])) {
                    for (var j = 0, l = args[i].length; j < l; j++) {
                        results[args[i][j]] = object[args[i][j]];
                    }
                } else {
                    results[args[i]] = object[args[i]];
                }
            }
            return (results);
        },
        "coerce": ['array'],
    },
    'pairs': {
        'meta': {
            'syntax': 'pairs( $object )',
            'returns': "An array of arrays containing the key/value pairs for all elements in the object provided.",
            'description': [
                'The `pairs()` helper extracts the keys and values in the given object and returns ',
                'an array of key / value pairs. These pairs can be manipulated and an object can be ',
                'reconstructed using the `{}` object creation operator. See also `flatten()`'
            ],
        },
        "object": function pairs(input) {
            var res = map(input, function(value, index, list) {
                return [index, value];
            });
            return res;
        }
    },
    "map": {
        'meta': {
            'syntax': 'map( $input_data $transform [ $extra ])',
            'returns': "An array containing the results of applying $transform to each $item in $input_data.",
            'description': [
                'The `map()` helper applies the given $transform to each item in $input_data and returns the result.',
                'The $transform argument may be an inline transform in DTL tags, such as `(: $item :)` or may be',
                'the quoted name of another transform in the transform object currently being processed.',
                'The transform is provided the current item, the current index from the input data, and the complete',
                'input_data as $item, $index and $all respectively. The $extra data, if provided, is also available',
                'in the transform as $extra. The result of map is an array containing the result of applying the ',
                'transform to each item in the input.'
            ],
        },
        "array,object": function map_helper(options, input, transform, extra) {
            var res;
            res = map(input, function(value, key, list) {
                var new_input_data = make_iteratee_arguments(list, key, value);
                if (typeof extra !== 'undefined') {
                    new_input_data.extra = extra;
                }
                var result = transform_helper(options, new_input_data, transform);
                return result;
            });

            return res;
        },
        "undefined": function() {
            return [];
        },
        "coerce": ['array'],
        wants_options: true
    },
    "reduce": {
        'meta': {
            'syntax': 'reduce( $input_data $transform [$memo])',
            'returns': "The result of applying $transform to each item in $input_data.",
            'description': [
                'The `reduce()` helper applies the given $transform to each item in $input_data and returns the result.',
                'The $transform argument may be an inline transform in DTL tags, such as `(: $item :)` or may be',
                'the name of another transform in the transform object currently being processed.',
                'The transform is provided the current item, the current index from the input data, and the complete',
                'input_data as $item, $index and $all respectively. It is also provided $memo, which is the result',
                'of the previous transform application. The first time through, $memo will contain the value provided',
                'to the helper as $memo (or undefined if none is provided). The result of reduce is the value returned',
                'by the final application of the transform.'
            ],
        },
        "array,object": function reduce_helper(options, input, transform, memo) {
            var res;
            if (typeof memo === 'undefined') {
                memo = {};
            }
            res = reduce(input, function(memo, value, key, list) {
                var new_input_data = make_iteratee_arguments(list, key, value);
                new_input_data.memo = memo;
                var result = transform_helper(options, new_input_data, transform);
                return result;
            });
            return res;
        },
        "coerce": ['array'],
        wants_options: true
    },
    // set theory operations
    "n": "intersection",
    "\u2229": "intersection",
    "intersection": {
        'meta': {
            'syntax': 'intersection( $list_a $list_b)',
            'returns': "The items that are on both $list_a and $list_b",
            'description': [
                'The `intersection()` helper examines $list_a and $list_b and returns the set intersection, ',
                'or the items that appear on both lists.',
                'Currently only works on simple data types such as strings or numbers.'
            ],
        },
        "array": function intersection(set_a, set_b) {
            // right now this only really operates on simple values;
            var result = [];
            var found = {};
            var i;
            for (i = 0; i < set_a.length; i++) {
                found[set_a[i]] = true;
            }
            for (i = 0; i < set_b.length; i++) {
                if (found[set_b[i]]) {
                    result.push(set_b[i]);
                }
            }
            return result;
        },
        "coerce": ['array'],
    },
    "u": "union",
    "\u222A": "union",
    "union": {
        'meta': {
            'syntax': 'union( $list_a $list_b)',
            'returns': "A new list containing the items from both $list_a and $list_b",
            'description': [
                'The `union()` helper examines $list_a and $list_b and returns the set union, ',
                'or a new list containing all the items from both lists. Note that a the resulting',
                'list will have had any duplicate values removed.',
                'Currently only works on simple data types such as strings or numbers.'
            ],
        },
        "array": function union() {
            var args = Array.prototype.slice.call(arguments);
            var res = [];
            var current;
            var found = {};
            for (var i = 0; i < args.length; i++) {
                current = args[i];
                for (var j = 0; j < current.length; j++) {
                    if (!found[current[j]]) {
                        found[current[j]] = true;
                        res.push(current[j]);
                    }
                }
            }
            return res;
        },
        "coerce": ['array'],
    },
    "\u2216": "difference",
    "\\": "difference",
    "diff": "difference",
    "difference": {
        'meta': {
            'syntax': 'difference( $list_a $list_b)',
            'returns': "A new list containing the items in $list_b that are not on $list_a",
            'description': [
                'The `difference()` helper examines $list_a and $list_b and returns the set difference,',
                'or a new list containing all the items in $list_b that are not in $list_a.',
                'Currently only works on simple data types such as strings or numbers.'
            ],
        },
        "array": function difference(set_u, set_a) {
            var result = [];
            var found = {};
            var i;
            for (i = 0; i < set_a.length; i++) {
                found[set_a[i]] = true;
            }
            for (i = 0; i < set_u.length; i++) {
                if (found[set_u[i]] !== true) {
                    result.push(set_u[i]);
                }
            }
            return result;
        },
        "*": function() {
            return [];
        },
        "coerce": ["array"]
    },
    "E": "member",
    "\u2208": "member",
    "member": {
        'meta': {
            'syntax': 'member( $list $item)',
            'returns': "True if $item is a member of $list",
            'description': [
                'The `member()` helper examines $list_a and returns true if $item is a member of',
                '$list and false otherwise.',
                'Currently only works on simple data types such as strings or numbers.'
            ],
        },
        "array": function(set_a, find) {
            for (var i = 0; i < set_a.length; i++) {
                if (set_a[i] == find) {
                    return true;
                }
            }
            return false;
        },
        "coerce": ["array"]
    },
    "c": "subset",
    "\u2282": "subset",
    "\u2286": "subset",
    "subset": {
        'meta': {
            'syntax': 'subset( $list_a $list_b)',
            'returns': "True if $list_b is a subset of $list_a",
            'description': [
                'The `subset()` helper examines $list_a $list_b and returns true if',
                '$list_b is a subset of $list_a, in other words if every element of $list_b',
                'is also on $list_a.',
                'Currently only works on simple data types such as strings or numbers.'
            ],
        },
        "array": function(set_a, set_b) {
            var result = [];
            var looking_for = [].concat(set_b);
            var found = {};
            var i;
            for (i = 0; i < set_a.length; i++) {
                found[set_a[i]] = true;
            }
            for (i = 0; i < looking_for.length; i++) {
                if (found[looking_for[i]]) {
                    result.push(set_b[i]);
                }
            }
            return (result.length == looking_for.length);
        },
        "coerce": ["array"]
    }

};

function dtl_builtins() {
    return helper_list;
}

dtl_builtins.deep_bignumber_convert = deep_bignumber_convert;

module.exports = dtl_builtins;
