# DTL Expression Syntax

DTL expressions are at the core of using DTL. In its simplest form, a DTL
expression is a series of characters that tell DTL how to produce the data
you want. 

DTL expressions are similar to statements in other languages in that they
express simple concepts and usually only a single line of text.

## A Word on General Syntax and Punctuation

In designing DTL, we tried to avoid ambiguity. This means that we try to
make every character have one and only one meaning, and very rarely does the
same character or set of characters mean something different in two
different situations. We tried to make sure that there was only ever one way
to interpret a given expression, and where possible a clear and unambiguous
way to express any concept. 

DTL does not use commas to separate items, nor does it have any kind of
line-ending concept. Expressions can be grouped via parenthesis, but there
is no need for a DTL expression to span only a single line. Newlines are
treated like any other whitespace. DTL expressions are delimited mainly by
whatever encoding method you are using, usually json, in the method that 
encoding requires.

# TL;DR;

DTL expressions are like statements in other languages.  They have a
familiar syntax. Below is some input data, some expressions, and what
they will evaluate as. This should give you a pretty good idea of how
to use DTL expressions.  Come back and read the rest of the doc if you get
stuck.

    // input data in JSON format
    {
       "numbers": [ 5, 7, 9, 12, 29 ],
       "person": {
            "name": "Dale",
            "age": 35,
            "location": "Philidelphia",
            "colors": [ "red", "purple", "blue"],
            "description": ""
       },
       "odd_number": 5,
       "some_words": "a bucket of fish"
    }


    // DTL Expression examples

    4 + 3               // 7
    4 - 3               // 1
    3 * 4               // 12
    12 / 2              // 6
    4 * (2 + 2)         // result: 16
    (1 + 27) / 2        // result: 14
    
    2 == 1              // false
    2 > 1               // true
    2 < 1               // false
    $odd_number <= 3    // false
    $odd_number >= 5    // true
    'john' != 'bob'     // true
    
    $numbers[0]         // 5
    $numbers[3]         // 12
    $numbers.2          // 9
    $numbers.4          // 29
       
    $person.name        // "Dale"
    $person['age']      // 35
    $person.colors[0]   // "red"
    
    $odd_number * 2     // 10
    
    'Hello ' & $person.name          // "Hello Dale"
    
    $person.name & person.colors[1]  // "Dalepurple"

    // create an array
    [ $person.name $person.age ]     // result: [ "Dale", 35 ]
    
    // create an object:
    { [ 'firstname' $person.name ] [ 'year' (2020 - $age) ] }   // result: { "firstname": "Dale", "year": 1985 }
    
    // use a helper function
    length($person.name)        // result: 4

    // use 'first not empty' helper function
    fne($person.location 'Location unknown')            // "Philidelphia"
    fne($person.description 'No Description Provided')  // "No Description Provided"

    // concatenate two arrays
    &( $numbers $person.colors )   // result: [ 5, 7, 9, 12, 29, 'red', 'purple', 'blue' ]

That should give you a pretty good idea of how to use DTL expressions.
Continue to the document below to gain a more complete understanding of
expressions.

# Simple Expressions

## Value Substitution

Almost every DTL expression you write will make use of input data. This
input data can be very simple, such as a single string, or very complex,
such as a 10000 item array of objects. Regardless of how simple or complex
the input data is, DTL provides a simple way to access it. 

In order to access input data, you can use the ``$.`` expression. Whenever
DTL finds this expression, it will replace it with the input data. Often, 
however, you will want to access only a portion, or sub-element in the input
data. This is accomplished using *dot notation*. If you have done any work
in other languages, this notation will be familiar to you. For those new to
the concept, it simply means to access a sub-elements of an piece of data,
you use a ``.`` followed by the name of the element you want to access. For
example, given the following data (in json format):

    { 
        first_name: "dominique",
        last_name: "wilson",
        dob: {
            year: 1984,
            month: 11,
            day: 24
        },
        id: 1821002,
        location_code: "co7",
        primary_email: "dominiquew@example.com" 
    }

