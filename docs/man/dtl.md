# DTL(1) - Data Transformation Language command-line tool

## SYNOPSIS

`dtl [options] inputfile`

## DESCRIPTION

The `dtl` command-line tool processes input data of various formats and applies data transformation rules implemented in dtl-js.

## OPTIONS

- `-e, --execute '$.'`:
  Provide a transform expression on the command line.

- `-f, --transform-file <file>`:
  Load the transform expression from a file.

- `-n, --transform <name>`:
  Name of the transform to use (default: "out").

- `-a, --apply_to_array`:
  Apply the transform directly to each item in the input array, rather than the input as a whole.

- `-p, --pretty [n]`:
  Produce pretty JSON output indented by n spaces. If n is omitted, the default indentation is used.

- `-c, --condensed`:
  Produce condensed JSON output.

- `-N, --preserve-undefined`:
  Preserve `undefined` as `null` in JSON output.

- `--init <init_file>`:
  Initialize DTL with the contents of the `init_file`.

- `-m, --read-mode <mode>`:
  Specify the read mode for the input file.
  - `line`: Process line-by-line (default for CSV).
  - `all`: Process data as one large data structure.

- `-d, --delim <char>`:
  Specify the output delimiter character for CSV and Unix output.

- `-id, --idelim <char>`:
  Specify the input delimiter character for CSV and Unix input.

- `-o, --output-file <file>`:
  Place the output into the specified file instead of standard output.

- `-I, --input-type <type>`:
  Specify the input file type.
  - `auto`: Try to auto-determine the file type (default).
  - `csv`: Input file is CSV.
  - `csv-objects`: Input is CSV with column headers, turning each row into an object.
  - `json`: Input file is JSON.
  - `json-lines`: Input file has multiple JSON records, one per line.
  - `yaml`: Input file is YAML.
  - `unix`: Input data is whitespace-separated plaintext, like standard Unix CLI tools.

- `-O, --output-type <type>`:
  Specify the type of output to produce.
  - `auto`: Default, produce the same type of output as the input.
  - `csv`: Produce CSV data.
  - `csv-objects`: Produce CSV data with column headers based on objects.
  - `json`: Produce JSON.
  - `json-lines`: Produce multiple JSON records, one per line.
  - `yaml`: Produce YAML.
  - `unix`: Produce space-separated values.

- `-u, --unix`:
  Accept Unix-style plaintext as input and produce plaintext output. Unix mode is the default when taking input from stdin.

- `-C, --csv-columns`:
  When producing CSV data, use the provided columns and order to produce the CSV. Will output a header with comma-separated columns provided. If the results are objects, the columns will be filled with data from the matching keys in the output objects. If the results are arrays, the columns are assumed to be correct and this serves only to create the header line.

- `-S --skipheader`:
  When outputting CSV, do not output a header line.

- `-s, --strict-json`:
  When reading JSON files, be strict. By default, dtl parses JSON files with JSON5. This flag forces parsing with vanilla JSON.

- `-V, --version`:
  Print DTL version and exit

## EXAMPLES

- `dtl -e '$name.toUpperCase()' data.json`:
  Transform the `name` field in the JSON file to uppercase.

- `dtl -f transform.dtl input.csv`:
  Apply the transform expression specified in the `transform.dtl` file to the CSV input file.

- `dtl -f transform_library.dtl -n validate  input.json`:
  Apply the transform named `validate` in the `transform.dtl` file to the data in `input.json`.

- `dtl -m all -I csv -O json input.csv`:
  Process the entire CSV input file, `input.csv` as one data structure and produce JSON output.

- `dtl -O csv -C first_name,last_name,primary_email input.json`:
  Process `input.json`, output CSV data on stdout using the fields `first_name`, `last_name` and `primary_email` 

- `dtl -o output.csv input.json`:
  Process `input.json`, output CSV data in `output.csv` including all fields found in input.json.

## SEE ALSO

- `dtl-js(1)`

## AUTHOR

dtl-js is developed and maintained by Jay Kuri

## COPYRIGHT

Copyright © 2023 Jay Kuri.
This is free software. You may redistribute copies of it under the terms of the Lesser GPL license v2.1 License <https://opensource.org/license/lgpl-2-1/>

