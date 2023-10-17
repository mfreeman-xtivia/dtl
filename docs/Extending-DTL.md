# Document: Extending DTL with Custom Helper Functions

Data Transformation Language (DTL) can be customized to include additional
helper functions. These helpers can then be used in any DTL transformations.
This extensibility allows you to cater to specific needs or custom requirements
in your transformations.

## Syntax and Usage

First, you need to require the DTL module:

```javascript
const DTL = require('dtl-js');
```

Next, define your helper functions. Each function should be associated with an
object that contains a `meta` field for documentation and a function
implementation:

```javascript
let my_helpers = {
    'my_func': {
        "meta": {
            "syntax": 'my_func( $string )',
            'returns': 'The result of doing something with the provided `$string`',
            "description": [
                'The `my_func()` helper does something with the',
                'string provided and returns the result.'
            ],
        },
        'string': function(str) {
            return "The string: " + str;
        }
    }
};
```

The function may take as many arguments as you like. By convention the first
argument is the main data to operate on, and the remainder should be parameters
configuring the operation. Though you can feel free to set the arguments order
in whatever way fits your usage.

Now you must add your helper functions to DTL:

```javascript
DTL.add_helpers(my_helpers);
```

Your `my_func` helper is now available for use inside DTL transforms:

```javascript
let result = DTL.apply('foo', '(: my_func($.) :)');
console.log(result); // Prints: "The string: foo"
```

## Function Types

The function selection in DTL is based on the type of the first argument passed
to the helper. DTL supports the following types: `string`, `object`, `array`,
`number`, `undefined`, and `boolean`. 

If you want a single helper to handle multiple types, you can specify multiple
types in the key string, separated by commas. For example, if you want a helper
function to handle both arrays and objects, you can use 'array,object' as the
key:

```javascript
let my_helpers = {
    'my_func': {
        /* ...meta fields... */
        'array,object': function(arg) {
            // function logic here...
        }
    }
};
```

## Multiple helper implementations

You can also provide multiple function implementations with different types for
a given helper function. This allows the helper to behave differently depending
on the type of the input argument.

```javascript
let my_helpers = {
    'helper_name': {
        "meta": {
            "syntax": 'helper_name( $argument )',
            'returns': 'What the helper returns',
            "description": [
                'Description of what the helper does'
            ],
        },
        'string': function(str) { /* function implementation */ },
        'array': function(arr) { /* function implementation */ },
        // ...
    }
};
```

In the `meta` field, provide the helper's syntax, what it returns, and a brief description.

The keys `string`, `array`, etc. represent the supported data types for the
function's first argument. For each data type you wish to support, provide a
corresponding function that defines how to handle an argument of that type.

Supported data types include: `string`, `object`, `array`, `number`,
`undefined`, `boolean`. If you want a function to handle both arrays and
objects, use `array,object` as the key. If you want your function to handle all
data types, use `'*'`.

The function associated with each data type should take in the argument(s) and
return the desired output.

If you want your helper function to be type-agnostic and handle all types with
the same logic, you can use a wildcard '*' instead of specifying a specific
type:


```javascript
let my_helpers = {
    'my_func': {
        /* ...meta fields... */
        '*': function(arg) {
            return "The argument: " + arg;
        }
    }
};
```

## Multiple Helpers

The `my_helpers` object can contain definitions for multiple helpers. Each
helper should be a key-value pair within the `my_helpers` object:

```javascript
let my_helpers = {
    'my_func': { /* helper definition */ },
    'another_func': { /* helper definition */ },
    // More helpers...
};
```

## Further Examples

For more examples of defining helper functions, you can look at the
`dtl-builtins.js` file in the DTL package.
