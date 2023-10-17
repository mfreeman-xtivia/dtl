#!/usr/bin/env node

let DTL = require('../../lib/DTL.js');
const Expressions = require("../../lib/DTL-expressions.js");
let fs = require('fs');

let expressions = new Expressions();
let helpers = expressions.get_available_helpers();

Object.keys(helpers).forEach(function(helper_name) {
    let filename = "../../../../docs/helpers/" + helper_name + '-additional.md';
    let extra_docs = '';
    if (fs.existsSync(filename)) {
        extra_docs = fs.readFileSync(filename);
        helpers[helper_name].extra_docs = extra_docs;
    }
});

let helper_transform = JSON.parse(fs.readFileSync('./helper-to-markdown.json'));

let result = DTL.apply(helpers, helper_transform);

console.log(result);

