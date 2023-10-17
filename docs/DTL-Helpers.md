# DTL Helpers

In DTL, *helpers* provide advanced or complex functionality that
you can make use of within your transforms and DTL expressions.

Below is the reference for all available helpers in the DTL language.

*Fun fact:* the entirety of the markdown for the helper documentation 
below was generated with a DTL transform.

## DTL Helper Reference


## \#

`num($string)`

Returns: The passed string converted to a number, if possible

The num() helper, or its alias \#() takes a string as input and converts 
it to a real number. If the data passed can not be parsed as a valid number, 
num() will return undefined. If you must have a numeric value, the fne() helper 
can be used in conjunction with num() in order to ensure a valid default value. 
For example: fne(num($data.val) 0) will provide a $data.val as a number, or if it
is not present or cannot be converted, will return 0.


## &

`&( $data_item1 $data_item2 [ $data_item3 ... ] )`

Returns: The passed items concatenated together

Returns the passed items concatenated together. The type of item returned 
is determined by the first argument. If the first argument is a list, the 
remaining items will be added to the end of that list. If the first argument 
is a string, the following items will be concatenated to the end of the string, 
first being converted to strings if they are not already. 
If the first item is an object, and the additional items are also objects, 
the returned item will represent the objects merged at the top level.


## ?

`?( condition trueexpression falseexpression )`

Returns: Trueexpression if condition is true, falseexpression if condition is not true

The `?()` helper is a simple conditional operator. Given a condition, the helper
will evaluate the condition and if the result is truthy it will evaluate and 
return the `trueexpression`. If the condition result is falsy, it will evauate and 
return the `falseexpression`. 
The `?()` is one of the primary decision mechanisms in DTL.  It is important to 
understand that the `trueexpression` and `falseexpression` are not interpreted until
the condition has been evaluated. This means the `?()` can be used to execute
significantly complex logic only when needed. It can also be used to control which
of multiple transforms might be used for a given part of input data.


## @

`@( $data_item )`

Returns: Passed value

Debug, causes the value of the item to be output to the debug console. 
Has no effect on the value and simply returns what is passed unchanged. 
This is useful to see the values of something while it is being processed.


## E

`member( $list $item)`

Returns: True if $item is a member of $list

The `member()` helper examines $list\_a and returns true if $item is a member of
$list and false otherwise.
Currently only works on simple data types such as strings or numbers.


## \

`difference( $list_a $list_b)`

Returns: A new list containing the items in $list\_b that are not on $list\_a

The `difference()` helper examines $list\_a and $list\_b and returns the set difference,
or a new list containing all the items in $list\_b that are not in $list\_a.
Currently only works on simple data types such as strings or numbers.


## ^

`transform($input $transform_or_expression)`

Returns: The result of providing `$input` as `$.` to the given `$transform\_or\_expression`

The `transform()` helper executes the provided `$transform\_or\_expression` with 
the provided `$input` as `$.`. The result of the transform or expression is returned.
This is used so frequently in DTL that there are two alternate forms of this helper, 
`^($input $transform)` performs exactly the same action. Another form is expressed like
an operator: `$input -> $transform` where $transform is either a direct DTL expression 
or, more commonly, the name of a transform you wish to use. Finally, there is a shortcut 
version where only the transform is provided, such as `^('tx\_name')`. When used 
this way, the input data will be set to `$.` - This can be especially useful for 
pulling in complex data structures from the transform itself. 


## c

`subset( $list_a $list_b)`

Returns: True if $list\_b is a subset of $list\_a

The `subset()` helper examines $list\_a $list\_b and returns true if
$list\_b is a subset of $list\_a, in other words if every element of $list\_b
is also on $list\_a.
Currently only works on simple data types such as strings or numbers.


## capitalize

`capitalize( $string )`

Returns: A new string consisting of the characters in the passed string, with the first character converted to uppercase.

The `capitalize()` helper returns a new string containing the characters from the provided `$string`
with the first character converted to it's uppercase equivalent.


## chain

