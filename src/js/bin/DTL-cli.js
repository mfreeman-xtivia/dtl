#!/usr/bin/env node
/* =================================================
 * Copyright (c) 2015-2023 Jay Kuri
 *
 * This file is part of DTL.
 *
 * DTL is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * DTL is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with DTL; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * =================================================
 */
const { version } = require('../../../package.json');
const program = require('commander');
let DTL = require('../lib/DTL.js');
const util = require('util');
const JSON5 = require('json5');
const YAML = require('yaml');
const fs = require('fs');
const stream = require('stream');
const jsonlines = require('jsonlines');
const csv_parse = require('csv-parse');
const csv_stringify = require('csv-stringify');
const colorize = require('json-colorizer');
const prettyoutput = require('prettyoutput');
const readline = require('readline');


function list(str) {
    return str.split(/,\s?/);
}

let json_stringify = function(obj, indent) {
    return JSON.stringify(obj, undefined, indent);
}

let json_parse = function(str) {
    return JSON5.parse(str);
}

// five input modes:
// 1: input data is single json
// 2: input data is json stream (one object per line)
// 3: input data is csv - array of arrays
// 4: input data as csv - array of objects (fields taken from first line)
//
// two processing options
// 1: process input as one item into transform
// 2: process input as array of single items, one item at a time into the transform
//
//
//
function output_help() {
    console.log('Usage: dtl [options] inputfile');
    console.log('');
    console.log("  -e --execute '$.'     - provide transform on command line");
    console.log('  -f --transform-file   - Load transform from file');
    console.log('  -n --transform        - name of transform to use (default to "out")');
    console.log('  -a --apply_to_array   - Apply transform directly to each item in input');
    console.log('                           (rather than input as a whole)');
    console.log('');
    console.log('  -p --pretty [n]       - Produce pretty json output (indented by n spaces)');
    console.log('  -c --condensed        - Produce condensed json output');
    console.log('  -N --preserve-undefined - Preserve undefined as null in json output');
    console.log('  --init <init_file>    - Initialize DTL with the contents of init_file');
    console.log('');
    console.log('  -m --read-mode <mode> - read mode');
    console.log('     - line             - process line-by-line (default for csv)');
    console.log('     - all              - process data as one large data struct');
    console.log('');
    console.log('  -d --delim <char>     - Output delimiter character (for csv and unix)');
    console.log('  -id --idelim <char>   - Input delimiter character (for csv and unix)');
    console.log('');
    console.log('  -o --output-file <file> - place output into file instead of stdout');
    console.log('  -I --input-type       - input file type');
    console.log('     - auto             - try to auto-determine file type (default)');
    console.log('     - csv              - input file is csv');
    console.log('     - csv-objects      - input is csv with column headers, turn each row');
    console.log('                          into an object');
    console.log('     - json             - input file is json');
    console.log('     - json-lines       - input file is multiple json records, one to a line.');
    console.log('     - yaml             - input file is yaml');
    console.log('     - unix             - input data is whitespace separated plaintext');
    console.log('                          like standard unix cli tools');
    console.log('');
    console.log('  -O --output-type     - type of output to produce');
    console.log('     - auto            - default - produce the same type of output as input.');
    console.log('     - csv             - produce csv data - expects result of transform to be ');
    console.log('                         an array of objects or an array of arrays');
    console.log('     - csv-objects     - produce csv data with column headers based on objects');
    console.log('     - json            - produce json');
    console.log('     - json-lines      - produce multiple json, one to a line');
    console.log('     - yaml            - produce yaml');
    console.log('     - unix            - produce space separated values');
    console.log('');
    console.log('  -u --unix            - take unix-style plaintext as input, produce plaintext');
    console.log('                         unix mode is the default if taking input on stdin');
    console.log('');
    console.log('  -C --csv-columns     - When producing CSV data, use the provided columns and');
    console.log('                         order to produce the CSV. Will output a header with');
    console.log('                         comma-separated columns provided. If the results are');
    console.log('                         objects, the columns will be filled with data from the'); 
    console.log('                         matching keys in the output objects. If the results');
    console.log('                         are arrays, the columns are assumed to be correct and');
    console.log('                         this serves only to create the header line.');
    console.log('');
    console.log('  -S --skipheader      - When outputting CSV, do not output a header line');
    console.log('');
    console.log('  -s --strict-json     - When reading JSON files, be strict. By default dtl');
    console.log('                         parses JSON files with JSON5. This flag forces parsing');
    console.log('                         with vanilla JSON.');
    console.log('');
    console.log('  -V --version         - Show DTL version and exit');
    console.log('');
}

