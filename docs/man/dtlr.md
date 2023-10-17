# DTLR(1) - DTL REPL Interpreter

## SYNOPSIS

`dtlr [options] [inputfile]`

## DESCRIPTION

The `dtlr` command-line tool runs a REPL (Read-Eval-Print Loop) environment for testing and experimenting with DTL transforms. It allows you to interactively apply DTL expressions to explore and manipulate input data.

## OPTIONS

- `-h`:
  Print the help message.

- `-a`:
  Process the inputfile as arrays.

- `-p`:
  Print the parsed input data immediately upon start.

- `--init <init_file>`:
  Initialize DTL with the contents of `init_file`.

- `-V, --version`:
  Print DTL version and exit

## REPL ENVIRONMENT

Upon starting the `dtlr` command, you will enter the REPL environment, and the initial data from the JSON data in `inputfile` will be loaded if provided.

You will receive a message similar to this:

```
DTL: Copyright (c) 2013-2022 Jay Kuri
Welcome to the DTL REPL interpreter.

To load input data, use: .load filename
To edit the transform in the editor, type: .edit
Type .help for help

Enter a transform at the prompt to apply the transform.
Input data: object size: ~40 bytes
DTL>
```

In the REPL environment, you can issue DTL expressions to explore the input data and perform transformations. Additionally, the following commands are available:

- `.clear`:
  Clear the REPL state.

- `.edit`:
  Edit the transform in the editor.

- `.exit`:
  Exit the REPL environment.

- `.help`:
  Show the help message.

- `.help topic`:
  Get help on a specific topic.

- `.helpers`:
  Show available helpers.

- `.import fname`:
  Import a transform from a file.

- `.load fname`:
  Load input data from a file.

- `.loada fname`:
  Load input data from a file as an array.

- `.reload`:
  Reload the most recently loaded input file.

- `.save fname`:
  Save the result to a file.

- `.i`:
  Print the current input data.

- `.t`:
  Print the current transform.

- `.use`:
  Replace the input data with the result of the current transform.

- `.use expr`:
  Replace the input data with the result of the specified expression.

## EXAMPLES

To illustrate the usage of `dtlr`, here are a few examples:

- Start `dtlr` with a JSON input file:
  ```
  dtlr input.json
  ```

- Start `dtlr` with an array input file:
  ```
  dtlr -a array_input.json
  ```

- Start `dtlr` with input file and print parsed data immediately:
  ```
  dtlr -p input.json
  ```

## SEE ALSO

- `dtl(1)`: Data Transformation Language command-line tool.

## AUTHOR

dtl-js is developed and maintained by Jay Kuri

## COPYRIGHT

Copyright © 2023 Jay Kuri.
This is free software. You may redistribute copies of it under the terms of the Lesser GPL license v2.1 License <https://opensource.org/license/lgpl-2-1/>

