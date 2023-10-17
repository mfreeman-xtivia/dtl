# Advanced DTL usage 

DTL is quite easy to begin using and in simple usage is very easy to 
understand. This simplicity is deceptive, as DTL is extremely powerful.
With familiarity with some of the more advanced features of DTL you can
do amazing things.

If you have not already, be sure to read the [README](../README.md), 
[DTL Expression Guide](./DTL-Expressions.md) and [Helper guide](./DTL-Helpers.md)

## A word about undefined and null

Often in data you will encounter undefined or `null` values. DTL itself has no
separate concept of `null`, only `undefined` and therefore considers `null` 
and `undefined` in input data to be equivalent. 

It should be noted that while DTL understands undefined values and handles them
properly, it can appear as though it doesn't because when outputting JSON, undefined
properties can disappear. This is because in Javascript the default JSON 
stringifier eliminates any object properties that are null or undefined. You can
override this by using a replacer function with the `JSON.stringify()` call.
[This page](https://muffinman.io/blog/json-stringify-removes-undefined/) describes
how to do this.

## The concept of empty

Often when programming you need to know if something has no value. In Javascript 
you have the `undefined` type and it's mutant cousin `null` to interact with. If you've
done any work in Javascript whatsoever, you have no-doubt encountered the oddities / complexities
of interacting with these two types.  If not, here's a quick refresher:

```
let val = undefined;
console.log(typeof val); // 'undefined'

val = null;
console.log(typeof val); // 'object' wtf?

Object.keys(val);  // throws an exception :( 
```

Both `undefined` and `null` are ways of indicating that a variable has no value, but as you
can see, in Javascript they behave very differently.  To make matters worse, JSON only understands
`null` and not `undefined` which can make data handling very ugly.

DTL avoids this problem using the concept of `empty`. In DTL, an item is `empty` if it has 
no meaningful value. A variable that is `undefined` is empty.  Likewise an empty string `''` is
empty. An array that has no elements is empty, as is an object with no properties.  

It is possible in DTL to determine the type of a value, by using the `typeof()` helper, but in almost
every situation, using the concept of `empty` is preferable.

You can determine if a value is empty using the `empty()` helper.  Once again, an example is helpful:

```
empty(undefined) // true
empty('') // true
empty(' ') // false - contains a space
empty([]) // true
empty({}) // true
```

Why is this useful? Because in almost every situation, what you really want to know about 
the data isn't whether it has a value of `undefined` or similar, it's whether it has a 
meaningful value. `empty()` tells you whether it has a meaningful value or not in all situations.

For example, if an object is `empty()` there may be no need to process it. Likewise for an array. 
If you need some data, and the place you are looking for it is `empty()`, you will need to look
elsewhere. So making use of `empty()` can make your transforms much simpler than the equivalent
code.  

Related to the `empty()` helper is the *First Not Empty*, or `fne()` helper.  As it's name implies
when you give `fne()` multiple values, it will return the first one that is not empty. This can
be especially useful for getting a value from one of multiple places, or falling back to a 
default. For example:

```
fne($user.nickname $user.first_name 'User')
```

will try to obtain a value from `$user.nickname`. If that has a non-empty value it will be 
returned. If, however, it is empty, it will look in `$user.first_name` and if that is also empty, 
will return the string 'User'.  Note that because of the concept of `empty()`, you don't need to
concern yourself with checking whether `$user.nickname` is `undefined` or `null` or an empty string. 
In most cases, for the purposes of transforming data, they are all equivalently `empty()`

As you can see, `fne()` makes it easy to do multiple fallback lookups and set default values.

As mentioned, if you really need to know, you can use `typeof()` to determine whether something
is actually `string` or `undefined`.  You can also use `==` to check its actual value, for example:

```
$v == '' // true if $v is an empty string, false if $v is undefined
```

But in most cases, we have found that we mostly just want to know if a value is `empty()` or not.

### Comments 

When creating transforms, it can be helpful to add comments. DTL understands two types of comments in
an expression. If you are familiar with C, Javascript, or other languages with a C-derived syntax, these
will be familiar to you.  

```
/* Find what we call them */ fne($user.nickname $user.first_name 'User')

empty($user.nickname) // Does user have a nickname defined?
```

As you expect, `/* ... */` can be placed anywhere in an expression, and the
`// ...`  marks everything until the end of the line as a comment.  


### A word about whitespace 

DTL expressions are fairly straightforward and do not require much extra punctuation. 
DTL understands that within an array context `[ ... ]` for example, that each item separated
by whitespace is an additional element, so commas are unnecessary. Likewise, no special 
termination character is required to signal the end of an expression, etc. They simply end
at the end of the expression.

DTL treats spaces, tabs and newlines as whitespace and all are equivalent. This means that
you can create complex transforms using multiple lines and indenting for clarity.

This can be hard to see when transforms are encoded using JSON because JSON does not support
multi-line strings directly, but JSON is only one way of encoding transforms. If you encode 
your transforms some other way, such as YAML or [JSON5](https://json5.org), or extract 
them directly from a database newlines and indentation can be quite helpful and 
DTL will happily let you indent and newline your expressions however you see fit.

### More to come