`chain( $data $transform_chain)`

Returns: An array of items transformed using the transform chain

Chain processes the provided data through the transform\_chain provided. 
A transform chain is simply an array of transforms. The data is provided to the first 
transform, and the output of that transform becomes the input to the next, and so on. 
This allows you to describe complex data transformations in a concise way. Even when 
the transformation requires multiple steps to complete.


## derive

`derive( $data $action_map )`

Returns: Resulting data from the $action\_map provided, or undefined if no matching rule was found.

Derive processes the provided data through the action\_map given. 
An action map is an array of transformation pairs, where the first item in the pair 
is the test to perform on the data, and the second item is a transform which returns 
the data if the test is successful. During processing of the data, the first test which 
produces a true result will be used, and no further checks will be done. See the 
wiki (or the unit tests) for more details and examples.


## diff

`difference( $list_a $list_b)`

Returns: A new list containing the items in $list\_b that are not on $list\_a

The `difference()` helper examines $list\_a and $list\_b and returns the set difference,
or a new list containing all the items in $list\_b that are not in $list\_a.
Currently only works on simple data types such as strings or numbers.


## difference

`difference( $list_a $list_b)`

Returns: A new list containing the items in $list\_b that are not on $list\_a

The `difference()` helper examines $list\_a and $list\_b and returns the set difference,
or a new list containing all the items in $list\_b that are not in $list\_a.
Currently only works on simple data types such as strings or numbers.


## empty

`empty( $data_item )`

Returns: boolean indicating whether the passed item is empty

Returns true when the passed item is empty. 
Empty means undefined, of length 0 (in the case of an array or string) 
or in the case of an object, containing no keys


## escape

`escape( $string [ $characters ] )`

Returns: The $string provided, with any occurances of special characters prefixed with a \ 

The escape() helper adds backslashes to protect any special characters found in the 
provided string. This is especially useful in subscripts when a key might have odd 
characters in it. If the $characters argument is provided, escape() will add escaping 
to those characters instead of its default list: ( ) [ ] and .


## exists

`exists( $data_item )`

Returns: boolean indicating whether the passed item is defined at all.

Returns true when the passed item is not undefined.


## explode

`explode( $string )`

Returns: An array of single characters representing the contents of the string provided

Returns the string as an array of single characters .


## extract

`extract( $input_data [ keys to extract ] )`

Returns: An array or object containing only the indexes / keys given in the extract list

The `extract()` helper retrieves the values in the $input\_data that correspond to the
keys provided.  If $input\_data is an object, returns a new object containing only the
elements indicated. If $input\_data is an array, returns a new array containing only the
items corresponding to the indexes provided in the order provided.


## first

`first( $array [ $transform ] )`

Returns: The first item in the array that matches the condition

Returns the first item in the provided array that $transform returns true for. 
The default for $transform is "(: !empty($item) :)" - so by default first() 
returns the first non-empty item in the provided array.


## flatten

`flatten( $array_or_object [ $separator ] [ $prefix ] )`

Returns: A structure representing the given nested structure flattened into a single-level structure

The `flatten()` helper takes either an array or an object. If given an array, 
the `flatten()` helper will descend into any nested arrays and return a single
array composed of all of the values found. This array is constructed in depth-first
order. 
When given an object, the `flatten()` helper creates a new object created by
descending into all sub-objects and arrays in the provided object. 
Each value found in a sub-object is added to the new object using the full 
key path encoded using dot-notation (by default, if `$separator` is provided, 
the given separator is used in place of `.` ) This creates a single layer object while
still encapsulating the original structure within the key. If provided, $prefix 
is added to the beginning of each top-level key. This process can be reversed 
for objects using the `unflatten()` helper.


## fne

`fne( $item1 $item2 $item3 ...)`

Returns: The first non-empty item in the provided arguments

The fne (First Non Empty) helper returns the first non-empty item in the provided arguments. 
This is a useful way to obtain a piece of data from one of several places.  It is 
especially useful when you would like to use a piece of provided input data, or use 
an item can be defined, but still be empty, this is much safer to use than a standard 
"if exists" type construct. The method for determining empty is exactly the same as 
the empty() helper.


