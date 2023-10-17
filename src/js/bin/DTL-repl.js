#!/usr/bin/env node
/* =================================================
 * Copyright (c) 2015-2022 Jay Kuri
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

/* jshint esversion: 6 */

const { version } = require('../../../package.json');
const fs = require('fs');
const path = require('path');
const repl = require('repl');
const program = require('commander');
const JSON5 = require('json5');
let dtl = require('../lib/DTL.js');
const util = require('util');
const csv_parse = require('csv-parse/lib/sync');
const colorize = require('json-colorizer');
const child_process = require('child_process');
const tmp = require('tmp');
const chalk = require('chalk');

const DTL = new dtl();

program.option('-h --get-help', 'Get Help');
program.option('-a --as-arrays', 'process inputfile as arrays', false);
program.option('-p --print-now', 'Print parsed input data immediately upon start', false);
program.option('-s --skip-suggestions', 'skip DTL expression suggestions on startup', false);
program.option('--init --init-file <init_file>', 'Initialize DTL with the contents of init_file');
program.option('-V --version', 'Show DTL version');

function output_version() {
    console.log(version);
}

// unfortunately, this is the only way to override --version in commander.
program.on('option:version', function() {
    output_version();
    process.exit();
});


let files = program.parseOptions(process.argv).args.slice(2);

if (program.getHelp) {
    console.log('Usage: dtlr [options] [inputfile]');
    console.log('');
    console.log(' -h                  - Print this help');
    console.log(' -a                  - Process inputfile as arrays');
    console.log(' -p                  - Print parsed input data immediately upon start');
    console.log(' -s                  - skip suggestion text on startup');
    console.log(' -V --version        - Show DTL version and exit');
    console.log(' --init <init_file>  -  Initialize DTL with the contents of init_file');
    process.exit();
}

if (typeof program.initFile != 'undefined') {
    // transform should be a filename.  Try to load file.
    try {
        let resolvedPath = path.resolve(program.initFile);
        const initializer = require(resolvedPath);
        DTL = initializer(DTL);
    } catch (e) {
        console.error('Unable to load '+ program.initFile + ': ', e.message);
        process.exit(1);
    }
}
function undef_replacer(k, v) {
    if (v === undefined) {
        return null;
    } else {
        return v;
    }
}
function json_stringify(obj, indent) {
    return JSON.stringify(obj, undef_replacer, indent);
}

let repl_state = clear_state();
// This gives our default input data a value
// This will get overwritten if we load input from anywhere.
set_input_data(undefined, repl_state, { "greeting": "Hello", "recipient": "world" });


function set_input_data( server, state, input_data ) {
    let size = json_stringify(input_data).length;
    state.input_data = input_data;
    state.input_data_size = size;
    state.input_data_type = typeof input_data;
    if (Array.isArray(input_data)) {
        state.input_data_type = 'array';
    }
    if (typeof server == 'object' && typeof server.setPrompt == 'function') {
        server.setPrompt(get_prompt(state));
    }
}

function get_input_data_description(state) {
    let desc = chalk.white("input data: ") + chalk.cyan(state.input_data_type) +
        chalk.white(" size: ") + chalk.blue("~" + state.input_data_size + " bytes");
    return desc;
}

function get_prompt(state) {

    let prompt = chalk.green("DTL") + chalk.blue(">");

    return prompt;
}

function completer(line) {
    let helpers = DTL.expression_parser.get_available_helpers();
    let helper_names = Object.keys(helpers).sort();
    let splitter = new RegExp('[ \(\)+\\-*\/]');
    let words = line.split(splitter);
    let lastword = words[words.length-1]

    let hits = helper_names.filter((c) => c.startsWith(lastword));
    //console.log("\n" + hits.join(" "));
  // Show all completions if none found
    return [hits.length ? hits.reverse() : helper_names, lastword];

}

if (files.length > 0) {
    try {
        let input = load_input_from_file(repl_state, files[0], program.asArrays);
        set_input_data(undefined, repl_state, input);
    } catch (e) {
        console.warn('Unable to load input from ' + files[0] + ': ' + e.toString())
        process.exit();
    }
}
function print_data(data, depth) {
    let max_array = 100;
    if (depth == null) {
        max_array = Infinity;
    }
    let json = colorize(json_stringify(data, '    '));
    console.log(json);// util.inspect(data, { colors: true, depth: depth, maxArrayLength: max_array}))
};