function output_version() {
    // get the version out of our package.json
//    const packageJSON = JSON.parse(fs.readFileSync('../../../package.json', 'utf8'));
    //console.log(util.inspect(packageJSON));
    console.log(version);
}

program.option('-e --execute <transform>', 'Use transform from command line instead of from file');
program.option('-f --transform-file <transform_file>', 'Load transforms from file');
program.option('-n --transform <transform_name>', 'name of transform to use, default is to use "out" transform');
program.option('-N --preserve-undefined', 'preserve undefined as null in JSON output');
program.option('-m --read-mode <read_mode>', 'Processing mode: "line" = line at a time, "all" = all lines at once', /^(line|all)$/);
program.option('-o --output-file <output_file>', 'Place output in a file instead of stdout', 'stdout');
program.option('--init --init-file <init_file>', 'Initialize DTL with the contents of init_file');
program.option('-C --csv-columns <columns>', 'Comma separated list of columns to use for output', list);
program.option('-d --delim <output_delim>', 'Output csv delimiter character');
program.option('-id --idelim <input_delim>', 'Input csv delimiter character');
program.option('-I --input-type <input_type>', 'Input file type, default is auto', /^(auto|csv|csv\-objects|json|json\-lines|yaml|unix)$/);
program.option('-O --output-type <output_type>', 'Output file type to produce', /^(auto|csv|csv\-objects|json|json\-lines|yaml|unix)$/);
program.option('-u --unix', 'Take unix-style text data as input');
program.option('-p --pretty [spaces]', 'Pretty-print json (spaces = number of spaces for each indentation, default 4)');
program.option('-c --condensed', 'Produce condensed json output (good for piping into other programs)');
program.option('-i --interactive', 'Operate in interactive mode');
program.option('-a --apply_to_array', 'Apply transform directly to each item in input');
program.option('-s --strict-json', 'Be strict about JSON (do not use JSON5 for parsing)');
program.option('-v --verbose', 'Be verbose');
program.option('-h --get-help', 'Get Help');
program.option('-S --skipheader', 'When outputting CSV, do not output a header line');
program.option('-V --version', 'Show DTL version');

// unfortunately, this is the only way to override --version in commander.
program.on('option:version', function() {
    output_version();
    process.exit();
});

let files = program.parseOptions(process.argv).args.slice(2);

if (program.getHelp) {
    output_help();
    process.exit();
}

const identity_transform = { "out": "(: $. :)" };

let options = {
    mode: "file",
    read_mode: "line",
    input_type: "auto",
    output_type: "auto",
    output_mode: "all_at_once",
    output_file: "stdout",
    transform: identity_transform,
    preserve_undefined: false,
    output_delimiter: ",",
    input_delimiter: ",",
    pretty: 0,
    add_header: true,
    color: false,
    condensed: true,
    verbose: false,
    transform_name: "out"
}
let matches, extension, filename;

if (typeof program.interactive != 'undefined') {
    options.mode = 'REPL';
}

if (typeof program.verbose != 'undefined') {
    options.verbose = true;
}

if (process.stdout.isTTY) {
    options.color = true;
    options.pretty = 4;
    options.condensed = false;
}

if (!program.condensed) {
    if (typeof program.pretty != 'undefined') {
        if (typeof program.pretty != 'boolean') {
            options.pretty = parseInt(program.pretty);
        } else {
            options.pretty = 4;
        }
    }
    options.condensed = false;
} else {
    options.pretty = 0;
    options.color = false;
    options.condensed = true;
}

if (typeof program.csvColumns != 'undefined') {
    options.columns = program.csvColumns;
}

if (program.skipheader) {
    options.add_header = false;
}

if (typeof program.strictJson != 'undefined') {
    json_parse = function(str) {
        return JSON.parse(str);
    };
}

if (typeof program.preserveUndefined != 'undefined') {
    // TODO - allow auto columns ?
    options.preserve_undefined = true;
    let replacer = function(k, v) {
        if (v === undefined) {
            return null;
        } else {
            return v;
        }
    }
    json_stringify = function(obj, indent) {
        return JSON.stringify(obj, replacer, indent);
    };
}

if (program.unix) {
    options.input_type = 'unix';
    options.output_type = 'unix';
}