## from\_base64

`from_base64( $base64string )`

Returns: The result of base64 decoding the provided `$base64string`

The `from\_base64()` helper decodes the given `$base64string` and returns the
decoded string.


## from\_json

`from_json( $json_string )`

Returns: Returns the value or object described in the json string provided

The `from\_json()` helper parses the string provided as JSON and returns the
value or object described by the JSON string


## grep

`grep( $array_or_object $search_transform [ $value_transform ] [ $extra ])`

Returns: An array containing all the items that match $search\_transform

Returns an array or object containing all the items in $array\_or\_object 
that match the $search\_transform. The $search\_transform receives each $item 
in turn and should return true or false on whether the item should be included 
in the result. By default the item is placed into the resulting array.  If, 
however, a $value\_transform is provided, the $item is provided to the $value\_transform 
and the value returned from $value\_transform is placed into the results instead. 
The $extra data, if provided, is also available in the transform as $extra.


## group

`group( $items $bucket_name_transform [ $value_transform ] )`

Returns: An object containing groups of values, grouped by the results of $bucket\_name\_transform

Returns an object containing the values provided grouped into named buckets. 
The bucket an item goes into is based on the $bucket\_name\_transform provided. 
The $bucket\_name\_transform receives each item in turn and should return the 
name of the bucket that item belongs to. The $value\_transform argument is 
optional and when provided will allow you to put a calculated value into the 
resulting group, rather than the input value.  The $value\_transform receives 
the item and should return the value to be stored.


## hash

`hash( $method $data )`

Returns: A hash of the provided data using $method

Returns a hash of the provided $data using $method. Supported methods are 
SHA1, SHA256, SHA512, and MD5. Note that by default the browser version 
only includes md5. See https://gitlab.com/jk0ne/DTL/-/issues/9 for details.


## head

`head( $array $n )`

Returns: An array containing the first $n items in the given array.

The `head()` helper returns the first $n items in the given array


## intersection

`intersection( $list_a $list_b)`

Returns: The items that are on both $list\_a and $list\_b

The `intersection()` helper examines $list\_a and $list\_b and returns the set intersection, 
or the items that appear on both lists.
Currently only works on simple data types such as strings or numbers.


## join

`join( $array $separator )`

Returns: A string containing the elements of the array joined with `$separator`.

The `join()` helper takes an array of strings and a separator and produces a new
string by appending each string in the array with a `$separator` in between each.
value.


## keys

`keys( $object )`

Returns: The keys in the $object provided

The keys() helper retrieves the keys present in the given object. If given an 
array, the indexes present will be returned.


## lc

`lc( $string )`

Returns: A new string consisting of the characters in the passed string converted to lowercase.

The `lc()` helper returns a new string containing the characters from the provided `$string`
converted to their lowercase equivalents.


## length

`length( $item )`

Returns: The length of the $item provided

The length() helper returns the length of the given item. If $item is a string 
the length in characters will be returned. If $item is an array, the number of 
items in the array will be returned. If $item is an object, the number of keys 
in the object will be returned. For all other types, 1 will be returned, with 
the exception of undefined, which has a length of 0.


## map

`map( $input_data $transform [ $extra ])`

Returns: An array containing the results of applying $transform to each $item in $input\_data.

The `map()` helper applies the given $transform to each item in $input\_data and returns the result.
The $transform argument may be an inline transform in DTL tags, such as `(: $item :)` or may be
the quoted name of another transform in the transform object currently being processed.
The transform is provided the current item, the current index from the input data, and the complete
input\_data as $item, $index and $all respectively. The $extra data, if provided, is also available
in the transform as $extra. The result of map is an array containing the result of applying the 
transform to each item in the input.


## match

`match( $string $search )`

Returns: An array of the matches within the string