function print_suggestions(data) {

    let tx = "(: map(0..3 '(: split($extra[math.rand(length($extra))] `.`) :)' keys(flatten($.))) :)";
    let keys = DTL.apply(repl_state.input_data, tx);
    let functions = [
        'keys',
        'length',
        'flatten'
    ];

    let results = [];
    keys.forEach( key_arr => {
        let item = '$' + key_arr.join('.');
        results.push(item);

        if (key_arr.length > 2) { 
            let which_one = Math.floor(Math.random() * 2);
            key_arr.pop();
            switch(which_one) {
                case 0:
                    item = '$' + key_arr.join('.');
                    break;
                case 1:
                    item = functions[Math.floor(Math.random() * functions.length)] + '($' + key_arr.join('.') + ')';
                    break;
            }
            if(item != undefined) {
                results.push(item);
            }
        }
    });
    console.log(chalk.white.bold("Based on your input data, here are some expressions to try..."));
    console.log("");
    let tried = {};
    for (let i = 0; i < 4; i++) {
        let variable_to_try = results[i];
        if (typeof tried[variable_to_try] == 'undefined') {
            console.log(chalk.cyan(variable_to_try));
            tried[variable_to_try] = true;
        }
    };
    console.log("");
};

function write_output(data) {
    return colorize(json_stringify(data, '    '));
}


function string_to_transform(input) {
    let data = input.trim();
    let transform;

    // if we have multiline input that starts and ends with curly brace, it's likely
    // to be JSON. Attempt to decode JSON first, otherwise fall back to normal DTL 
    // parsing
    if (/\n/.test(data) && data[0] == '{' && data[data.length-1] == "}") {
        try {
            transform = JSON5.parse(input);
        } catch (e) {
            transform = input.trim();
        }
    } else {
        transform = input.trim();
    }

    return transform;
}


function DTLEval(cmd, context, filename, callback) {
    let input = cmd.trim();
    let transform, result;
    if (input.length != 0) {
        transform = string_to_transform(input);
        repl_state.transform = transform;
    } else {
        transform = repl_state.transform;
    }
    try {
        if (typeof transform == 'string') {
            result = DTL.apply(repl_state.input_data, "(: " + transform + " :)" );
        } else {
            result = DTL.apply(repl_state.input_data, transform);
        }
        repl_state.last_result = result;
    } catch(e) {
        console.warn(e.toString());
    }
    callback(null, result);
}

function load_input_from_result(state, arg) {
    let input, result;
    if (typeof arg == 'string' && arg.length >= 1 ) {
        input = arg.trim();
        transform = string_to_transform(input);
        result = DTL.apply(state.input_data, "(: " + input + " :)");
    } else {
        result = repl_state.last_result;
    }
    //repl_state.input_data = result;
    //set_input_data(repl_state, result);
    console.log('input data updated');
    return result;
}

function load_input_from_file(state, filename, as_array) {
    let file_contents = fs.readFileSync(filename);
    let cols = !as_array;
    let input_data;
    state.previous_load = { "filename": filename, "as_array": as_array };
    if (/\.csv$/.test(filename)) {
        input_data = csv_parse(file_contents, {columns: cols, skip_empty_lines: true});
    } else {
        input_data = JSON5.parse(file_contents);
        if (as_array && !Array.isArray(input_data)) {
            input_data = [ input_data ];
        }
    }
    //set_input_data(state, input_data);
    return input_data;
}

function save_data(state, filename) {
    let data = json_stringify(repl_state.last_result);
    fs.writeFileSync(filename, data);
    console.log(data.length + ' bytes written to ' + filename);
    return;
}

function import_transform(state, filename, quiet) {
    let file_contents = fs.readFileSync(filename);
    let json_obj;
    if (Buffer.isBuffer(file_contents)) {
        file_contents = file_contents.toString('utf8');
    }
    if (!quiet) {
        console.log(file_contents.length + ' bytes read from ' + filename);
    }
    return string_to_transform(file_contents);
}

