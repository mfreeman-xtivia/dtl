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
const Expressions = require("./DTL-expressions.js");

function DTL(provided_config) {
    this.config = initialize_config(provided_config);
    this.debug_function = this.config.debug;
    if (typeof this.config.expression_parser == 'function') {
        // if we were explicitly given an expression parser use it
        this.expression_parser = this.config.expression_parser;
    } else {
        // If we didn't get an expression parser, make one.
        // Config of the expression parser is similar but not 
        // identical to the main DTL config. Set the options
        // appropriately
        let options = {
            use_bignumber: this.config.use_bignumber,
        };
        // if expression caching is turned off, pass that down
        if (this.config.use_expression_caching != true) {
            options.expression_cache = false
        }
        this.expression_parser = new Expressions(options);
    }
}

function initialize_config(provided_config) {
    let default_config = {
        use_bignumber: true,
        return_bignumbers: false,
        use_expression_caching: true,
        debug: console.log.bind(console),
        depth: 50,
        keyfilter: undefined,
        transform_extractor: extract_transform,
        transform_quoter: quote_transform
    };
    return Object.assign({}, default_config, provided_config);
}

// create options object for walking the transform
// based on the given DTL config
function create_options_from_config(config) {
    let options = {
        use_bignumber: config.use_bignumber,
        return_bignumbers: config.return_bignumbers,
        use_expression_caching: config.use_expression_caching,
        debug: config.debug,
        depth: config.depth,
        keyfilter: config.keyfilter,
        transform_extractor: config.transform_extractor,
        transform_quoter: config.transform_quoter
    };
    return options;
}

function walk_transform(input_data, transform, options) {
    var result, keys, i, found_transform;
    if (typeof transform != 'object') {
        // if this test is true, we have a string to parse with a DTL expression in it.
        found_transform = options.transform_extractor(transform);
        if ( typeof found_transform == "string" ) {
            result = options.expression_parser.interpret_expression(found_transform, input_data, options);
        } else {
            result = transform;
        }
        return result;
    } else {
        if (Array.isArray(transform)) {
            result = [];
            for (i = 0; i < transform.length; i++) {
                result[i] = walk_transform(input_data, transform[i], options);
            }
        } else {
            if (transform != null) {
                result = {};
                keys = Object.keys(transform);
                // When walking an object, we process the values, but not the keys,
                // this is intentional, as manipulating the keys can lead to unexpected
                // consequences. Using pairs and the object constructor gives you an 
                // explicit way of accomplishing dynamic keys, if you want that.
                for (i = 0; i < keys.length; i++) {
                    if (Object.prototype.hasOwnProperty.call(transform,keys[i])) {
                        result[keys[i]] = walk_transform(input_data, transform[keys[i]], options);
                    }
                }
            } else {
                return transform;
            }
        }
        return result;
    }
}

function extract_transform(transform) {
    var new_transform = undefined;
    if ( typeof transform == "string" && transform.substring(0, 2) == '(:' &&
        transform.substring(transform.length-2, transform.length) == ':)') {
            new_transform = transform.substring(2, transform.length-2);
    }
    return new_transform;
}

function quote_transform(transform_string) {
    return "(: " + transform_string + " :)"
}

// singleton instance if apply_transform is called repeatedly as a class method
var dtl_default_instance = null;

