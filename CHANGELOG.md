# DTL Changelog

## DTL v4.2.1

 * Fix regression in `to_json()` pretty printing. Add tests for pretty printing.

## DTL v4.2.0

 * Add third argument `to_json()` helper to allow undefined to be preserved in output as `null`

## DTL v4.1.0

 * Switch code and docs to `DTL.apply()` by default (from `DTL.apply_transform()`, which still works)
 * `dtl` cli tool - if we can't clearly determine the type of input data, try to parse as JSON.
 * Add `tofixed()` helper function
 * Add json-schema example to website

## DTL v4.0.1

 * dtl CLI now has option (-N) to preserve undefined in JSON output 

## DTL v4.0.0

 * Fix bug preventing access to keys containing periods 
 * `dtl` cli tool - Make YAML output go full depth
 * Update YAML module


## DTL v3.4.1

 * Fix error message on failed helper calls. 
 * Make sure we blow up usefully with uuid v3 and v5 without a usable namespace

## DTL v3.4.0 

 * Update DTL-helpers docs
 * add $extra as additional option to grep() helper
 * add `undef` as a keyword meaning `undefined`

## DTL v3.3.0

 * Add regex() helper and related tests, revise regex handling to be more versatile

## DTL v3.2.0

 * Add shortcut version of transform call. 
 * Fix docs for pairs.
 * deprecate quoted regexes
 * revise test for invalid hash algorithm
 * Correct bug where passing an invalid hash type to hash() resulted in an empty string instead of undefined
 * Add sublime-text syntax highlighter

## DTL v3.1.1

 * Correct bug where passing an invalid hash type to hash results in an empty string (should return undefined)

## DTL v3.1.0

 * Add and expose `transform_extractor` functionality

## DTL v3.0.0

 * Change `derive()` helper to operate on any data type. Previous array behavior is available by using map and calling derive within the map transform.
