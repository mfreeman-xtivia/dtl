const Transformer_examples = [
    {
        "name": "Your custom entry",
        "description": "Enter your own input data and transform below and try DTL out.",
        "dont_override_input": true,
        "input_data": { 
            "greeting": "Hello",
            "recipient": "World"
        },
        "transform": "(: $greeting & ' ' & $recipient :)"
    },
    {
        "name": "The simplest transform",
        "description": "The simplest transform, produces the input data, unchanged.",
        "input_data": { 
            "greeting": "Hello",
            "recipient": "World"
        },
        "transform": "(: $. :)"
    },
    {
        "name": "Transform in full transform dictionary format",
        "description": "A simple transform in full transform dictionary format. The transform object can contain multiple named transforms, which can be called within the main transform using the `($input -> transform_name)` syntax.  The provided input becomes `$.` in the called transform. By default, when you call `DTL->apply()` the `out` transform is used. You can also call a specific transform in the transform object directly by specifying the transform name as a third in the `DTL->apply()` function call in your javascript.",
        "input_data": { 
            "greeting": "Hello",
            "recipient": "World"
        },
        "transform": {
             "out": "(: join(values($.) ' ') -> reverse_it :)",
             "reverse_it": "(: reverse($.) :)"
        }
    },
    {
        "name": "A transform in object format - JSON Templates",
        "description": "Transforms don't have to be strings, they can be objects or arrays as well. If a transform object is provided, the values will be evaluated and the completed object will be returned. One use of this format is to create JSON templates with complex calculation capabilities. ",
        "input_data": { 
            "name": "William",
            "favorite_color": "purple",
            "pet": "cat"
        },
        "transform": {
            "keys": "(: keys($.) :)",
            "values": "(: values($.) :)",
            "a_nice_hard_coded_val": "a very fine horse",
            "num_keys": "(: length(keys($.)) :)",
        }
    },
    {
        "name": "Remap user data - JSON Template style",
        "description": "Use an object for a transform, allowing you to remap data from one format to another. Very useful when translating from user input to db format, or from one API data format to another. This example includes static data as well as simple and complex data remapping.",
        "input_data": {
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
        },
        "transform": {
            "name": {
                "first": "(: $first_name :)",
                "last": "(: $last_name :)",
                "full": "(: &( $first_name ' ' $last_name ) :)"
            },
            "email_address": "(: $primary_email :)",
            "group": 172,
            "importer": "automated_data_importer",
            "age": "(: num( strftime('%Y' now()) ) - $birth_year :)",
            "dob": "(: &( $birth_year '-' $birth_month '-' $birth_day) :)",
            "identifier": "(: &( $location.code '_' $id ) :)"
        }
    },
    {
        "name": "Validate user data",
        "description": "Runs a set of validations against user data, for any `validation` that returns false, returns the field object containing the field and the error message, allowing you to place the error message next to the appropriate field. This same validation can be used for both the frontend and backend, allowing a single set of validation parameters to be kept in the code.",

        "input_data": {
            "username": "bob",
            "password": "bob123",
            "password2": "bob123!",
            "phone": "555-867-5309"
        },
        "transform": {
            "out": "(: grep($. -> validate '(: $item.validation != true :)' ) :)",
            "validate": 
            [
                {
                    "field": "username",
                    "validation": "(: length($username) > 5 :)",
                    "error_msg": "Username must be at least 6 characters long"
                },
                {
                    "field": "username",
                    "validation": "(: $username =~ /^[a-z_0-9]+$/ :)",
                    "error_msg": "Username must only contain lower case letters, numbers or an underscore"
                },
                {
                    "field": "password",
                    "validation": "(: $password =~ /[!@#$%^&*()<>]/ :)",
                    "error_msg": "Password must contain a special character"
                },
                {
                    "field": "password",
                    "validation": "(: $password == $password2 :)",
                    "error_msg": "Password do not match"
                },
                {
                    "field": "phone",
                    "validation": "(: $phone =~ /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/ :)",
                    "error_msg": "Phone must be in format ###-###-####"
                }
            ]
        }
    },
    {
        "name": "Transform dictionaries - reusing transforms",
        "description": "A few different variations of using and reusing transforms. The first argument of the transform (or -> shortcut) function becomes `$.` within the transform. The second argument is the transform to run. This corresponds to a key in the transform object.  This allows transforms to be reused in multiple places. You can also feed the result of one transform into another, as shown in the `num_rounded_is_big` and `num2_rounded_is_big` examples.",
        "input_data": {
            "num": 45.82,
            "num2": 99.6221
        },
        "transform": {
            "out": "(: transform($. 'main_transform') :)",
            "main_transform": {
                "original_value": "(: $num :)",
                "rounded": "(: $num -> 'round_number' :)",
                "num_is_big": "(: $num -> 'is_big' :)",
                "num_rounded_is_big": "(: ( $num -> 'round_number' ) -> 'is_big' :)",
                "num2_is_big": "(: $num2 -> 'is_big' :)",
                "num2_rounded_is_big": "(: ( $num2 -> 'round_number' ) -> 'is_big' :)",
            },
            "round_number": "(: math.round($.) :)",
            "is_big": "(: $. >= 100 :)"
        }
    },
    {
        "name": "Diff two json structures",
        "description": "Compare two data structures and reveal what the differences are between them. Expects the data to be an object where the original data is called 'orig' and the new data is called 'new'.  Try it with your own data!",
        "input_data": {
            "orig": {
                "foo": 1,
                "bar": "seven",
            },
            "new": {
                "foo": 1,
                "bar": "bob"
            }
        },
        "transform": {
            "out": "(: grep(unflatten({ ^([flatten($orig) flatten($new)] 'diff_it') }) '(: $index != `sync_status` :)') :)",
            "reverse_diff": "(: grep(unflatten({ ^([flatten($updated_item) flatten($original_item)] 'diff_it') }) '(: $index != `sync_status` :)') :)",
            "diff_it": "(: grep(union(keys($0) keys($1)) 'compare' 'value' $. ) :)",
            "compare": "(: $extra.0[$item] != $extra.1[$item] :)",
            "value": "(: [$item $extra.1[$item]] :)"
        }
    },
    {
        "name": "Some conditional operations",
        "description": "A few different variations of conditional data choices, including processing different transforms based on a given condition. The `?(transform true_value false_value)`  helper evaluates the condition and then applies either the true_value or the false_value depending on the output of the transform.  This is similar to an if condition or a ternary. It can be used to apply a different transform and/or change the format of the result based on a condition.",
        "input_data": {
            "num_a": 4,
            "num_b": 100
        },
        "transform": {
            "out": {
                "conditional_one": "(: ?( ($num_a == $num_b) 'numbers are equal' 'numbers are not equal') :)",
                "conditional_two": "(: ?( ($num_a < $num_b) 'a is lower than b' 'a is not lower than b') :)",
                "response": "(: ?( ($num_a % 2 == 0) ($num_a -> 'even') ($num_a -> 'odd') ) :)"
            },
            "even": {
                "announcement": "Woop! Woop! Even numbers are awesome"
            },
            "odd": {
                "error_code": 500,
                "error_message": "(: &( 'Sorry, ' $. ' is an odd number') :)"
            }
        }

    },
    {
        "name": "Ultra-concise data validation",
        "description": "Runs a set of validations against input data, returns a list of errors if there are any.",

        "input_data": {
            "username": "bob",
            "password": "bob123",
            "password2": "bob123!",
            "phone": "555-867-5309"
        },
        "transform": {
            "out": "(: grep($. -> validate) :)",
            "validate": 
            [
                "(: ?( !(length($username) >  5) 'Username must be at least 6 characters long') :)",
                "(: ?( !($username =~ /^[a-z_0-9]+$/) 'Username must only contain lower case letters, numbers or an underscore') :)",
                "(: ?( !($password =~ /[!@#$%^&*()<>]/) 'Password must contain a special character') :)",
                "(: ?( !($password == $password2)  'Passwords do not match') :)",
                "(: ?( !($phone =~ /^[0-9]{3}-?[0-9]{3}-?[0-9]{4}$/) 'Phone must be in format ###-###-####') :)"
            ]
        }
    },
    {   "name": "Search and replace",
        "description": "Do some string replacement",
        "input_data": {
            "greeting": "Hello World!"
        },
        "transform": {
             "out": "(: replace($greeting /o/g 'oo') :)"
        }
    },
    {   "name": "Object creation, handling key-value pairs",
        "description": "Translate a list of field mappings to a useful object",
        "input_data": [
            { "field": "name", "value": "Dominique" },
            { "field": "email", "value": "dominiquew@example.com" }
        ],
        "transform": {
            "out": "(: { map( $. `(: [ $item.key $item.value ] :)`) } :)"
        }
    },
    {
        "name": "Some useful Array operations",
        "description": "Examples of some of the more useful array related operations",
        "input_data": { 
            "numbers": [1,2,3,4,5, 6, 7, 8, 9],
            "num_odd": [1, 3, 5, 7, 9],
            "num_even": [2, 4, 6, 8],
            "colors": ['red','orange','yellow',  'green', 'blue', 'purple']
        },
        "transform": {
              "reverse": "(: reverse($numbers) :)",
              "head": "(: head($num_odd 3) :)",
              "tail": "(: tail($num_even 3) :)",
              "sort": "(: sort($colors '(: $a <=> $b :)') :)",
              "reversed_sort": "(: sort($colors '(: $b <=> $a :)') :)",
              "grouping": "(: group($colors `(: ?($item =~ /r/ 'has_r' 'no_r') :)`) :)"
        }
    },
    {
        "name": "List membership / Set operations examples",
        "description": "Some useful functions for comparing and extracting information from lists",
        "input_data": { 
            "numbers": [1,2,3,4,5, 6, 7, 8, 9],
            "num_odd": [1, 3, 5, 7, 9],
            "num_even": [2, 4, 6, 8],
            "num_with_dups": [1, 2, 7, 6, 8, 7, 1, 11, 11],
            "colors": ['red','orange','yellow',  'green', 'blue', 'purple'],
            "red_related": ['red', 'purple', 'orange'],
            "yellow_related": ['orange','yellow','green'],
            "blue_related": ['green', 'blue', 'purple']
        },
        "transform": {
              "union": "(: union($.num_odd $num_even) :)",
              "union_of_many": "(: union($red_related $yellow_related $blue_related) :)",
              "deduplicate": "(: union($num_odd $num_even $numbers) :)",
              "member": "(: member($colors 'pink') :)",
              "is_a_subset": "(: subset($colors ['orange', 'blue']) :)",
              "non_yellow_colors": "(: difference($colors $.yellow_related) :)"
        }
    },
    {
        "name": "Earthquakes in the last hour - LIVE DATA",
        "description": "Extracts the magnitude, location and time of all the earthquakes that occurred in the last hour.",
        "input_data_url": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
        "transform": {
                        "out": "(: map($features 'loc_and_magnitude') :)",
                        "loc_and_magnitude": "(: &( $item.properties.mag ' at ' $item.properties.place ' at ' strftime('%F %T' $item.properties.time)) :)"
                     }
    },
    {
        "name": "Who is on what spacecraft right now? - LIVE DATA",
        "description": "Determines the spacecraft currently in space and who is present on them.",
        "input_data_url": "https://getdtl.org/api_on/astros.json",
        "transform": {
                    "out": "(: group($people 'by_craft' 'who') :)",
                    "by_craft": "(: $item.craft :)",
                    "who": "(: $item.name :)"
                }
    },
    {
        "name": "Github events - Pull Requests - LIVE DATA",
        "description": "Shows most recent pull requests from github.",
        "input_data_url": "https://api.github.com/events",
        "transform": {
                    "out": "(: grep($. '(: $item.type == `PullRequestEvent` :)' 'details' ) :)",
                    "details": {
                        "who": "(: $item.actor.login :)",
                        "repo": "(: $item.repo.name :)",
                        "when": "(: $item.created_at :)"
                    }
         }
    },
    {
        "name": "Github emoji search - LIVE DATA",
        "description": "Find emoji with names that match... in the one big object Github returns for emoji.",
        "input_data_url": "https://api.github.com/emojis",
        "transform": {
                    "out": "(: grep($. '(: $index =~ /train/ :)' ) :)"
        }
    },
    {
        "name": "Today I Learned from Reddit - LIVE DATA",
        "description": "Extract headlines and links from 'Today I Learned' subreddit json feed.",
        "input_data_url": "https://getdtl.org/api_red/todayilearned.json",
        "transform": {
            "out": "(: map($data.children 'post' ) :)",
            "post": {
                "title": "(: $item.data.title :)",
                "link": "(: &( 'https://www.reddit.com' $item.data.permalink) :)",
                "source": "(: $item.data.url :)"
            }
        }
    },
    {
        "name": "Movie cast search - WARNING: large dataset",
        "description": "Searches for movies with specific cast members, you can try one or more names.",
        "input_data_url": "https://raw.githubusercontent.com/prust/wikipedia-movie-data/master/movies.json",
        "transform": {
            "out": "(: grep($. `(: subset($item.cast ['Willem Dafoe' 'Nicole Kidman']) :)` ) :)"
        }
    },
];



