const DTL = require('dtl-js');

let input_data = {
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

// 
let template = {
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
};

let result = DTL.apply(input_data, template);

console.log(result);