if (typeof program.outputType != 'undefined') {
    options.output_type = program.outputType;
}

if (typeof program.inputType != 'undefined') {
    options.input_type = program.inputType;
}

if (typeof program.outputFile != 'undefined') {
    options.output_file = program.outputFile;
}

if (typeof program.execute != 'undefined') {
    if (/^{.*}\s*$/.test(program.execute)) {
        options.transform = json_parse(program.execute);
    } else if (/^\(:.*:\)$/.test(program.execute)) {
        options.transform = { out: program.execute };
    } else {
        options.transform = { out: "(: " + program.execute + " :)" };
    }
}

if (typeof program.initFile != 'undefined') {
    // transform should be a filename.  Try to load file.
    try {
        let resolvedPath = path.resolve(program.initFile);
        const initializer = require(resolvedPath);
        DTL = initializer(DTL);
    } catch (e) {
        console.error('Unable to load '+ program.initFIle + ': ', e.message);
        process.exit(1);
    }
}

if (typeof program.transformFile != 'undefined') {
    // transform should be a filename.  Try to load file.
    try {
        options.transform = json_parse(fs.readFileSync(program.transformFile));
        //console.log(options.transform);
    } catch (e) {
        console.error('Unable to load '+ program.transformFile + ': ', e.message);
        process.exit(1);
    }
}

if (typeof program.transform != 'undefined') {
    options.transform_name = program.transform;
}

if (typeof options.transform[options.transform_name] == 'undefined') {
    console.error('Unable to find transform named '+ options.transform_name + ' in provided transform');
    process.exit(1);
}

if (program.apply_to_array) {
    let txname = DTL.apply({}, { "out": "(: &('tx_' uuid()) :)"});
    options.transform[txname] = "(: map($. '(: $item -> `" + options.transform_name + "` :)') :)"
    options.transform_name = txname;
}


if (typeof files[0] == 'string') {
//    console.log('setting filename to: ', files[0]);
    filename = files[0];
} else if (typeof files[0] == 'undefined') {
    filename = '-';
}

if (filename !== '-' ) {
    try {
        fs.accessSync(filename, fs.constants.R_OK);
    } catch (e) {
        console.error("Unable to access " + filename +":", e.message);
        process.exit(2);
    }
} else {
    if (options.input_type == 'auto') {
        options.input_type = 'unix';
        options.output_type = 'unix';
    }
}

// figure out the input type, as that determines our mode.
// TODO: turn this into a function
//

if (options.input_type == 'auto') {
    matches = /.*\.([^.]+)$/.exec(filename);
    if (matches !== null) {
        extension = matches[1];
        switch(extension) {
            case 'json':
                options.input_type = 'json';
                options.read_mode = 'all';
                break;
            case 'jsonl':
            case 'jsonlines':
                options.input_type = 'json-lines';
                options.read_mode = 'line';
                break;
            case 'csv':
                options.input_type = 'csv-objects';
                break;
            case 'tsv':
                options.input_type = 'csv-objects';
                options.input_delimiter = '\t';
                break;
            case 'yaml':
                options.input_type = 'yaml';
                break;
            case 'unix':
                options.input_type = 'unix';
                options.read_mode = 'line';
                break;
        }
    }
    // if we are here, and input_type is still auto, we failed to guess the file type
    if (options.input_type == 'auto') {
        options.input_type = 'json';
        options.read_mode = 'all';
        options.file_type_guessed = true;
//        console.error('Unable to determine input file type, please provide the appropriate -I flag');
//        process.exit(3);
    }
}

if (options.input_type == 'unix') {
    options.read_mode = 'line';
    if (typeof program.idelim == 'undefined') {
        options.input_delimiter = /[\s\t]+/;
    }
}

if (program.readMode) {
    if (program.readMode == 'line') {
        options.read_mode = 'line';
    } else {
        options.read_mode = 'all';
    }
}

if (options.output_type == 'unix') {
    options.output_mode = 'line_at_a_time';
    if (typeof program.delim == 'undefined') {
        options.output_delimiter = " ";
    }
    if (options.input_type == 'unix' && options.transform == identity_transform) {
        // our input type is unix text and the transform has not been set by any args
        // so we set it to output the input unchanged.
        options.transform = { out: "(: $0 :)" };
    }
}

