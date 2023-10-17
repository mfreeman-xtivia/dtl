#!env node

let DTL = require('dtl-js');

let input_data = {
    "user": "bob123",
    "phone": "921-555-122",
    "color": undefined,
    "status": "activated"
};

let validator = {
    "out": "(: grep(($. -> 'validate') '(: $item.0 != true :)' '(: $item.1 :)') :)",
    "validate": [
        [ "(: length($user) > 3 :)", "Username must be at least 3 characters long" ],
        [ "(: $phone =~ m/'^[0-9\-]+$'/ :)", "Phone must contain only 0-9 and dashes" ],
        [ "(: length(replace($phone '/[^0-9]/g' '')) >= 10 :)", "Invalid Phone number" ],
        [ "(: member(['active' 'inactive' 'deleted'] $status) :)", "(: $status & ' is not a valid status' :)" ],

    ]
}

let errors = DTL.apply(input_data, validator);

if (errors.length > 0) {
    console.log('There were errors: ');
    errors.forEach(function(err) {
        console.log(err);
    });
}

        
        
        

