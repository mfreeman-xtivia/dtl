# DTL

By [Jay Kuri](https://gitlab.com/jk0ne/)

[WebSite](https://getdtl.org) | [Repository](https://gitlab.com/jk0ne/DTL) | 
[Bug Reports](https://gitlab.com/jk0ne/DTL/-/issues) | [Live Help (discord)](https://discord.gg/ECA4H3PuAE)

## What is DTL?

DTL is a library and set of CLI tools for extracting and remapping data from one format to another. It can be used in your node.js (and browser) code. It also has CLI tools for transforming data(`dtl`) and for exploring the syntax (`dtlr`).

## TL;DR

![demonstration of DTL REPL tool](https://gitlab.com/jk0ne/DTL/-/raw/master/docs/assets/dtlr-demo.gif)*DTL Repl demo* 

## What can it do?

With DTL you can: 

* Remap data from one format to another
* Do complex calculations producing new data from input data
* Easily define translations between API data formats and your database formats
* Perform bulk data transformation for ETL (extract, transform, load) processes using the command line tool `dtl`.
* Separate your data processing rules from your application code
* Create data validation rules that work both in browser and on server
* Easily extract specific information from deeply nested data structures
* Create new data from input data, including the ability to combine fields and calculate new data items
* Calculate on numeric data reliably and accurately (avoiding floating-point errors)
* Easily validate input data for APIs and form processing
* Easily verify any type of data
* Reduce code changes needed to cope with data structure changes
* Define validation rules in one place, and dynamically transfer / include them into your frontend code, simplifying frontend validation code
* And so much more...

## Why do I care?

* DTL syntax is easy to understand
* You can include DTL directly into your application
* You can use the included CLI tool for processing large amounts of data directly (supports json, json-lines, csv and yaml for both input and output)
* You can use DTL to validate / process data with the same rules in both browser and on server 
* Allows you to store data transformation rules in database or in files
* Easily create reusable translations between different data formats
* Increase your code's reliability by using DTL to verify output
* Reduce bugs by shifting data processing into an externally testable and verifiable format
* Use the DTL cli and repl tools to rapidly test data transformations


## Install

```
$ npm install -g dtl-js
```

If using `yarn`:

```
$ yarn global add dtl-js
```

## Usage

For the REPL test environment:

```
$ dtlr
```

To process data on the command line:

(Examples using [sample movie data](https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json) from [Awesome JSON Datasets](https://github.com/jdorfman/awesome-json-datasets) )

```
$ dtl -e 'length($.)' movies.json`
```

```
# get all the movies Bill Murray was in
$ dtl -e 'grep($. "(: member($item.cast `Bill Murray`) :)")' movies.json
```

```
# to output the contents of movies.json as yaml
$ dtl -o movies.yaml movies.json
``` 

```
#  Transform the `name` field in the JSON file to uppercase.
$ dtl -e '$name.toUpperCase()' data.json
```

```
# Apply the transform expression specified in the `transform.dtl` file to the CSV input file.
$ dtl -f transform.dtl input.csv
```

```
# Process `input.json`, output CSV data in `output.csv` including all fields found in input.json.
$ dtl -o output.csv input.json`
```

```
# Process `input.json`, output CSV data on stdout using the fields `first_name`, `last_name` and `primary_email` 
dtl -O csv -C first_name,last_name,primary_email input.json
```

or to see available command line options:

```
$ dtl -h
```

Or a more advanced transform in your code:

```javascript

    // pre-ES6:
    // const DTL = require('dtl-js');

    // ES6 and later:
    import DTL from "dtl-js"

    // A transform is your data template. It defines
    // how your output data will look. The 'out'
    // represents our output data:
    let transform = {
        "out": {
            "full_name": "(: &( $first_name ' ' $last_name ) :)",
            "age": "(: num( strftime('%Y' now()) ) - $birth_year :)",
            "dob": "(: &( $birth_year '-' $birth_month '-' $birth_day) :)",
            "identifier": "(: &( $location.code '_' $id ) :)",
            "group": 172,
            "importer": "automated_data_importer",
            "email_address": "(: $.primary_email :)"
        }
    };

    // this is our input data
    let person_record = {
        "first_name": "Dominique",
        "last_name": "Wilson",
        "birth_year": 1984,
        "birth_month": 11,
        "birth_day": 22,
        "id": 1821002,
        "location": {
            "code": "CO7",
            "description": "westminster south"
        },
        "primary_email": "dominiquew@example.com"
    };

    let dtl = new DTL();
    let result = dtl.apply(person_record, transform);

    console.log(JSON.stringify(result, null, 3));

    // The output data will be what you probably expected:
    // {
    //     full_name: 'Dominique Wilson',
    //     age: 36,
    //     date_of_birth: "1984-11-22",
    //     identifier: 'CO7_1821002',
    //     group: 172,
    //     importer: 'automated_data_importer',
    //     email_address: 'dominiquew@example.com'
    // }
```

## Ok... explain?

First, what's with all the ``(:`` and ``:)`` in the example above? We
call them 'happy tags.' They are how you tell DTL that it should look at
that string and process it. The information inside the ``(: :)`` is
called a DTL expression and it tells DTL what to do. Any data not
wrapped in happy tags is passed directly to the output unchanged.

As you probably guessed, you can access input data using ``$`` notation,
with ``$.`` being the entire input data. You can reach subkeys in the
input data by using dot notation, or brackets, for example:
``$first_name``, and ``$.['first_name']`` are equivalent. Likewise
``$location['code']`` and ``$location.code`` are equivalent.

Once you've defined your transform, you simply provide that transform
along with the input data to the ``DTL.apply()`` function
and it will return the new data.

More details about DTL Expressions can be found [here.](https://gitlab.com/jk0ne/DTL/-/tree/master/docs/DTL-Expressions.md) 

## How is DTL useful?

DTL is useful whenever you need to create a new piece of data using data you
already have.

In it's simplest form, DTL can be used to define templates for JSON. It can
also be used to reliably manipulate huge amounts of data, both in batch
processing and in realtime scenarios.

DTL is more than templating, however. DTL allows you to describe how to
transform one set of data into another, including whatever calculations
you might need.

DTL is great for handling input data from forms or API calls, it's fantastic
for converting between data formats, and is tailor-made for transforming
your data to and from formats used by the APIs you use.

Also, if you are into that whole ETL thing, DTL is amazing.

## Is DTL complicated to use?

No. DTL is extremely easy to use. Its syntax is familiar and we've tried to
ensure that it does what you think it will do in any given situation.

Like HTML templates, DTL lets you specify your output data format in a way
that is very close to the final output format and is very natural to read.

Since DTL's transform definitions (or transforms for short) can be specifed
as simple JSON, the templates themselves can be stored anywhere JSON can be
stored.

## DTL is easy to learn.

While DTL is *extremely* powerful, it lets you use as little or as much 
functionality as you want. You can start with simple templates, and as you 
get more familiar you can take advantage of the
more sophisticated helpers.

We've created the ``dtlr`` command line tool to make it easy to get familiar
with DTL. If you installed DTL from npm, you can run the ``dtlr`` command in
a shell and try out different DTL expressions. DTL also includes full
documentation and this can be accessed within the ``dtlr`` command line tool
by issuing the ``.help`` command. You can specify ``.help &`` for example, to
receive help on the ``&()`` concatenation function.

## Is it safe?

Unlike regular code, the output of DTL can only include the information
provided to the DTL call, so DTL transforms are much safer to use than
the code that would be required to produce the same output. They're also
a heck of a lot easier to read... AND since they are self-contained and
don't refer to your code, they are safe and easy to share.

DTL can be used within javascript code (node.js and browser, and even inside
MongoDB) or it can be used on the command line with the DTL cli tools.

## Why is it interesting?

DTL is interesting for several reasons:

 * Clarity - DTL is purpose-built for data transformation and only data
   transformation. It is not intended to be a general-purpose programming
   language and is therefore simple to learn and free of unnecessary components.

 * Portable - DTL transforms are self-contained and transferrable between
   applications. Since they can be stored as JSON, they can even be
   kept in your database.

 * Security - DTL transforms only have access to the data
   that was provided as input. DTL transforms have no system access,
   so they are much safer to use than custom code.

 * Stateless - DTL transforms have no access to previous state, only
   to the data provided and therefore avoid bugs related to bleed
   over or inadvertant modification, one of the most common sources of
   bugs.

 * Provable - It is trivial to create a DTL transform to verify the
   output of another. This obviously allows for simple test-creation.
   What may not be obvious is that these verification transforms can
   be used to check data at run-time.

 * Non-linear - DTL transforms define how to arrive at the desired
   data. They do not define a sequence of steps. This means that
   each expression is independent and not subject to bugs due to
   issues that occurred in other expressions.

 * Stable - DTL has been in use in production since 2013 and has
   been its own separate project since 2015. It is being used in
   many production applications, handling many millions of
   transformations every day.

 * DTL is a language with an implementation. The DTL module is only
   one implementation of the DTL language. The DTL module contains
   hundreds of tests that verify the language is behaving properly.
   This allows DTL to be implemented and verified in any programming
   language.

## Where did DTL come from?

Truth be told, DTL was never intended to be it's own thing.  DTL began
as an expression language inside a meta-programming engine built by [Jay
Kuri (me)](https://gitlab.com/jk0ne/) during my work at Ionzero, a
company I founded. One of the first applications of this engine was a
system built to handle linking other systems together. I created the
language out of the need for a way to define how to map data from one
system to another without resorting to hard-coded custom code.

I also realized during the course of this work that DTL could be used
for far more than I ever had originally envisioned.  As a result of this
realization, over time, I refined the DTL language and eventually
extracted it into a self-contained module that could be used in any
system and proceeded to do so.

I decided to release DTL as open source in the hopes that others would
find it as useful and as powerful as I have.


## The DTL command line tools

If you have installed the DTL package with npm, you will have two command
line tools for working with DTL. The ``dtl`` cli tool works on bulk data

If you want to just take DTL for a spin without coding you can use the
``dtlr`` tool. The ``dtlr`` cli tool is an interactive REPL (Read
Execute Print Loop) tool you can use to test out expressions and get
help.

The ``dtl`` cli tool works on bulk data and is designed to process CSV, yaml
and JSON, as well as JSONLines data.  It can produce CSV, yaml, JSON and
JSONLines data as well, regardless of whether the input data was the
same type. You can learn more about how to use it by using the
``dtl -h`` command. Note that by default it sends its output to stdout.
If you'd rather have the output go into a file, use the ``-o filename.json``
option.

## Feedback and where to get help

We are always looking for constructive feedback. If you have ideas on
how we might improve DTL, please reach out. If you are looking for
help on how to use DTL, we also want to hear from you.

For help learning DTL, the ``dtlr`` tool has help built in by
using the ``.help`` command.  You can also You can visit the
[docs](https://gitlab.com/jk0ne/DTL/-/tree/master/docs) or look at the
[DTL Expression Syntax](https://gitlab.com/jk0ne/DTL/-/blob/master/docs/DTL-Expressions.md).
You can also view all the [helper function docs here](https://gitlab.com/jk0ne/DTL/-/blob/master/docs/DTL-Helpers.md).

If you want to see examples of DTL, you can take a look at the [Test
Suite](https://gitlab.com/jk0ne/DTL/-/tree/master/src/js/test) where you can
find an example of just about anything DTL can do.

If you want something a bit more real-time, you can talk with us on the
[DTL discord](https://discord.gg/ECA4H3PuAE).

And, if you encounter a bug, please don't hesitate to file an
[Issue](https://gitlab.com/jk0ne/DTL/-/issues).

# dtl