if (options.output_type == 'auto') {
    matches = /.*\.([^.]+)$/.exec(options.output_file);
    if (matches !== null) {
        extension = matches[1];
        switch(extension) {
            case 'json':
                options.output_type = 'json';
                break;
            case 'jsonl':
            case 'jsonlines':
                options.output_type = 'json-lines';
                break;
            case 'csv':
                options.output_type = 'csv';
                break;
            case 'tsv':
                options.output_type = 'csv';
                options.output_delimiter = '\t';
                break;
            case 'yaml':
                options.output_type = 'yaml';
                break;
        }
    }
    if (options.output_type == 'auto') {
        // we failed to match anything. Default to json output
        options.output_type = 'json'
    }
}
if (options.output_type == 'json-lines' && typeof program.pretty == 'undefined') {
    console.error("pretty", program.pretty)
    // pretty must be disabled for json-lines to be properly formatted
    // so we disable pretty unless it's been explicitly set
    options.pretty = 0;
}

// allow manually specified delimiters to override the defaults
if (typeof program.delim != 'undefined') {
    //console.log('delim', util.inspect(program.delim));
    options.output_delimiter = program.delim;
}
if (typeof program.idelim != 'undefined') {
    //console.log('idelim', util.inspect(program.idelim));
    options.input_delimiter = program.idelim;
}

if (options.output_type == 'json-lines' || (options.output_type == 'csv' && Array.isArray(options.columns)) ) {
    options.output_mode = 'line_at_a_time';
}

// at this point, we know where our data is coming from, we've failed if we don't
// understand our options or can't access our files... so we proceed into actually
// setting up the data handling

// inputTransform is the transform that processes input from the
// file or stdin.
//
// DTLTransform is the transform that actually runs the DTL
//
// outputTransform is the thing that handles the final output
//
// raw data gets piped into inputTransform, and that is piped into
// DTLTransform
//
// DTLTransform is then piped into the outputTransform

let DTLTransform = new stream.Transform({
    readableObjectMode: true,
    writableObjectMode: true,
    transform: function(input_data, encoding, callback) {
        //console.log('DTL Transform', util.inspect(input_data, { depth: null}));
//        //console.log(util.inspect(options.transform, { depth: null}));
        let result = DTL.apply(input_data, options.transform, options.transform_name);
        //console.log('DTL result', util.inspect(result, { depth: null}));
        if(typeof this.results == 'undefined') {
            this.results = [];
        }
        this.push(result);
        callback();
    }
});

// inputTransform is where the raw file data goes
// the code below decides what processing happens
let inputTransform, outputTransform;