function clear_state(state) {
    if (typeof state == 'undefined') {
        state = {};
    }
    state.last_result= undefined;
    state.transform = "$.",
    set_input_data(undefined, state, {});
    state.last_result = {};

    return state;
}

console.log('DTL: Copyright (c) 2013-2023 Jay Kuri');
console.log('Welcome to the DTL REPL interpreter.');
console.log('');
console.log("To load input data use: .load filename");
console.log('To edit transform in editor type: .edit');
console.log('Type .help for help');
console.log('');
console.log("Enter transform at prompt to apply transform");
if (typeof program.printNow != 'undefined') {
    print_data(repl_state.input_data);
}
if (program.skipSuggestions != true) {
    print_suggestions(repl_state.input_data);
}
console.log(get_input_data_description(repl_state));

let repl_server = repl.start({
    prompt: get_prompt(repl_state),
    eval: DTLEval,
    writer: write_output,
    completer: completer
});

// bad form, but I don't have an official way to do this:
delete repl_server.commands['editor'];

let repl_history_file = process.env['DTL_HISTORY_FILE'];
if (typeof repl_history_file == 'undefined' || repl_history_file.length == 0) {
    repl_history_file = process.env['HOME'] + "/.DTL_history";
}

if (typeof repl_server.setupHistory != 'undefined') {
    repl_server.setupHistory(repl_history_file, function(err, repl) {
        if (err) {
            console.warn('Unable to load history file ' + repl_history_file + ': ' + err);
            console.warn('Proceeding without history');
        }
    });
}
function show_helpers() {
    let helpers = DTL.expression_parser.get_available_helpers();
    console.log('Available helpers are: ');
    console.log('');
    let helper_names = Object.keys(helpers).sort();
    let current_line = '';
    for (let i = 0, len = helper_names.length; i < len; i++) {
        if (current_line.length > 60) {
            console.log('  ' + current_line);
            current_line = '';
        }
        current_line = current_line + helper_names[i] + ' ';
    }
}

repl_server.defineCommand('help', {
    help: 'get help',
    action(arg) {
        if (typeof arg == 'undefined' || arg == '') {
            console.log(chalk.bold.green('.clear') + chalk.white('         Clear repl state'));
            console.log(chalk.bold.green('.edit') + chalk.white('          Edit transform in editor'));
            console.log(chalk.bold.green('.exit') + chalk.white('          Exit the repl'));
            console.log(chalk.bold.green('.help') + chalk.white('          This help message'));
            console.log(chalk.bold.green(".help topic") + chalk.white("    Get help on 'topic'"));
            console.log(chalk.bold.green('.helpers') + chalk.white('       Show available helpers'));
            console.log(chalk.bold.green('.import fname') + chalk.white('  Import transform from file'));
            console.log(chalk.bold.green('.load fname') + chalk.white('    Load Input from file'));
            console.log(chalk.bold.green('.loada fname') + chalk.white('   Load input from file as array'));
            console.log(chalk.bold.green('.reload') + chalk.white('        Reload most recently loaded input file'));
            console.log(chalk.bold.green('.save fname') + chalk.white('    Save result to file'));
            console.log(chalk.bold.green('.i') + chalk.white('             Print current input data'));
            console.log(chalk.bold.green('.t') + chalk.white('             Print current transform'));
            console.log(chalk.bold.green('.use') + chalk.white('           Replace input data with result of current transform'));
            console.log(chalk.bold.green('.use expr') + chalk.white('      Replace input data with result of expr'));
        } else {
            let helpers = DTL.expression_parser.get_available_helpers();
            //console.log(util.inspect(helpers));
            if (typeof helpers[arg] == 'object') {
                console.log('');
                console.log(helpers[arg].syntax);
                console.log('');
                console.log('  ' + helpers[arg].description.join("\n  "));
                console.log('');
                console.log('  ' + 'Returns: ' +  helpers[arg].returns);
            } else if (arg == 'helpers') {
                show_helpers();
            }
        }
        console.log('');
        this.displayPrompt();
    }
});

repl_server.defineCommand('helpers', {
  help: 'Show available helper functions',
  action() {
    show_helpers();
    this.displayPrompt();
  }
});