You can access the ``first_name`` element by using the ``$first_name``
expression. You can chain them together to access deeper elements, for
example ``$dob.year`` would access the ``year`` element of the ``dob`` 
object, and would yield ``1984`` as the value. You can also use bracket
notation to accomplish the same thing, for example ``$dob['year']`` is
equivalent to our ``$dob.year`` expression above. 

### Bracket Notation

Why do we have two ways to describe the same thing? The main reason is
dynamic access to data. Often you will need to use some data to 
choose what part of other data you will need to access. For example, if you
are trying to extract some element of a list of items, you might store the
name of the element you want, say ``primary_email`` in one part of the
input, and the data to search in in another. For example:

    {
        extract_field: "primary_email".
        source_data: { 
            first_name: "dominique",
            last_name: "wilson",
            dob: {
                year: 1984,
                month: 11,
                day: 24
            },
            id: 1821002,
            location_code: "co7",
            primary_email: "dominiquew@example.com" 
        }
    }
             
You could access the data you are looking for using *bracket notation.*
to do this, simply place the field containing the element you want in 
square brackets:

    $source_data[$extract_field] 

In this case, ``$extract_field`` evaluates to the value ``primary_email``
which makes the above equivalent to:

    $source_data['primary_email'] 

This would provide the value ``dominiquew@example.com``. Again, if you 
have worked in other languages, this will be familiar to you. 

Another place where bracket notation is useful is in arrays. Accessing
numeric sub-elements looks far more natural to many people in bracket
notation. For example, given the input data:

    {
        animals: [
            'albatross',
            'baboon',
            'cat',
            'duck',
            'elephant',
            ...
        ]
    }

You can access the third element in the ``$animals`` array using the
expression ``$animals[2]`` (like most other languages, array indexes in DTL
start at 0) 

It is important to note that ``$animals.2`` is also a completely valid
way to access that same value. It tends to not be used very often, however,
for two reasons. First, using bracket notation for arrays is familiar from 
other languages, where dot notation for array element access does not work
in those languages. Second, it is somewhat rare to access individual
elements directly with a hard-coded number. It is far more common to either
iterate over an array (which we will get to later) or use another expression
to select the specific element you want, for example
``$animals[$animal_i_want]`` 

#### Combining Dot and Bracket Notation

You can arbitrarily combine dot and bracket notation in DTL. The following
expressions are equivalent:

    $source_data.primary_email
    $source_data['primary_email']
    $.source_data.primary_email
    $.['source_data']['primary_email']
    $.['source_data'].primary_email

While you will almost always see the first version, the rest are equally
valid. They exist mainly for dynamic access using elements of the input
data, or transform parameters (again, which we will explore later.) 
Some examples of this dynamic access might be:

    $source_data[$extract_field]
    $.source_data[$extract_field]
    $.[$bucket_to_search].primary_email
    $.[$bucket_to_search][$extract_field]

#### What the Heck is ``$.`` ? 

Ok. Hold on, what's this ``$.`` business? Recall that the ``$.`` expression
represents the entirety of the input data. As this data is often an object
you can access sub-elements like any other object, so you can use dot
notation or bracket notation to access it's elements. When using dot
notation with ``$.`` you do not need a second dot. An example will help
here. The following all access the same data:

    $source_data
    $.source_data
    $.['source_data']

#### A Word About Variables

So aren't those expressions just variables then? The short answer is no. The
long answer is... It's complicated. 

If it helps to think of expressions such as ``$source_data.primary_email``
as accessing variables, by all means do so. The truth is, however, that they
are not variables in the true sense because values in DTL do not vary.
meaning once an expression has been given its input data, the same
expression will **always** produce the same result. 

There is no way, in DTL, to change the input data once it is being
processed. You can, and often do, re-use an expression with different
input data, but within the scope of a given expression, you can never
have the same value expression produce a different value.

This is by design and is because DTL is strictly functional in its 
processing. All expressions are provided with input data, and that data
cannot be changed while the expression is being evaluated. All expressions
produce a result value, which can be returned to whatever called the
expression. 