// now we set up the file handling
if (options.input_type == 'json-lines') {
    // simplest case first
//    console.log('processing input as json-lines');
    inputTransform = jsonlines.parse();
    inputTransform.pipe(DTLTransform);

} else if (options.input_type == 'unix') {
    //console.log('unix input');
    // we have a unix stream. Need to process it with readline
    inputTransform = new stream.Transform({
        readableObjectMode: true,
        writableObjectMode: false,
        transform: function(chunk, encoding, callback) {
            this.push(chunk);
            callback();
        }
    });
    let readlineTransform = readline.createInterface({
        input: inputTransform,
        //output: DTLTransform
    });
    readlineTransform.on('line', function(line) {
        // split the line on the input delimeter (by default whitespace)
        let data = line.split(options.input_delimiter);

        // add entire line as $0
        data.unshift(line);

        DTLTransform.write(data);
    });
    readlineTransform.on('close', function() {
        //console.log('ENDING');
        DTLTransform.end();
    });
    
} else if (options.input_type == 'json') {

    // we have a single json, but we still need to emit a data event into our
    // transform - so we setup inputTransform to collect the data entirely
    // and then push it to the next thing in the chain.
    inputTransform = new stream.Transform({
        readableObjectMode: true,
        writableObjectMode: false,
        transform: function(chunk, encoding, callback) {
            if(typeof this.stream_data == 'undefined') {
                this.stream_data = Buffer.from(chunk);
            } else {
                this.stream_data = Buffer.concat([this.stream_data, chunk]);
            }
            callback();
        },
        flush: function(callback) {
            let result;
            try {
                result = json_parse(this.stream_data.toString('utf8'));
                if (options.read_mode == 'line' && Array.isArray(result)) {
                    result.forEach(function(item) {
                        this.push(item)
                    }.bind(this));
                } else {
                    this.push(result);
                }
            } catch(e) {
                let file_accessed = filename;
                if (file_accessed == '-') {
                    file_accesses = 'standard input';
                }
                if (options.file_type_guessed) {
                    console.error('Unable to parse ' + file_accessed + ' as JSON:\n');
                    console.error(e.message);
                    console.error('\nIf it is not JSON data, use the -I flag to set the input file type.');
                    process.exit(2);
                } else {
                    console.error('JSON parse error on ' + file_accessed);
                    console.error(e.message);
                    process.exit(2);
                }

            }
            callback();
        }
    });
    inputTransform.pipe(DTLTransform);
} else if (options.input_type == 'csv' || options.input_type == 'csv-objects') {
    // csv processing is a bit more complicated - we have two modes
    // line-by-line and file-at-once... and these require different handling.
    let csv_parser;
    let csv_options = {
        trim: true,
        delimiter: options.input_delimiter
    };
    if (options.input_type == 'csv-objects') {
        csv_options.columns = true;
    }
    if (options.read_mode == 'line') {
        // set up csv transform - straight from csv-parse - no problem.
        inputTransform = csv_parse(csv_options);
        inputTransform.on('error', function(err){
            console.log('csv Processing Error:', err.message);
        });
        inputTransform.pipe(DTLTransform);
    } else {
        // file-at-once requires a transform like file-at-once json
        inputTransform = csv_parse(csv_options);
        inputTransform.records = [];
        csv_parser = new stream.Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            transform: function(record, encoding, callback) {
                if(typeof this.records == 'undefined') {
                    this.records = [];
                }
                this.records.push(record);
                callback();
            },
            flush: function(callback) {
                this.push(this.records);
                callback();
            }
        });
        inputTransform.on('error', function(err){
            console.log('csv Processing Error:', err.message);
        });
        inputTransform.pipe(csv_parser).pipe(DTLTransform);
    }
} else if (options.input_type == 'yaml') {

    // we have a single json, but we still need to emit a data event into our
    // transform - so we setup inputTransform to collect the data entirely
    // and then push it to the next thing in the chain.
    inputTransform = new stream.Transform({
        readableObjectMode: true,
        writableObjectMode: false,
        transform: function(chunk, encoding, callback) {
            if(typeof this.stream_data == 'undefined') {
                this.stream_data = Buffer.from(chunk);
            } else {
                this.stream_data = Buffer.concat([this.stream_data, chunk]);
            }
            callback();
        },
        flush: function(callback) {
            let result;
            try {
                result = YAML.parse(this.stream_data.toString('utf8'));
                this.push(result);
            } catch(e) {
                console.error('yaml data failed to parse!!: ', e.message);
            }
            callback();
        }
    });
    inputTransform.pipe(DTLTransform);
}

// output handling.
// Possibilities:
// 1) Output JSON
// 2) Output JSONLines
// 3) Output CSV
//
// Output modes:
// 1) one item at a time - less memory, faster.
// 2) All at once - more memory, slower.

// What determines which one we use is our output type, plus, in the case of CSV, whether
// we have the columns predefined.
// 1) Output is JSON - All at once mode.
// 2) Output is JSONLines - One item at a time mode.
// 3) Output is CSV - no columns provided - All at once mode.
// 4) Output is CSV - columns provided - One item at a time mode.

// for now, we always output JSON data
let outputStream;
let collector;

// process:
// line_at_a_time mode - Take a single piece of data and send it
//    to the output element which will handle it.
//
// all_at_once - take the data and add it to the collected data
//    Then, when no more data is available, send it to the output
//    element.
//
//
if (options.output_mode == 'all_at_once') {
    // define a collector
    collector = new stream.Transform({
        readableObjectMode: true,
        writableObjectMode: true,
        transform: function(record, encoding, callback) {
            if(typeof this.records == 'undefined') {
                this.records = [];
            }
            this.records.push(record);
            callback();
        },
        flush: function(callback) {
            if (Array.isArray(this.records)) {
                if (this.records.length > 1) {
                    this.push(this.records);
                } else {
                    this.push(this.records[0]);
                }
            } else {
                this.push([])
            }
            callback();
        }
    });
    DTLTransform.pipe(collector);
} else {
    collector = DTLTransform;
}