The match() helper tests the provided `$string` against the provided `$search` 
regular expression. It then returns an array containing the matched portions of
the string. The first item in the array is the matching string, and the remaining
elements contain the results of any captures in the regex.  Returns an empty array
if the string did not match.


## math.E

`math.E()`

Returns: Eulers number, e, the base of natural logarithms

Returns Eulers number, e, the base of natural logarithms


## math.LN10

`math.LN10()`

Returns: The natural logarithm of 10

Returns the natural logarithm of 10.


## math.LN2

`math.LN2()`

Returns: The natural logarithm of 2

Returns the natural logarithm of 2.


## math.LOG10E

`math.LOG10E()`

Returns: The base 10 logarithm of e

Returns the base 10 logarithm of e


## math.LOG2E

`math.LOG2E()`

Returns: The base 2 logarithm of e

Returns the base 2 logarithm of e.


## math.PI

`math.PI()`

Returns: PI, the ratio of the circumference of a circle to its diameter

Returns PI, the ratio of the circumference of a circle to its diameter


## math.SQRT1\_2

`math.SQRT1_2()`

Returns: The square root of 1/2

Returns the square root of 1/2


## math.SQRT2

`math.SQRT2()`

Returns: The square root of 2

Returns the square root of 2


## math.abs

`math.abs(number)`

Returns: The absolute value of the number provided.

Returns the the absolute value of the number provided.


## math.acos

`math.acos(number)`

Returns: The inverse cosine (in radians) of the provided number

Returns The inverse cosine (in radians) of the provided number.


## math.acosh

`math.acosh(number)`

Returns: The inverse hyperbolic cosine of the provided number

Returns the inverse hyperbolic cosine of the provided number.


## math.asin

`math.asin(number)`

Returns: The inverse sine (in radians) of the provided number.

Returns the inverse sine (in radians) of the provided number.


## math.asinh

`math.asinh(number)`

Returns: The inverse hyperbolic sine of the provided number.

Returns the inverse hyperbolic sine of the provided number.


## math.atan

`math.atan(number)`

Returns: The inverse tangent (in radians) of the provided number.

Returns the inverse tangent (in radians) of the provided number.


## math.atan2

`math.atan2(x, y)`

Returns: The angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (x, y)

Returns the angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (x, y)


## math.atanh

`math.atanh(number)`

Returns: The inverse hyberbolic tangent (in radians) of the provided number.

Returns the inverse hyberbolic tangent (in radians) of the provided number.


## math.cbrt

`math.cbrt(number)`

Returns: The cube root of the provided number.

Returns the cube root of the provided number.


## math.ceil

`math.ceil(number)`

Returns: The ceiling, the smallest integer value not less than argument.

Returns the ceiling, the smallest integer value not less than argument.


## math.clz32

`math.clz32(number)`

Returns: The number of leading zero bits in the 32-bit binary representation of the provided number

Returns the number of leading zero bits in the 32-bit binary representation of the provided number.


## math.cos

`math.cos(number)`

Returns: The cosine of the provided number in radians

Returns the cosine of the provided number in radians.


## math.cosh

`math.cosh(number)`

Returns: The hyperbolic cosine of the provided number in radians

Returns the hyperbolic cosine of the provided number in radians.


## math.exp

`math.exp(number)`

Returns: The value of e raised to the power of the provided number

Returns the value of e raised to the power of the provided number


## math.expm1

`math.expm1(number)`

Returns: The value of e raised to the power of the provided number, subtracted by 1

Returns the value of e raised to the power of the provided number, subtracted by 1.


## math.floor

`math.floor(number)`

Returns: The largest integer value not greater than provided number

Returns the largest integer value not greater than provided number.


## math.fround

`math.fround(number)`

Returns: The nearest 32-bit single precision float representation of the provided number

Returns the nearest 32-bit single precision float representation of the provided number.


## math.hypot

`math.hypot(number, number...)`

Returns: The square root of the sum of the squares of the provided numbers

Returns the square root of the sum of the squares of the provided numbers.


## math.imul

`math.imul(a, b)`