DTL.prototype.apply = function(input_data, transforms, transform_name, provided_options) {
    var actual_transform;


    let options = create_options_from_config(this.config);
    options.expression_parser = this.expression_parser;
    options.input_data = input_data;
    options.transformer = this.apply_transform.bind(this);
    options.transforms = transforms;

    if (typeof provided_options == 'number') {
        provided_options = { depth: provided_options };
    }
    if (typeof provided_options == 'object') {
        if (typeof provided_options.debug == 'function') {
            options.debug = provided_options.debug;
        }
        if (typeof provided_options.return_bignumbers != 'undefined') {
            options.return_bignumbers = provided_options.return_bignumbers;
        }
        if (typeof provided_options.expression_parser == 'function') {
            options.expression_parser = provided_options.expression_parser;
        }
        if (typeof provided_options.keyfilter == 'function') {
            options.keyfilter = provided_options.keyfilter;
        }
        if (typeof provided_options.transform_extractor == 'function') {
            options.transform_extractor = provided_options.transform_extractor;
        }
        if (typeof provided_options.transform_quoter == 'function') {
            options.transform_quoter = provided_options.transform_quoter;
        }
        if (typeof provided_options.depth == 'number') {
            options.depth = provided_options.depth;
        }
    }
    if (typeof options.depth != 'number') {
        options.depth = 50;
    } else if (options.depth === 0) {
        throw new Error('Maximum nested transform depth exceeded');
    }
    options.depth--;

    // if we only got a string and no transforms, create a transforms 
    // object with 'out' set to our string.
    if (typeof transforms == 'string' && typeof transform_name == 'undefined') {
        transform_name = "$out",
        transforms = { "out": transforms };
        options.transforms = transforms;
    }

    let found_transform = options.transform_extractor(transform_name);
    if (typeof found_transform == 'string') {
        // the transform_name contains a transform literal string, not the name of a transform.
        actual_transform = transform_name;
    } else if(typeof transforms == 'object' && typeof transform_name == 'undefined' && typeof transforms.out == 'undefined') {
        // if transform name is undefined, and there is no transforms['out']
        // then they probably gave us a one-off transform.
        transform_name = "$out";
        actual_transform = transforms;
    } else {
        if (typeof transform_name == 'undefined') {
            transform_name = '$out';
        } else {
            // just in case they gave us a raw string and not a DTL variable
            if (transform_name.charAt(0) != '$') {
                transform_name = '$' + transform_name;
            }
        }
        // get the transform out of the transforms object using the string
        actual_transform = options.expression_parser.interpret_expression(transform_name, transforms);
    }
    // at this point, we have a transform to work with.
    // so we walk the transform object filling in values as we go.
    var results = walk_transform(options.input_data, actual_transform, options);
    if (!options.return_bignumbers) {
//        console.log(options);
        return options.expression_parser.deep_bignumber_convert(false, results);
    } else {
        return results;
    }
}

DTL.prototype.apply_transform = DTL.prototype.apply;

// allow expression caching to be enabled or disabled after initialization;
DTL.prototype.use_expression_caching = function(enabled) {
    this.config.use_expression_caching = !!enabled;
    this.expression_parser.use_expression_caching(this.config.use_expression_caching);
};

DTL.prototype.clear_expression_cache = function() {
    this.expression_parser.clear_expression_cache();
};

DTL.prototype.discard_expressions_older_than = function(seconds) {
    this.expression_parser.discard_expressions_older_than(seconds);
};

DTL.prototype.add_helpers = function(helpers){
    this.expression_parser.add_helpers_from_object(helpers);
};

DTL.prototype.set_debug_function = function(func) {
    this.config.debug = func;
    this.debug_function = this.config.debug;
};

/**************************************************************************
 * These are NOT attached to the DTL instance when it's created, they are *
 * on the main DTL package, for backward compatibility with pre-5.0 DTL.  *
 **************************************************************************/
DTL.apply = function(input_data, transforms, transform_name, provided_options) {
    // if we are called as a function on the main DTL package, we need to create
    // a new DTL instance to use.
    return DTL.default_instance().apply_transform(input_data, transforms, transform_name, provided_options);
}

// this initializes the default instance if it
// hasn't already been done.
DTL.default_instance = function initialize_default_instance() {
    if (!dtl_default_instance) {
        dtl_default_instance = new DTL();
    }
    // we've initialized now, make DTL.default_instance() just return it 
    DTL.default_instance = function() { return dtl_default_instance; }

    return dtl_default_instance;
}

DTL.apply_transform = DTL.apply;

// these will blow up if you call them and no default instance exists yet.
// This is intentional.
DTL.use_expression_caching = function(cache_enabled) {
    DTL.default_instance().use_expression_caching(cache_enabled);
};

DTL.clear_expression_cache = function() {
    DTL.default_instance().clear_expression_cache();
};

DTL.discard_expressions_older_than = function(seconds) {
    DTL.default_instance().discard_expressions_older_than(seconds);
};

DTL.add_helpers = function(helpers){
    DTL.default_instance().add_helpers_from_object(helpers);
};

DTL.set_debug_function = function(func) {
    DTL.default_instance().set_debug_function(func);
};

module.exports = DTL;