There are very specific advantages to this approach, which we will cover 
elsewhere. For now however, suffice it to say that no, they aren't variables 
in the real sense of the word, but you can call them that if it's easier.

# Operations

DTL would not be of much use if all you could do is return bits of data you
already have, unchanged. 

DTL's real strength is in allowing you to write, essentially, formulas for
data. But in order to write a formula, we need to be able to express 
what we want to do with that data. This comes in the form of *operations* and
*operators*.

An operator performs some action on one or more peices of data. Simple
operators that should already be familiar are the basic mathematical
operators: ``+`` ``-`` ``*`` and ``/``. These operate on numerical data and
do exactly what you expect them to:

    1 + 1     // result: 2  
    3 - 2     // result: 1
    27 / 3    // result: 9
    4 * 2     // result: 8

Operators can be used with with value expressions also:

    $one + 1  
    $total / $num_items

Operators are not limited to mathematical operations. There are many
operators that operate on other types of data, for example, to concatenate
strings together, you can use the ``&`` operator:

    'hello ' & $first_name

Further, operators can often be strung together:

    'good ' & $morning_or_afternoon & ' ' & $first_name

In most cases, operators are processed from left to right, though
standard mathematical order of operations is respected: 

    3 * 2 + 2    // result: 8
    1 + 27 / 3   // result: 10

When in doubt, however, it is a good idea to use parenthesis to group
operations explicitly:

    4 * (2 + 2)   // result: 16
    (1 + 27) / 2  // result: 14

Parenthesis are used only for grouping and have no other effect. The
following are equivalent:

    (4) + 2
    4 + 2
    4 + (2)
    (4 + 2) 
    (((4) + (2)))

## List of Operators

There are a only 23 basic operators in DTL. There is a complete reference
available [elsewhere](/notyet), but for the moment, what follows is a list
of the operators available. 

### Numeric Operators:

     +    // addition
     -    // subtraction
     *    // multiplication
     /    // division
     ^    // raise to a power
     %    // calculate remainder

### Logical Operators

These return true or false depending on the input provided:

     !    // not
     &&   // and
     ||   // or
     ==   // equal
     !=   // not equal
     <    // less than
     <=   // less than or equal to
     >    // greater than
     >=   // greater than or equal to

### Additional Comparison Operators:

     =~   // regex comparison: $string =~ regex  (regex are specified as /pattern/flags)
     <=>  // spaceship - compare and return 1 if left > right, -1 if left < right and 0 if they are equal
     
### Structured Data Operators:

These require a bit of extra explanation. Sometimes you need to create 
structured data in your expressions. These operators allow you to do this. 

     []   // array operator, [ 'one' 'two' 'three'] becomes an array 
     :    // pair operator, ( 'left' : 'right' ) becomes [ 'left' 'right' ] 
     {}   // object operator, turns one or more pairs into an object 

Arrays are fairly self explanatory:

     [ 1 2 73 19 ]  

The above creates an array containing the items within the brackets.

Creating objects is similarly straightforward. Objects are created from
pairs of data items. A pair is simply a 2 element array where the first
item is the key, and the second item is the value. Pairs can be easily
turned into an object by wrapping the pairs in curly braces ``{}``. For
example:

     { [ 'name' 'dale' ] } 

Produces an object with a single attribute ``name`` which has the value
``dale``. You can include multiple pairs as well:

     { [ 'name' 'dale' ] [ 'age' 35 ] }

Produces an object with two attributes, ``name`` which has the value
``dale`` and ``age`` which has the value ``35``.

This can be extended to as many items as you like. It is also possible
to place an array of name/value pairs in between ``{}`` to create more 
complex objects. For example, assuming that your input was:

    { 
        pairs: [
                  [ 'name', 'dale' ],
                  [ 'age', 35 ]
               ]
    }

You could create an object with the following expression:

    { $pairs }

The above would result in the same object we got above with two attributes,
``name``: ``dale`` and ``age``: ``35``.

# Helper functions