Returns: The result of multiplying the provided numbers as 32 bit signed integers

Returns the result of multiplying the provided numbers as 32 bit signed integers.


## math.log

`math.log(number)`

Returns: The natural logarithm (base e) of the number provided

Returns the natural logarithm (base e) of the number provided.


## math.log10

`math.log10(number)`

Returns: The base-10 logarithm of the number provided

Returns the base-10 logarithm of the number provided.


## math.log1p

`math.log1p(number)`

Returns: The natural logarithm (base e) of 1 plus the number provided

Returns the natural logarithm (base e) of 1 plus the number provided.


## math.log2

`math.log2(number)`

Returns: The base-2 logarithm of the number provided

Returns the base-2 logarithm of the number provided.


## math.max

`math.max(array_of_numbers)`

Returns: The largest of the numbers provided

When given an array of numbers or several numbers as arguments, returns the largest of the numbers provided.


## math.min

`math.min(array_of_numbers)`

Returns: The smallest of the numbers provided

When given an array of numbers or several numbers as arguments, returns the smallest of the numbers provided.


## math.pow

`math.pow(x, y)`

Returns: The result of raising x to the power of y

Returns the result of raising x to the power of y.


## math.rand

`math.rand(max)`

Returns: A pseudo-random integer between 0 and max

Returns a pseudo-random integer between 0 and max, exclusive.


## math.random

`math.random()`

Returns: A floating-point pseudo-random number between 0 and 1

Returns a floating-point pseudo-random number between 0 and 1.


## math.round

`math.round(number)`

Returns: The value of the number provided rounded to the nearest integer

Returns the value of the number provided rounded to the nearest integer.


## math.sign

`math.sign(number)`

Returns: The value 1 if the number provided is positive, -1 if it is negative, or 0 if the number is 0

Returns the value 1 if the number provided is positive, -1 if it is negative, or 0 if the number is 0.


## math.sin

`math.sin(number)`

Returns: The sine of the provided number in radians

Returns the sine of the provided number in radians.


## math.sinh

`math.sinh(number)`

Returns: The hyperbolic sine of the provided number in radians

Returns the hyperbolic sine of the provided number in radians.


## math.sqrt

`math.sqrt(number)`

Returns: The square root of the the provided number

Returns the square root of the the provided number


## math.tan

`math.tan(number)`

Returns: The tangent of the provided number in radians

Returns the tangent of the provided number in radians.


## math.tanh

`math.tanh(number)`

Returns: The hyperbolic tangent of the provided number in radians

Returns the hyperbolic tangent of the provided number in radians.


## math.trunc

`math.trunc(number)`

Returns: The integer portion of the provided number by removing any fractional portion

Returns the integer portion of the provided number by removing any fractional portion.


## member

`member( $list $item)`

Returns: True if $item is a member of $list

The `member()` helper examines $list\_a and returns true if $item is a member of
$list and false otherwise.
Currently only works on simple data types such as strings or numbers.


## n

`intersection( $list_a $list_b)`

Returns: The items that are on both $list\_a and $list\_b

The `intersection()` helper examines $list\_a and $list\_b and returns the set intersection, 
or the items that appear on both lists.
Currently only works on simple data types such as strings or numbers.


## now

`now( $seconds_only )`

Returns: The current time in milliseconds since epoch

now() returns the current time in milliseconds since epoch.  If $seconds\_only is 
passed and is true, the return value will be seconds since epoch and any milliseconds 
will be discarded.


## num

`num($string)`

Returns: The passed string converted to a number, if possible

The num() helper, or its alias \#() takes a string as input and converts 
it to a real number. If the data passed can not be parsed as a valid number, 
num() will return undefined. If you must have a numeric value, the fne() helper 
can be used in conjunction with num() in order to ensure a valid default value. 
For example: fne(num($data.val) 0) will provide a $data.val as a number, or if it
is not present or cannot be converted, will return 0.


## pairs

`pairs( $object )`

Returns: An array of arrays containing the key/value pairs for all elements in the object provided.