repl_server.defineCommand('clear', {
  help: 'Clear repl state',
  action() {
    this.clearBufferedCommand();
    clear_state(repl_state);
    this.displayPrompt();
  }
});

repl_server.defineCommand('use', {
  help: 'Replace input data with transform result',
  action(transform) {
    this.clearBufferedCommand();
    let input = load_input_from_result(repl_state, transform);
    set_input_data(this, repl_state, input);
    console.log(get_input_data_description(repl_state));
    this.displayPrompt();
  }
});

repl_server.defineCommand('t', {
  help: 'Print current transform',
  action() {
    this.clearBufferedCommand();
    print_data(repl_state.transform);
    this.displayPrompt();
  }
});

repl_server.defineCommand('i', {
  help: 'Print current input data',
  action(depth_arg) {
    let depth = 4;
    if (depth_arg == 'full') {
        depth = null;
    } else if (!isNaN(parseInt(depth_arg))) {
        depth = parseInt(depth_arg);
    }
    this.clearBufferedCommand();

    print_data(repl_state.input_data, depth);
    this.displayPrompt();
  }
});

repl_server.defineCommand('reload', {
  help: 'Reload most recently loaded input file',
  action(filename) {
    this.clearBufferedCommand();
    if (typeof repl_state.previous_load == 'object') {
        let input = load_input_from_file(repl_state, repl_state.previous_load.filename, repl_state.previous_load.as_array);
        set_input_data(this, repl_state, input);
        console.log('input data reloaded');
    } else {
        console.log('No previous file load found');
    }
    console.log(get_input_data_description(repl_state));
    this.displayPrompt();
  }
});

repl_server.defineCommand('load', {
  help: 'Load Input from file',
  action(filename) {
    this.clearBufferedCommand();
    try {
        let input = load_input_from_file(repl_state, filename, false);
        set_input_data(this, repl_state, input);
        console.log('Input data loaded');
    } catch (e) {
        console.warn('load error: ', e.toString());
        this.editorMode=false;
    }
    console.log(get_input_data_description(repl_state));
    this.displayPrompt();
  }
});

repl_server.defineCommand('loada', {
  help: 'Load input from file as array',
  action(filename) {
    this.clearBufferedCommand();
    try {

        load_input_from_file(repl_state, filename, true);
        console.log('Input data loaded as array with ' + repl_state.input_data.length + ' items');
    } catch (e) {
        console.warn('load error: ', e.toString());
        this.editorMode=false;
    }
    console.log(get_input_data_description(repl_state));
    this.displayPrompt();
  }
});

repl_server.defineCommand('save', {
  help: 'Save result to file',
  action(filename) {
    this.clearBufferedCommand();
    save_data(repl_state, filename);
    this.displayPrompt();
  }
});

repl_server.defineCommand('import', {
  help: 'import transform from file',
  action(filename) {
    this.clearBufferedCommand();
    this.editorMode=true;
    try {
        transform = import_transform(repl_state, filename);
        repl_state.transform = transform;
        this.editorMode=false;
        this.write('\n');
    } catch (e) {
        console.warn('import error: ', e.toString());
        this.editorMode=false;
        this.displayPrompt();
    }
  }
});

repl_server.defineCommand('edit', {
  help: 'edit transform in editor',
  action(what_to_edit) {

    this.clearBufferedCommand();
    this.editorMode=true;
    let editor = process.env.EDITOR || 'vi';
    let tempName = tmp.tmpNameSync({postfix: '.dtl'});
    let data_to_output = repl_state.transform;
    let transform, input_data;
    if (what_to_edit == 'input') {
        data_to_output = repl_state.input_data;
    }
    if (typeof data_to_output != "string") {
        data_to_output = json_stringify(data_to_output, 4);
    }
    fs.writeFileSync(tempName, data_to_output);

    let child = child_process.spawnSync(editor, [tempName], {
        stdio: 'inherit'
    });

    this.editorMode=true;
    if (what_to_edit == 'input') {
        let input = load_input_from_file(repl_state, tempName);
        set_input_data(this, repl_state, input);
    } else {
        transform = import_transform(repl_state, tempName, true);
        repl_state.transform = transform;
    }
    this.editorMode=false;
    //this.write('\n');
    fs.unlinkSync(tempName);
    this.displayPrompt();
  }
});
