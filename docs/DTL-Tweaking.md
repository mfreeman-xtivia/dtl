# Changing the behavior of DTL

There are several options that can be provided when using DTL that allow
you to adjust the way DTL works under the hood. You can adjust these
options by providing an additional parameter to the `DTL.apply()`
call. This parameter, `options` is an object that allows you to
customize or override aspects of DTLs behavior. When using this, the
new call looks like this:

```
    DTL.apply(data, transforms, transform_name, options);
```

The options available are described below.

---

**WARNING** These options change DTLs behavior, sometimes drastically, and
can cause existing transforms to fail to function. In normal circumstances, you
won't need any of these options. If you do, you will know for sure. If you don't know
for sure, you almost certainly should be doing something else instead.

---

## Recursion depth

It is possible in DTL to create recursive transforms, transforms that call
themselves or even that call other transforms which call themselves creating
recursion loops. This can be very powerful but it also comes with some risk
as without any control it would be possible to create an infinite recursion
scenario. DTL prevents this by setting a max recursion depth. By default
this max depth is set to 50.

This limit prevents runaway recursion that could potentially crash your application.
If, however, you know in some situation that you need to recurse deeper than 50,
you can provide the `depth:` attribute in options setting the maximum recursion
depth.

```
let options = {
    depth: 100
};

DTL.apply(data, transforms, 'out', options);
```

There is no way to specify unlimited recursion, but if you need really deep recursion,
you can set the depth as high as you want.

## Debug function

In DTL, it is possible to include debugging in the transform. This is accomplished
through the use of the `@(label value)` construct. If you omit the label, the label
will be set to `debug`. This means you can wrap any value or expression with `@()`
and DTL will dutifully output the value to the console. Sometimes the console is
not sufficient. If this is the case for you, you can provide your own debug function to
be used when `@()` is encountered:

```
const logger = new winston.createLogger(myWinstonOptions);

function my_debug_function(label, val) {
    logger.debug(label + ":", JSON.stringify(val));
}

let options = {
    debug: my_debug_function
};

DTL.apply(data, transforms, 'out', options);

```

The above example would cause any debug calls to be sent via winston
(a popular node.js logging package).

## Keyfilters

There are occasions where the data you are working with doesn't match your preferred
format, or requires special handling to process correctly. That's where keyfilters
come in. A keyfilter is a function that is used whenever a variable is being looked
up in DTL. The keyfilter is given an array of the keys in the variable expression, and
is expected to return a new set of keys to use to look up the data instead. This is
best explained with an example. If you access the variable `$person.address.0.street`
the keyfilter would receive the following data:

```
[ 'person', 'address', '0', 'street' ]
```

If, for some reason, you needed to access something different, you could return a
different set of keys.  For example, this function:

```
    function my_keyfilter(keys) {

       if (keys[0] == 'person' && keys[1] == 'address' && keys[2] == '0') {
          let new_keys = [ 'person', 'backup_address' ].concat(keys.slice(3, -1));
          return new_keys;
       } else {
          return keys;
       }
    }

    let options = {
        keyfilter: my_keyfilter
    };

    DTL.apply(data, transforms, 'out', options);
```

This would cause DTL to act as though an access to `$person.address.0.street` was
written as `$person.backup_address.street` instead. Clearly this is a contrived example,
and a better solution in most cases would be to simply modify your transform.
In certain cases, especially when base structures change, a keyfilter can make
it possible to adjust the application very quickly, without rewriting all of your
existing transforms.

## Transform Extractors

Under normal circumstances, DTLs happy tags are sufficient to define your transforms. On
rare occasions you may need to change the way DTL recognizes that a field should be processed
as a DTL expression. When this is the case, you can alter how DTL makes this determination
via a `transform_extractor`. A transform extractor is run on every piece of data in a transform
object. If the data should be processed as a DTL expression, the `transform_extractor` function
should return only the DTL expression as a string. If it should not, it should return `undefined`,
which will cause DTL to treat the data as raw data and not interpret it.

If you provide a `transform_extractor` you should also provide a `transform_quoter`, which is a
function that will take a string intended to be processed as a transform, and quote it
appropriately so that your `transform_extractor` will recognize it.

Once again, this is best illustrated with an example. The following `transform_extractor` function
will replace the standard happy-tag ( `(:` and `:)` ) delimiters with `%%`.  The corresponding
`transform_quoter` is also included:

```
    let options = {};
    options.transform_extractor = function(data_item) {
        if ( typeof data_item == "string" && data_item.substring(0, 2) == '%%' &&
            data_item.substring(data_item.length-2, data_item.length) == '%%') {

            // return the string, with the '%%'s removed
            return data_item.substring(2, data_item.length-2);
        } else {
            return undefined;
        }
    }

    // quote transform_string so your extractor will recognize it as a transform
    options.transform_quoter = function(transform_string) {
        return '%% ' + transform_string + ' %%';
    }

    let result = DTL.apply(container, transform, "out", options);

```

Note that using this will cause all existing transforms to fail to function
because the `(:` and `:)` will no longer be recognized by DTL as containing DTL expressions.

Note also that of all the options discussed above, `transform_extractor`s
_change DTLs behavior **DRASTICALLY**_ and *will* make existing transforms fail to work.
Specifically, one of the benefits of DTL is that it's transforms are portable and may be
transfered / stored in databases, etc.  When you change the `transform_extractor`, you are
breaking interoperability with anything that is not using that same `transform_extractor`

**Accordingly, this functionality should only be used if you can not accomplish what you need any other way.**