The `pairs()` helper extracts the keys and values in the given object and returns 
an array of key / value pairs. These pairs can be manipulated and an object can be 
reconstructed using the `{}` object creation operator. See also `flatten()`


## random\_string

`random_string( $template [ $charmap ] )`

Returns: random string created using the mask and charmap given

The random\_string() helper produces a random set of characters based on the template 
provided. The $charmap is an object where each key is a single character, and the 
associated value is a string containing all the charcters that can be cnosen for that 
key character. Each character in the $template is looked up in the charmap and a random 
character from the charmap is chosen. The default charmap (which is used when none is provided 
provides the following values: "a": lowercase alphabetical characters, "A": uppercase 
alphabetical characters, "b": lowercase consonants, "B": uppercase consonants, 
"e": lowercase vowels, "E": uppercase consonants, "\#": Digits 0-9, "!": punctuation mark 
or ".": any printable character (ASCII set). Other languages / methods are supported by 
providing your own character map.


## reduce

`reduce( $input_data $transform [$memo])`

Returns: The result of applying $transform to each item in $input\_data.

The `reduce()` helper applies the given $transform to each item in $input\_data and returns the result.
The $transform argument may be an inline transform in DTL tags, such as `(: $item :)` or may be
the name of another transform in the transform object currently being processed.
The transform is provided the current item, the current index from the input data, and the complete
input\_data as $item, $index and $all respectively. It is also provided $memo, which is the result
of the previous transform application. The first time through, $memo will contain the value provided
to the helper as $memo (or undefined if none is provided). The result of reduce is the value returned
by the final application of the transform.


## regex

`regex( $pattern [ $flags ] )`

Returns: A regex created using the patter and flags provided.

The regex() helper creates a regular expression dynamically, allowing you to create 
a functional regular expression from input data. Regular expressions created in this 
way can be used in any location where a literal regular expression can be used.


## replace

`replace( $string $search $replacement )`

Returns: The $string provided, with occurances of $search replaced with $replacement

The replace() helper searches in $string for any occurrences of $search. The $search
can be a string or a regex. To use a regex, use slashes around the search term. If a 
string is provided, only the first occurrance of the string will be replaced. If you 
wish to replace all occurrances of a string, use the regex form, providing the `g` flag. 
For example, to replace all occurrances of `a`, use `/a/g` as the search parameter. 


## reverse

`reverse( $array_or_string )`

Returns: A new array consisting of the elements of the array or string provided in reversed order

The `reverse()` helper takes an array or string, and reverses it, returning a new array or
string with the elements in reversed order from the original.


## segment

`segment( $array [$group_size $start $end ] )`

Returns: An array of arrays, grouping $array's values into sub-arrays of length $group\_size.

The `segment()` helper breaks the array given into sub-arrays of maximum $group\_size length.
If $start and $end are provided, only the elements between $start and $end in the original
array are part of the resulting segments. Each sub-array will have at most $group\_size elements,
however, the final sub-array may have less than $group\_size elements as it will contain the remainder
of the elements if the $array is not evenly divisible by $group\_size.


## sort

`sort( $array $comparison )`

Returns: A new array containing elements from the input array sorted according to the comparison expression provided.

The `sort()` helper takes an array and sorts it according to the results of `$comparison`
which can be a DTL expression or transform. The comparison is provided an object containing
an `$a` item and a `$b` item and should evaluate to a positive value if `$a` should be sorted
after `$b`, a negative value if `$a` should be sorted before `$b` or 0 if `$a` and `$b` are
equal for the purposes of sorting. Note that the `$comparison` may be arbitrarily complex
and may compare multiple elements to arrive at the result.


## sort\_by

`sort_by( $array $extractor )`

Returns: A new array containing elements from the input array sorted according to the value returned by $extractor.

The `sort\_by()` helper takes an array and sorts it according to the results of `$extractor`
which can be a DTL expression or transform. The `$extractor` transform is given each value
from the array in turn, and should result in the value to be used when sorting the array. 
This is especially useful in sorting arrays of objects by a certain field in the object. 
The `$extractor` should simply evaluate to the value to sort by.


## split

`split( $string $regexp )`

Returns: An array containing the elements of the string split according to `$regexp`

The `split()` helper takes a string and a regular expression and uses the regular
expression to divide the string. The result is an array of substrings containing the
elements of the string separated by the `$regexp`.


## sprintf

`sprintf( $formatstring [$args...] )`

Returns: Returns a string formatted according to the format string provided

The `sprintf()` helper returns a new string formatted according to the format string
provided, using the standard conventions of the `sprintf` function from the standard
C library.


## strftime

`strftime( $time_format $time_since_epoch [ $timezone ] )`

Returns: The a string formatted version of the timestamp given

strftime() returns a string representing the provided time in the format provided in 
the $time\_format argument. The options available in $time\_format are those provided for 
in the ISO-C (and therefore POSIX) strftime function


## subset

`subset( $list_a $list_b)`

Returns: True if $list\_b is a subset of $list\_a

The `subset()` helper examines $list\_a $list\_b and returns true if
$list\_b is a subset of $list\_a, in other words if every element of $list\_b
is also on $list\_a.
Currently only works on simple data types such as strings or numbers.


## substr

`substr( $string $start $end )`

Returns: A string containing the characters of the original string beginning at `$start` offset and ending at `$end` offset.

The `substr()` helper takes an string and a start and end position and returns the
characters in the original string beginning at `$start` and ending at `$end` characters
from the beginning of the string.


## tail

`tail( $array $n )`

Returns: An array containing the the last $n items in the given array.

The `tail()` helper returns the last $n items in the given array


## to\_base64

`to_base64( $string )`

Returns: The result of base64 encoding the provided `$string`

The `to\_base64()` helper encodes the given `$string` and returns the
encoded string.


## to\_json

`to_json( $value_or_object $pretty $preserve_undefined )`

Returns: Returns a string representing the value or object provided as a JSON string.

The `to\_json()` helper encodes the provided value or object into a JSON string and
returns the string. If $pretty is true, the resulting string will be padded to be
more readable for humans. If $preserve\_undefined is true, then undefined values 
will be placed in the resulting json as null.


## tofixed

`tofixed( $number $precision )`

Returns: A new number with the given level of precision

The `tofixed()` helper returns a new number with up to $precision digits to
the right of the decimal. It should be noted that this is effectively chopping
off all digits past $precision. It does NOT guarantee you will have exactly
$precision digits after the decimal point. If you need precise formatting of
numbers as strings, use `sprintf()` instead.


## transform

`transform($input $transform_or_expression)`

Returns: The result of providing `$input` as `$.` to the given `$transform\_or\_expression`

The `transform()` helper executes the provided `$transform\_or\_expression` with 
the provided `$input` as `$.`. The result of the transform or expression is returned.
This is used so frequently in DTL that there are two alternate forms of this helper, 
`^($input $transform)` performs exactly the same action. Another form is expressed like
an operator: `$input -> $transform` where $transform is either a direct DTL expression 
or, more commonly, the name of a transform you wish to use. Finally, there is a shortcut 
version where only the transform is provided, such as `^('tx\_name')`. When used 
this way, the input data will be set to `$.` - This can be especially useful for 
pulling in complex data structures from the transform itself. 


## typeof

`typeof( $thing )`

Returns: A string containing a word describin the type of `$thing`

The `typeof()` helper takes an item of any type and returns a string indicating
what type of thing `$thing` is. Possible values are: `string`, `number`, `boolean`,
`object`, `array` and `undefined`. Note that `undefined` is not the same as empty.
For a value that consists, for example, of an empty string: `''` `typeof()` will
return `string`.  For this reason, it is best not to use typeof to check for a 
missing value, and in that case the `empty()` helper should be preferred.


## u

`union( $list_a $list_b)`

Returns: A new list containing the items from both $list\_a and $list\_b

The `union()` helper examines $list\_a and $list\_b and returns the set union, 
or a new list containing all the items from both lists. Note that a the resulting
list will have had any duplicate values removed.
Currently only works on simple data types such as strings or numbers.


## uc

`uc( $string )`

Returns: A new string consisting of the characters in the passed string converted to uppercase.

The `uc()` helper returns a new string containing the characters from the provided `$string`
converted to their uppercase equivalents.


## unflatten

`unflatten( $object [ $separator ])`

Returns: A nested structure created by interpreting the keys of `$object` as dot-notation nested keys.

The `unflatten()` helper takes an object containing a single layer of key / value pairs and 
interprets the keys using dot-notation. It creates a new object using the nested structure 
encoded in the keys. If `$separator` is provided, it is used in place of `.` for the purposes
of decoding the keys. This effectively reverses the result of calling `flatten()` on an object.


## union

`union( $list_a $list_b)`

Returns: A new list containing the items from both $list\_a and $list\_b

The `union()` helper examines $list\_a and $list\_b and returns the set union, 
or a new list containing all the items from both lists. Note that a the resulting
list will have had any duplicate values removed.
Currently only works on simple data types such as strings or numbers.


## url\_decode

`url_decode( $encoded_string )`

Returns: The results of decoding $encoded\_string using Percent Encoding.

The url\_decode() helper returns the string decoded using Percent Encoding.
Undoes url\_encode().


## url\_encode

`url_encode( $string )`

Returns: The string provided encoded using Percent Encoding.

The url\_encode() helper returns the string represented using Percent Encoding


## uuid

`uuid([ $version ] [ $name ] [ $namespace ])`

Returns: A UUID string

The `uuid()` helper returns a newly generated uuid string (v4 by default).
Version may be 1, 3, 4 or 5. If a version is provided, generate a uuid using that version.
If version 3 or 5 is provided, then a name and namespace must also be provided.


## values

`values( $object )`

Returns: An array containing the values extracted from the passed `$object`

The `values()` helper obtains the values from the given $object and returns
them in an array. If an array is provided instead of an object, the array is 
returned, as it is already a list of values. If you provide a scalar value 
(something not an array or an object) `values()` will return an array containing 
the single value passed in. Note that in all cases, there is no guaranteed 
ordering in the provided results.


## ∈

`member( $list $item)`

Returns: True if $item is a member of $list

The `member()` helper examines $list\_a and returns true if $item is a member of
$list and false otherwise.
Currently only works on simple data types such as strings or numbers.


## ∖

`difference( $list_a $list_b)`

Returns: A new list containing the items in $list\_b that are not on $list\_a

The `difference()` helper examines $list\_a and $list\_b and returns the set difference,
or a new list containing all the items in $list\_b that are not in $list\_a.
Currently only works on simple data types such as strings or numbers.


## ∩

`intersection( $list_a $list_b)`

Returns: The items that are on both $list\_a and $list\_b

The `intersection()` helper examines $list\_a and $list\_b and returns the set intersection, 
or the items that appear on both lists.
Currently only works on simple data types such as strings or numbers.


## ∪

`union( $list_a $list_b)`

Returns: A new list containing the items from both $list\_a and $list\_b

The `union()` helper examines $list\_a and $list\_b and returns the set union, 
or a new list containing all the items from both lists. Note that a the resulting
list will have had any duplicate values removed.
Currently only works on simple data types such as strings or numbers.


## ⊂

`subset( $list_a $list_b)`

Returns: True if $list\_b is a subset of $list\_a

The `subset()` helper examines $list\_a $list\_b and returns true if
$list\_b is a subset of $list\_a, in other words if every element of $list\_b
is also on $list\_a.
Currently only works on simple data types such as strings or numbers.


## ⊆

`subset( $list_a $list_b)`

Returns: True if $list\_b is a subset of $list\_a

The `subset()` helper examines $list\_a $list\_b and returns true if
$list\_b is a subset of $list\_a, in other words if every element of $list\_b
is also on $list\_a.
Currently only works on simple data types such as strings or numbers.