While most data manipulation can be done with plain DTL expressions (and
more complex transforms, which we cover elsewhere) there are certain 
very common problems or activities that have very standard solutions. DTL
has a number of these integrated into it in the form of helper functions, or
simply helpers. 

Helpers are used to provide a shortcut to either advanced DTL language
features or common functionality to make that functionality able to be
expressed clearly and succinctly. Helpers are used in DTL expressions.
helpers usually take one or more arguments, and evaluate to a value. Most
helpers are of the form:

    helpername($input_data $argument1 $argument2 ...)

Note that arguments are simply separated by whitespace. No commas or other
punctuation is required.

Understanding how to use helpers is probably learned through example. As such,
some examples of helpers follow. 

    length($word)  // returns the length in characters of $word
    length($list)  // returns the number of items in $list

As you can see from above, some helpers work with multiple input data types. 
Another example of this is the ``&()`` (concatenate) helper. For example:

    &($string1 $string2 $string3) 

Returns a string consisting of the three strings concatenated together.
(note that they are concatenated directly together, without any spaces or
other characters in between.)

    &($list1 $list2)

In this example, the ``&()`` helper returns a list consisting of the two
provided lists concatenated together. In all cases the ``&()`` helper takes
an arbitrary number of arguments.

    &($object1 $object2)

This returns a new object consisting of the two provided objects merged 
together. Note that this is a top-level merge where any duplicate
properties are overwritten by the last object in the argument list
containing the duplicate property.

Another useful helper is ``fne()``. ``fne()`` stands for *First Not Empty*.
The ``fne()`` is often used to select a value from potentially several
sources in order. For example:

    fne($person.username $person.firstname 'UnknownUser') 

Would return the value of ``$person.username`` if it was defined (and not an
empty string.) However, if ``$person.username`` was undefined or empty, it
would instead return ``$person.firstname``. If that too was empty, it would
instead return ``UnknownUser``. This is a convenient way to also set up 
default values.

There is a complete reference to all provided helpers [here](DTL-Helpers.md) 
and within the DTL repl tool, ``dtlr``.

# Embedded expressions 

It is often helpful to make use of DTL expressions within another DTL
expression. Many helpers, for example, take individual DTL expressions as
parameters, in order to assist or extend their capabilities. 

When you need to embed an expression in another expression, you 
create a string that begins with ``(:`` and ends with ``:)`` with
your expression in between. The ``(:`` and ``:)`` are commonly referred to
as *happy tags* and indicate to DTL that the string is intended to be
processed as an expression. Note that embedded expressions are only
treated as expressions in certain instances, where DTL is looking for 
an expression.

A good example is the ``grep()`` helper. The ``grep()`` helper takes a
list of items, and a test expression as parameters. It then searches 
through the list and returns a new list consisting of all the
items where the expression returns true. For example:

    grep($number_list '(: $item > 5 :)')

The above returns a list of all the entries in ``$number_list`` that 
have a value greater than 5. 

Expressions are embedded in this way fairly often, as this allows
you to customize the behavior of a specific helper.

## A word about iterations

Many helpers in DTL will iterate over a set of items, applying an 
expression (or transform) repeatedly to each item in turn. When this
is being done, the input data for the expression has a specific structure.

The input data for iteration expressions is of the form:

    {
        item: ... // current item being processed
        index: 0,  // current index in originally provided list
        all: ...  // original list provided
    }

The ``$item`` element will always be the current value being processed
during the current iteration. The ``$index`` will be the index in the
original list of the item we are currently working on. If the original data
was an array, this will be the numeric index of tie current item. In cases
where the original data was an object, ``$index`` will be the key currently
being operated on. Finally the ``$all`` element is the entirety of the 
original list or object provided. 

In most cases, you will simply operate on the ``$item`` element, but on
occasion, this additional information is helpful. For example, to extract
every other item from a list, you can use ``grep()`` like this:

    grep($list '(: ($index % 2) == 0 :)' )

The expression provided to grep above returns true only for those items whose 
index is even. 

All iterating helpers in DTL use this format, although some will have
additional elements specific to that helper. When additional elements are
provided, they will be documented in the helper function help.