if (options.output_type == 'csv' || options.output_type == 'csv-objects') {
    // depending on whether we have columns or not, we may get records one-line at a time
    // or all at once.
    let extractor = collector;
    let csv_options = {
        delimiter: options.output_delimiter,
        header: !!options.add_header
    };
    if (Array.isArray(options.columns)) {
        csv_options.columns = options.columns;
    } else {
        // if we don't have columns, we can't output a header
        // this way.
        csv_options.header = false;
    }
    if (options.output_mode == 'all_at_once') {
        // if we are all at once, we likely need to figure out our columns from the
        // input data.

        let get_columns = {
            "out": "(: sort(reduce($. 'get_keys' [] )) :)",
            "get_keys": "(: union($memo keys(flatten($item))) :)"
        };
        let flatten = {
            "out": "(: flatten($.) :)"
        };

        extractor = new stream.Transform({
            readableObjectMode: true,
            writableObjectMode: true,
            transform: function(obj, encoding, callback) {
                let object = obj;
                let columns;

                // We need an array of data to process.
                // If we didn't get an array, put it in an array, 
                // so we can process it correctly.
                if (!Array.isArray(obj)) {
                    object = [ obj ];
                }

                if (Array.isArray(options.columns)) {
                    columns = options.columns;
                } else {
                    columns = DTL.apply(object, get_columns);
                }

                if (options.add_header) {
                    this.push(columns);
                }
                for (let i = 0, len = object.length; i < len; i++) {
                    let output = object[i];
                    if (!Array.isArray(object[i])) {
                        output = [];
                        let flattened_obj = DTL.apply(object[i], flatten);
                        columns.forEach(function(key) {
                            output.push(flattened_obj[key]);
                        });
                    }
                    this.push(output);
                }
                callback();
            }
        });
        outputStream = csv_stringify(csv_options);
        extractor.pipe(outputStream);
        collector.pipe(extractor);
    } else {
        csv_options.columns = options.columns;
        outputStream = csv_stringify(csv_options);
        collector.pipe(outputStream);
    }
} else if (options.output_type == 'yaml') {
    // this handles yaml
    outputStream = new stream.Transform({
        writableObjectMode: true,
        transform: function(object, encoding, callback) {
            let yaml_out;
            if (options.pretty && options.output_file == 'stdout') {
                yaml_out = prettyoutput(object, {maxDepth: 1000}, 2);
            } else {
                yaml_out = YAML.stringify(object);
            }
            this.push(yaml_out + "\n");
            callback();
        }
    });
    collector.pipe(outputStream);
} else if (options.output_type == 'unix') {
    // this handles unix textual output
    let extractor;
    let object_to_plaintext_tx = {
        "out": "(: map(flatten($.) '(: &($index `:` $item) :)') :)"
    };
    outputStream = new stream.Transform({
        writableObjectMode: true,
        transform: function(data, encoding, callback) {
            let text_out;
            if (Array.isArray(data)) {
                text_out = data.join(options.output_delimiter);
                this.push(text_out + "\n");
            } else if (typeof data == 'object') {
                let new_data = DTL.apply(data, object_to_plaintext_tx);
                text_out = new_data.join(options.output_delimiter);
                this.push(text_out + "\n");
            } else {
                this.push(data + "\n");
            }
            callback();
        }
    });
    if (options.read_mode == 'all') {
        extractor = new stream.Transform({
            writableObjectMode: true,
            readableObjectMode: true,
            transform: function(data, encoding, callback) {
                if (Array.isArray(data)) {
                    data.forEach(item => {
                        this.push(item);
                    });
                } else {
                    this.push(data);
                }
                callback();
            }
        });
        collector.pipe(extractor);
        extractor.pipe(outputStream);
    } else {
        collector.pipe(outputStream);
    }
} else {
    // this handles json

    outputStream = new stream.Transform({
        writableObjectMode: true,
        transform: function(object, encoding, callback) {
            let json;
            if (options.pretty && options.output_file == 'stdout') {
                json = colorize(json_stringify(object, options.pretty));
            } else {
                json = json_stringify(object, options.pretty);
            }
            this.push(json + "\n");
            callback();
        }
    });
    collector.pipe(outputStream);
}

// write to stdout or to file:
if (options.output_file != 'stdout') {
    let fileOut = fs.createWriteStream(options.output_file);
    outputStream.pipe(fileOut);
} else {
    outputStream.pipe(process.stdout);
}

// now we handle loading the input:
if (filename != '-') {
    let readStream = fs.createReadStream(filename);
    readStream.pipe(inputTransform);
} else {
    process.stdin.pipe(inputTransform);
}