let json_schema_example = {
    "name": "Generate JSON-Schema from any JSON data",
    "description": "Takes any piece of json data and generates a json-schema from it. It tries to come up with reasonable validation rules, but only you know the real rules. Be sure to read the result and adjust it to better match your use case.",
    "input_data": {
        "str": "barbat",
        "test": false,
        "nullish": null,
        "num": 1.283,
        "int": 5,
        "arr": [
            "fee", "fie", "fo"
        ],
        "obj": {
            "some": "more",
            "things": 1,
            "truthy": true
        },
        "known_types": {
            "email_addr": "amelia@foo.bar.com",
            "the_id": "1e97e133-de6f-4ef1-811e-990493fcdbbc",
            "address": "122.23.39.11",
            "website": "https://www.example.org/",
            "date_of_birth": "1975-08-24",
            "alarm_time": "09:23:22+07:00",
            "scheduled_appointment": "2023-06-10T20:20:22+07:00"
        }
    },
    "transform": {
        "out": {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "$comment": "json-schema generated from json by DTL https://getdtl.org/",
            "properties": "(: { map($. 'create_properties' ) } :)"
        },
        "create_properties": "(: [ $index grep(^($. (^('typemap'))[typeof($item)])) ] :)",
        "create_string": "(: ^([$. derive($item 'format_lookup')] 'string_def') :)",
        "string_def": {
            "title": "(: $0.index -> field_title :)",
            "type": "string",
            "minLength": "(: ?(empty($1) 1 ) :)",
            "maxLength": "(: ?(empty($1) length($0.item)+100 ) :)",
            "format": "(: $1 :)"
        },
        "create_number": {
            "title": "(: $index -> field_title :)",
            "type": "(: ?((math.floor($item) == $item) 'integer' 'number' ) :)",
            "minimum": 0,
            "maximum": "(: math.floor(num($item * 100)) :)"
        },
        "create_boolean": {
            "title": "(: $index -> field_title :)",
            "type": "boolean"
        },
        "create_null": {
            "title": "(: $index -> field_title :)",
            "$comment": "field was null in sample data, guessing (possibly incorrectly) it should be string",
            "type": "string"
        },
        "create_array": {
            "title": "(: $index -> field_title :)",
            "type": "array",
            "minItems": 1,
            "maxItems": "(: num(length(fne($item 1))*20) :)",
            "items": "(: grep(^({ ['item' $item.0 ] } (^('typemap'))[typeof($item.0)])) :)"
        },
        "array_items": {
            "type": "(: ?((typeof($.) == 'undefined') 'string' typeof($.)) :)"
        },
        "create_object": {
            "title": "(: $index -> field_title :)",
            "type": "object",
            "properties": "(: { map($item 'create_properties') } :)"
        },
        "field_title": "(: capitalize(replace($. /_/g ' ')) :)",
        "typemap": {
            "array": "create_array",
            "object": "create_object",
            "number": "create_number",
            "string": "create_string",
            "boolean": "create_boolean",
            "undefined": "create_null"
        },
        "format_lookup": [
            [ "(: $. =~ /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i :)", "(: 'uuid' :)" ], 
            [ "(: $. =~ /^[^@]+@.+\\..+/ :)", "(: 'email' :)" ],
            [ "(: $. =~ /^(http|https|ftp|mailto|tel):.*/ :)", "(: 'uri' :)" ],
            [ "(: $. =~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]$/ :)", "(: 'date' :)" ],
            [ "(: $. =~ /^[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9](\\+[0-9][0-9]:[0-9][0-9])?$/ :)", "(: 'date-time' :)" ],
            [ "(: $. =~ /^[0-9][0-9]:[0-9][0-9](:[0-9][0-9](\\+[0-9][0-9]:[0-9][0-9])?)?$/ :)", "(: 'time' :)" ],
            [ "(: $. =~ /^[12]?[0-9]?[0-9].[12]?[0-9]?[0-9].[12]?[0-9]?[0-9].[12]?[0-9]?[0-9]$/ :)", "(: 'ipv4' :)" ]
        ]
    }
};

Transformer_examples.splice(13, 0, json_schema_example);
