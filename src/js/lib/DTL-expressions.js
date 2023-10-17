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
/* jshint esversion: 6 */
'use strict';
const dtl_builtins = require('./dtl-builtins.js');
const dtl_math_helpers = require('./dtl-math-helpers.js');
const dtl_expression_parser = require('./dtl-expression-syntax.js');
const dtl_crypto_helpers = require('./dtl-crypto-helpers.js');
const deepEqual = require('fast-deep-equal');
const BigNumber = require('bignumber.js');
const util = require('util');


var operations_list = {
    "&&":  function(left, right) {
               return left && right;
           },

    "||":  function(left, right) {
               return left || right;
           },
    "&":   function(left, right) {
               if (typeof left == 'undefined') {
                   return right;
               } else if (typeof right == 'undefined') {
                   return left;
               } else {
                   return "" + left + right;
               }
           },
    "!": function(val) {
            return !val;
        },
    "==": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).eq(right);
        } else if (typeof left == 'object') {
            return deepEqual(left, right);
        } else {
            return left == right;
        }
    },
    "!=": function(left, right) {
        if (all_numeric(left, right)) {
            return !new BigNumber(left).eq(right);
        } else if (typeof left == 'object') {
            return !deepEqual(left, right);
        } else {
            return left != right;
        }
    },
    "<=": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).lte(right);
        } else {
            return left <= right;
        }
    },
    ">=": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).gte(right);
        } else {
            return left >= right;
        }
    },
    "<": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).lt(right);
        } else {
            return left < right;
        }
    },
    ">": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).gt(right);
        } else {
            return left > right;
        }
    },
    "+": function(left, right) {
        if (typeof left === 'undefined') {
            return right;
        } else if (typeof right === 'undefined') {
            return left;
        } else if (all_numeric(left, right)) {
            return new BigNumber(left).plus(right);
        } else {
            return left + right;
        }
    },
    "-": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).minus(right);
        } else {
            return undefined;
        }
    },
    "*": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).times(right);
        } else {
            return undefined;
        }
    },
    "^": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).pow(right);
        } else {
            return undefined;
        }
    },
    "%": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).modulo(right);
        } else {
            return undefined;
        }
    },
    "/": function(left, right) {
        if (all_numeric(left, right)) {
            return new BigNumber(left).dividedBy(right);
        } else {
            return left + '/' + right;
        }
    },
     "//":  function(regex, flags, complain, quote) {
               if (complain) {
                   console.warn('Quoted Regex expressions are deprecated', quote + regex + quote);
               }
               return new RegExp(regex, flags);
            },

     "=~":  function(left, regex) {
                var test = regex;
                return test.test(left);
            },
     "<=>": function(left, right) {
                if (all_numeric(left,right)) {
                    let res = new BigNumber(left).comparedTo(right);
                    if (res == null) {
                        if (BigNumber(left).isNaN()) {
                            if (BigNumber(right).isNaN()) {
                                res = 0;
                            } else {
                                res = -1
                            }
                        } else {
                            res = 1;
                        }
                    }
                    return res;
                } else if (typeof left == 'string' || typeof right == "string") {
                    // if either are strings, we treat them as strings;
                    left = ""+left;
                    right = ""+right;
                    var res = left.localeCompare(right);
                    if (res > 0) {
                        return 1;
                    } else if (res < 0) {
                        return -1;
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
     },
     ":": function(left, right) {
          return [ left, right ];
     },
     "{}":  function make_obj(arr) {
                var new_obj = {};
                var key;
                if (Array.isArray(arr)) {
                    if (arr.length == 2 && !Array.isArray(arr[0])) {
                        new_obj[arr[0]] = arr[1];
                    } else {
                        for (var i = 0; i < arr.length; i++) {
                            if (Array.isArray(arr[i])) {
                              key = arr[i][0];
                              new_obj[key] = arr[i][1];
                            }
                        }
                    }
                }
                return new_obj;
            },
     "[]":  function make_array(arr) {
                if (arr.length) {
                    return arr;
                } else {
                    return [];
                }
            },
    "[.]": function get_var(data, keys) {
        // need to test if this triggers a bug when a keyfilter has been provided.
        return parseVariable(data, keys);
    },
    "..": function span(given_start, given_end) {
        var list = [];
        let start = regular_number(given_start);
        let end = regular_number(given_end);

        if (typeof start == 'number' && typeof end == 'number' ) {
            if (start <= end) {
                // forward list.
                for (var i = start; i <= end; i++) {
                    list.push(i)
                }
            } else {
                // reversed list.
                for (var i = start; i >= end; i--) {
                    list.push(i);
                }
            }
        }
        return list;
    },
    "()": function parens(val) {
        return val;
    }
};

let simple_numbers_operations = {
     "==":  function(left, right) {
                if (typeof left == 'object') {
                    return deepEqual(left, right);
                } else {
                    return left == right;
                }
            },
     "!=":  function(left, right) {
                if (typeof left == 'object') {
                    return !deepEqual(left, right);
                } else {
                    return left != right;
                }
            },
     "<=":  function(left, right) {
                return left <= right;
            },

     ">=":  function(left, right) {
                return left >= right;
            },

     "<":   function(left, right) {
                return left < right;
            },

     ">":   function(left, right) {
                return left > right;
            },

     "+":   function(left, right) {
                //return left + right;
                //console.log(left + " is big number: " + BigNumber.isBigNumber(left));
                if (typeof left == 'undefined') {
                    return right;
                } else if (typeof right == 'undefined') {
                    return left;
                } else {
                    return +left + +right;
                }
            },
     "-":   function(left, right) {
                if (!all_numeric(left,right)) {
                  return undefined;
                } else {
                  return left - right;
                }
            },

     "*":   function(left, right) {
                if (!all_numeric(left,right)) {
                   return undefined;
                } else {
                   return left * right;
                }
            },

     "^":   function(left, right) {
                if (!all_numeric(left,right)) {
                  return undefined;
                } else {
                  return Math.pow(left,right);
                }
            },

     "%":   function(left, right) {
                if (all_numeric(left,right)) {
                  return left % right;
                } else {
                  return undefined;
                }
            },

     "/":   function(left, right) {
                if (all_numeric(left,right)) {
                  return left / right;
                } else {
                  return left + '/' + right;
                }
            }
}

function Expressions(config) {
    this.use_bignumber = true;
    this.helpers = {};
    this.operations = Object.assign({}, operations_list);
    this.add_helpers_from_object(dtl_builtins());
    this.add_helpers_from_object(dtl_math_helpers());
    if (typeof dtl_crypto_helpers == 'function') {
        this.add_helpers_from_object(dtl_crypto_helpers());
    }
    if (typeof config != 'object') {
        config = {};
    }
    if (!config.use_bignumber) {
        this.use_bignumber = false;
        this.disable_bignumbers();
    }
    if (config.use_expression_caching == false) {
        this.use_expression_caching(false);
    } else {
        this.use_expression_caching(true);
    }
}

/*    if (Class.use_bignumber) {
    Class.enable_bignumber();
}
*/
function all_numeric() {
    for (let i = 0; i < arguments.length; i++) {
        const arg = arguments[i];
        if (typeof arg !== 'number' && !(arg instanceof BigNumber) && !/^[-+]?[\d\.\s]+$/.test(arg)) {
            return false;
        }
    }
    return true;
}
  
function regular_number(value) {
    if (typeof value === 'number') {
        return value;
    } else if (value instanceof BigNumber) {
        return value.toNumber();
    } else {
        return value;
    }
}

function parseBigNumber(thing, base) {
    return new BigNumber(thing, base);
}

Expressions.prototype.add_helper = function(name, first_arg_type, helper_func, options) {
    var types = ['string', 'object', 'array', 'number', 'undefined', 'boolean'];
    var new_type;
    if (typeof this.helpers[name] == 'undefined') {
        this.helpers[name] = {};
    }
    if (typeof first_arg_type == 'function') {
        // no arg_type.  that means '*'
        helper_func = first_arg_type;
        first_arg_type = '*';
    }
    if (options.wants_options) {
        helper_func.wants_options = true;
    }
    if (typeof options.coerce !== 'undefined' && Array.isArray(options.coerce)) {
        this.helpers[name].coerce = options.coerce;
    }
    if (typeof options.meta == 'object') {
        this.helpers[name].meta = options.meta;
    } else {
        console.warn("WARNING: Helper '" + name + "' added without metadata!");
    }

    if (first_arg_type == '*') {
        // loop over and set to all that are not already defined.
        for (var i = 0; i < types.length; i++) {
            new_type = types[i];
            if (typeof this.helpers[name][new_type] == 'undefined' ) {
                this.helpers[name][new_type] = helper_func;
            }
        }
    } else {
        this.helpers[name][first_arg_type] = helper_func;
    }
}

Expressions.prototype.link_helper = function(new_name, original_name) {
    if (typeof this.helpers[original_name] !== 'undefined') {
        this.helpers[new_name] = this.helpers[original_name];
    }
}

Expressions.prototype.add_helpers_from_object = function(raw_helpers, prefix) {
    var links = [];
    var helpername, exposed_helpername, current_helpername, helper_names, arg_type, i, type_regex;
    var types = ['string', 'object', 'array', 'number', 'undefined', 'boolean', 'unprocessed_args'];
    var new_helper;
    // check to see we end with a dot.
    if (typeof prefix != 'undefined') {
        if (prefix.substr(prefix.length-1) != '.') {
            prefix += '.';
        }
    }

    for (helpername in raw_helpers) {
        var options = {
            wants_options: false,
            meta: raw_helpers[helpername].meta
        };
        if (typeof raw_helpers[helpername] === 'string') {
            links.push(helpername);
            continue;
        }
        if (typeof raw_helpers[helpername] === 'function') {
            new_helper = { '*': raw_helpers[helpername] };
        } else {
            new_helper = raw_helpers[helpername];
            if (typeof new_helper.wants_options !== 'undefined' && new_helper.wants_options === true) {
                options.wants_options = true;
            }
            if (typeof new_helper.coerce !== 'undefined' && Array.isArray(new_helper.coerce)) {
                options.coerce = new_helper.coerce;
            }
        }
        helper_names = [ helpername ];
        if (Array.isArray(new_helper.aliases)) {
            helper_names = helper_names.concat(new_helper.aliases);
        }
        for (var j = 0, len = helper_names.length; j < len; j++) {
            current_helpername = helper_names[j];
            if (typeof prefix != 'undefined') {
                exposed_helpername = prefix + current_helpername;
            } else {
                exposed_helpername = current_helpername;
            }
            if (typeof new_helper['*'] == 'function') {
                this.add_helper(exposed_helpername, '*', new_helper['*'], options);
            }
            for (i = 0; i < types.length; i++) {
                type_regex = new RegExp(types[i]);
                for (arg_type in new_helper) {
                    if (type_regex.test(arg_type)) {
                        this.add_helper(exposed_helpername, types[i], new_helper[arg_type], options);
                    }
                }
            }
        }
    }
    for (i = 0; i < links.length; i++) {
        helpername = links[i];
        this.link_helper(helpername, raw_helpers[helpername]);
    }

    return this.helpers;
}


Expressions.prototype.get_available_helpers = function() {
    // gets all loaded helpers and their metadata
    var metadata = {};
    Object.keys(this.helpers).forEach(function(key) {
        metadata[key] = this.helpers[key].meta;
    }.bind(this));
    return metadata;
}

function handle_coercion(args, coerce_order, helper) {
    // coerce first arg in coerce order.
    var coerce_type;
    if (typeof helper['*'] == 'function') {
        // don't do any coercion if the helper already
        // claims to handle all types.
        return args;
    } else {
        // find the correct coerce type in our list.
        for (var i = 0, len = coerce_order.length; i < len; i++) {
            if (typeof helper[coerce_order[i]] != 'undefined') {
                coerce_type = coerce_order[i];
                break;
            }
        }
        // we only try to coerce the first argument.
        if (coerce_type == 'array') {
            if (typeof args[0] == 'undefined') {
                args[0] = [];
            } else {
                args[0] = [ args[0] ];
            }
        } else if (coerce_type == 'object') {
            // we can coerce undefined into an empty object
            // but all other types are too ambiguous
            if (typeof args[0] == 'undefined') {
                args[0] = {}
            }
        } else if (coerce_type == 'string') {
            if (typeof args[0] == 'undefined') {
                args[0] = "";
            } else if(typeof args[0] == 'number') {
                args[0] = "" + args[0];
            }
        } else if (coerce_type == 'number') {
            if (typeof args[0] == 'string') {
                var new_val = parseFloat(args[0]);
                if (!isNaN(new_val)) {
                    args[0] = new_val;
                }
            } else if (BigNumber.isBigNumber(args[0])) {
                args[0] = args[0].toNumber();
            }
        }
    }
    return args;
}

Expressions.prototype.call_helper = function(helper, args, options) {
    var first_arg_type, helper_func;
    var helper_type = typeof this.helpers[helper];
    var new_args;

    if ( helper_type === 'object' ) {
        // unprocessed_args means we have a function that wants to interpret it's arguments itself.
        // unprocessed_args will ALWAYS take precedence over all other first_arg types, if present.
        // (because with unprocessed args we can't know what type the first arg will resolve to)
        if (this.helpers[helper].unprocessed_args) {
            helper_func = this.helpers[helper].unprocessed_args;
            new_args = [options].concat(args);
        } else {
            new_args = this.interpret_operation(options, args);
            /*
            for (let i = 0; i < new_args.length ; i++) {
                if (typeof new_args[i] == 'object' && BigNumber.isBigNumber(new_args[i])) {
                    new_args[i] = new_args[i].toNumber();
                }
            }
            */
            let handles_bignumbers = (this.helpers[helper].handles_bignumbers || typeof this.helpers[helper]['bignumber'] != 'undefined');

            if (!handles_bignumbers) {
               for(let i = 0; i < new_args.length; i++) {
                   if (typeof new_args[i] == 'object' && BigNumber.isBigNumber(new_args[i])) {
                       new_args[i] = new_args[i].toNumber();
                   }
               }
            }

            if (typeof this.helpers[helper].prepare_args == 'function') {
                new_args = this.helpers[helper].prepare_args(new_args);
            }

            first_arg_type = typeof new_args[0];
            if (first_arg_type == 'object' && Array.isArray(new_args[0])) {
                first_arg_type = 'array';
            }

            /*
            // bignumber attempt - loop over args? --jayk
            if (first_arg_type == 'object' && BigNumber.isBigNumber(new_args[0])) {
                first_arg_type = 'bignumber';
                if (typeof this.helpers[helper]['bignumber'] == 'undefined' && 
                    typeof this.helpers[helper]['number'] == 'function') {
                    first_arg_type = 'number';
                    new_args[0] = new_args[0].toNumber();
                }
            }
            */

            if (typeof this.helpers[helper][first_arg_type] === 'function') {
                helper_func = this.helpers[helper][first_arg_type];
            } else if (Array.isArray(this.helpers[helper].coerce)) {
                new_args = handle_coercion(new_args, this.helpers[helper].coerce, this.helpers[helper]);
                first_arg_type = typeof new_args[0];
                if (first_arg_type == 'object' && Array.isArray(new_args[0])) {
                    first_arg_type = 'array';
                }
                if (typeof this.helpers[helper][first_arg_type] === 'function') {
                    helper_func = this.helpers[helper][first_arg_type];
                }
            }
        }
    }

    // console.log('helper:' + helper);
    // console.log('FIRST ARG: ' + first_arg_type);
    if (typeof helper_func === 'function') {
        //console.log("Function is: " + helper_func.toString());
        if (helper_func.wants_options) {
            new_args = [options].concat(new_args);
        }
        return helper_func.apply(null, new_args);
    } else {
        if (typeof this.helpers[helper] == 'object') {
            throw new Error("Unable to call '" + helper + "()' helper with type '" + first_arg_type + "' for first argument");
        } else {
            throw new Error('Attempt to call unknown helper function: ' + helper);
        }
    }
}

Expressions.prototype.get_helper_names = function() {
    return Object.keys(this.helpers);
};

Expressions.prototype.use_expression_caching = function(enabled) {
    if (enabled) {
        if (typeof this.expression_cache != 'object') {
            this.expression_cache = {};
        }
    } else {
        if (typeof this.expression_cache != 'undefined') {
            this.expression_cache = false;
        }
    }
};

Expressions.prototype.clear_expression_cache = function() {
    if (typeof this.expression_cache == 'object') {
        delete this.expression_cache;
        this.expression_cache = {};
    }
};

Expressions.prototype.discard_expressions_older_than = function(seconds) {
    if (typeof this.expression_cache == 'object') {
        var now = Date.now();
        var expire = seconds * 1000;
        var keys = Object.keys(this.expression_cache);
        //console.log("clean_expression_cache running on " + keys.length + " expressions");
        var do_clean = function do_expression_cache_clean() {
            // if the expression hasn't been used more than seconds
            // ago, we get rid of it.  We process this in 500 item chunks,
            // in case we have a lot of expressions, we don't want to hang the
            // event loop.
            for (var i = 0; i < 500; i++) {
                var key = keys.shift();
                if (key !== undefined) {
                    if (now - this.expression_cache[key].accessed > expire) {
                        //process.stdout.write('D');
                        delete this.expression_cache[key];
                    }
                } else {
                    break;
                }
            }
            if (keys.length > 0) {
                process.nextTick(do_clean);
            }
        }.bind(this);
        do_clean();
    }
};

// This walks a structure to retrieve the requested elements.
// In addition to direct keys, you can provide special strings
// that obtain multiple sub-elements.
function parseVariable(root_obj, keys) {

    var new_root = root_obj;
    var current_key; //, new_key;
    var i, ind; //, first_char;
    if (typeof keys !== 'undefined' && keys.length !== 0) {
        while( keys.length ) {
            current_key = keys.shift();

            // we are doing key lookup and we have a big number,
            // we need to convert it to a regular number;
            if (BigNumber.isBigNumber(current_key)) {
                current_key = current_key.toNumber();
            }
            if (typeof current_key == 'string') {
                if (current_key.charAt(0) == '-' && Array.isArray(new_root)) {
                    // console.log('AAWOOOOOOOOGA');
                    ind = parseInt(current_key, 10);
                    // console.log('ind is: ' + ind);
                    if (!isNaN(ind)) {
                        current_key = ind;
                    }
                }
            } else if (typeof current_key == 'number') {
                if (current_key < 0) {
                    ind = new_root.length + current_key;
                    if (ind >= 0) {
                        current_key = ind;
                    }
                }
            } else if (Array.isArray(current_key)) {
                let new_keys = current_key;
                if (current_key.length == 1) {
                    let key = current_key[0];
                    let dotpos = key.indexOf('.');
                    if (dotpos != -1 && key.charAt(dotpos-1) != '\\' && key.charAt(dotpos+1) != '.') {
                        //console.log("FOUNDADOT: " + current_key);
                        new_keys = key.split('.');
                        //console.log('newkeys: ' + new_keys.join(":"));
                    } else if ( dotpos != -1) {
                        new_keys = [ key.replace('\\','') ];
                    } else {
                        new_keys = [ key ];
                    }
                }
                current_key = new_keys.shift();
                for (i = new_keys.length - 1; i >= 0; i--) {
                    //console.log('unshifting: ' + new_keys[i]);
                    keys.unshift(new_keys[i]);
                }
            }

            if (typeof new_root == 'object' && new_root !== null) {
                new_root = new_root[current_key];
            }
            // console.log("Key-" + keys.length + ": " + current_key);
            // console.log(new_root)
            if (keys.length === 0) {
                if (new_root !== null) {
                    return new_root;
                } else {
                    return undefined;
                }
            } else if (typeof new_root != 'object') {
                return undefined;
            }
      }
    } else if (typeof new_root === 'object') {
        if (new_root !== null) {
            return new_root;
        } else {
            return undefined;
        }
    }
}

Expressions.prototype.interpret_operation = function(options, operation) {
    //console.log("interpreting operation: ", options, operation);
    // if it's not an operation, we just return it.
    if (typeof operation !== 'object') {
        return operation;
    } else if (Array.isArray(operation)){
        var res = [];
        for (i = 0; i < operation.length; i++) {
            res[i] = this.interpret_operation(options, operation[i]);
        }
        return res;
    } else {
        var new_args;
        var new_keys, i, my_data, result;

        if (operation.type == 'literal') {
            result = operation.value;
            //return operation.value;
        } else if (operation.type == 'variable') {
            // consider a key filter - allowing rewriting of keys in variables
            if (Array.isArray(operation.keys)) {
                new_keys = [].concat(operation.keys);
                for (i = 0; i < new_keys.length; i++) {
                    if (typeof new_keys[i] == 'object') {
                        new_keys[i] = this.interpret_operation(options, new_keys[i]);
                    }
                }
            }

            //console.log('Parsing keys: ', new_keys);
            //console.log('Parsing Variable: ', operation);
            //console.log('Parsing root: ', options);
            if (typeof operation.data != 'undefined') {
                my_data = operation.data;
            } else {
                my_data = options.root;
            }
            if (typeof options.keyfilter == 'function') {
                new_keys = options.keyfilter(new_keys, my_data);
            }
            if (typeof my_data == 'object') {
                result = parseVariable(my_data, new_keys);
            } else if (new_keys.length == 0) {
                result = my_data;
            }
            //return result;
        } else if (operation.type == 'operation' || operation.type == 'helper') {
            if (operation.type == 'operation') {
                if (Array.isArray(operation.args)) {
                    new_args = this.interpret_operation(options, operation.args);
                }
                //console.log('operation: ' + JSON.stringify(operation, null, '  '));

                result = this.operations[operation.op].apply(undefined, new_args);
                //return this.operations[operation.op].apply(undefined, new_args);
            } else if (operation.type == 'helper') {
                result = this.call_helper(operation.helper_name, operation.args, options);
            }
            /*
            if (typeof result == 'object' && BigNumber.isBigNumber(result)) {
                // if our result is a BigNumber, we need to convert it to an
                // regular number prior to output.
    //            return result.toNumber();
                console.log('converting to number', result, operation);
                result = result.toNumber();
            }
            */
        } else {
            result = operation;
//                return operation;
        }
/*        if (typeof result == 'object' && BigNumber.isBigNumber(result)) {
            // if our result is a BigNumber, we need to convert it to an
            // regular number prior to output.
//            return result.toNumber();
            console.log('converting to number', result, operation);
            return result.toNumber();
        } else {
            return result;    
        }
        */
        return result;
    }
}

Expressions.prototype.error_message = function(err, details) {
    var lines = details.parsed_text.split("\n");
    var parsed_text = lines[err.location.end.line-1];
    var descriptions = '';
    var pre_text;
    var start = err.location.start.column;
    if (err.location.start.line != err.location.end.line ) {
        pre_text = lines[err.location.start.line-1];
        start = err.location.end.column;
    }
    var end = err.location.end.column;
    var length = (end-start);
    if (length < 1) {
        length = 1;
    }
    var string_error = [];
    string_error.push('DTL Error: ' + err.name + " while parsing:");
    if (typeof pre_text != 'undefined') {
        string_error.push(pre_text);
    }
    string_error.push(parsed_text);
    string_error.push(new Array(start).join(' ') + new Array(1+length).join('^'));
    string_error.push(err.message);

    var new_error = new Error(string_error.join("\n"));
    new_error.found = err.found;
    new_error.expected = err.expected
    new_error.original_peg_error = err;
    // original_pegjs_error is deprecated, will be removed in 2.0.0
    new_error.original_pegjs_error = err;
    new_error.parsing = parsed_text;
    new_error.start = start;
    new_error.end = start+length;

    throw new_error;
};

Expressions.prototype.find_or_parse = function(str) {
    var now = Date.now();
    var result;
    var options = this.get_parser_options();

    if (typeof this.expression_cache == 'object' && typeof this.expression_cache[str] !== 'undefined') {
        this.expression_cache[str].accessed = now;
        return this.expression_cache[str].parsed;
    } else {
        try {
            result = dtl_expression_parser.parse(str, options);
        } catch(e) {
            console.error(e);
            this.error_message(e, { parsed_text: str });
        }
        if (typeof this.expression_cache == 'object') {
            this.expression_cache[str] = {
                parsed: result,
                accessed: now
            };
        }
        //console.log('parsed version of: ', str);
        //console.log(util.inspect(result, { depth: Infinity }));
        return result;
    }
};

Expressions.prototype.interpret_expression = function(expression, root_obj, options) {
    var expr = expression;
    //console.log("parsing:", expr);
    if (typeof expression == 'string') {
        expr = this.find_or_parse(expression);
    }
    // console.log(expr);
    if (root_obj === null) {
        root_obj = {};
    }
    if (typeof options != 'object') {
        options = {
            "root": root_obj,
            "helper_func": this.call_helper.bind(this)
        };
    } else if (typeof options.root != 'object') {
        options.root = root_obj;
    }
    if (typeof options.interpret_operation != 'function') {
        options.interpret_operation = this.interpret_operation.bind(this);
    }
    let result = this.interpret_operation(options, expr);
    return result;
};

Expressions.prototype.deep_bignumber_convert = dtl_builtins.deep_bignumber_convert;

Expressions.prototype.get_parser_options = function() {
    let options = {};

    if (this.use_bignumber) {
        options.use_bignumber = true;
        options.parseInt = parseBigNumber;
        options.parseFloat = parseBigNumber;
    } else {
        options.parseInt = parseInt;
        options.parseFloat = parseFloat;
    }

    return options;
}

Expressions.prototype.disable_bignumbers = function() {
    console.log('disabling bignumbers');
    this.operations = Object.assign({}, operations_list, simple_numbers_operations);
}

module.exports = Expressions;
