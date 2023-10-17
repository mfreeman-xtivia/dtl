function Transformer() {

    this.setup_editors = function() {
        this.editors = {};
        this.editors.input= ace.edit("input_data_editor");
        this.editors.input.setTheme("ace/theme/cobalt");
        this.editors.input.getSession().setUseSoftTabs(true);
        this.editors.input.getSession().setMode("ace/mode/json");
        this.editors.input.setOption("showPrintMargin", false)

        this.editors.transform= ace.edit("transform_editor");
        this.editors.transform.setTheme("ace/theme/cobalt");
        this.editors.transform.getSession().setUseSoftTabs(true);
        this.editors.transform.getSession().setMode("ace/mode/json");
        this.editors.transform.setOption("showPrintMargin", false)

        this.editors.result= ace.edit("result_editor");
        this.editors.result.setTheme("ace/theme/cobalt");
        this.editors.result.getSession().setUseSoftTabs(true);
        this.editors.result.getSession().setMode("ace/mode/json");
        this.editors.result.setReadOnly(true);
        this.editors.result.setOption("showPrintMargin", false)

        
        this.restore_data(this.editors.input, 'input_data')
        this.editors.input.on('change', (e) => {
            console.log(e);
            this.save_data(this.editors.input, 'input_data');
        });
        this.editors.input.on('blur', (e) => {
            console.log(e);
            this.save_data(this.editors.input, 'input_data');
        });

        this.restore_data(this.editors.transform, 'transform')
        this.editors.transform.on('change', (e) => {
            console.log(e);
            this.save_data(this.editors.transform, 'transform');
        });
        this.editors.transform.on('blur', (e) => {
            console.log(e);
            this.save_data(this.editors.transform, 'transform');
        });
    }

    this.get_editor_contents = function(editor_name) {
        let data = this.editors[editor_name].getValue();
        let result;
        try {
            result = JSON.parse(data);
        } catch(e) {
            result = data;
        }
        return result;
    }
    
    this.set_editor_contents = function(editor_name, new_data) {
        this.editors[editor_name].setValue(new_data);
//        console.log(this.editors[editor_name].getSession());
        this.editors[editor_name].clearSelection();
    }

    this.search_in_multiline = function(source_text, needle) {
        let lines = source_text.split("\n");
        let pos;
        let result = { line: undefined, column: undefined};
        for (let i = 0; i < lines.length; i++) {
            pos = lines[i].indexOf(needle);
            if (pos != -1) {
                result.line = i;
                result.column = pos;
            }
        }
        return result;
    }

    this.do_transformation = function() {
        let result;
        let input = this.get_editor_contents('input');
        let transform = this.get_editor_contents('transform');
        //document.querySelectorAll('#transform_error')[0].style.display = 'none';
        console.log(input);
        console.log(transform);
        if (typeof input != 'undefined' && typeof transform != 'undefined') {
            try {
                DTL.clear_expression_cache();
                result = DTL.apply(input, transform);
                this.editors.result.setValue(stringify_compact(result));
                this.editors.result.gotoLine(1,1);
                this.editors.result.getSession().setScrollTop(0);
            } catch (e) {
                console.log(e);
    //            document.querySelectorAll('#transform_error')[0].style.display = 'block';
    //            document.querySelectorAll('#transform_error>p')[0].innerHTML = e.toString().replace("\n","<br>\n");
                this.mark_error(this.editors.transform, e.parsing, e);
                this.editors.result.setValue('');
            }

        }
    }

    this.mark_error = function(editor, string, err) {
        console.log('Marking Error: ' + string);
        editor.focus();
        var data = editor.getValue();
        var pos = this.search_in_multiline(data, "(:"+string+":)");
        console.log(pos);
        var annotation = {
            row: pos.line,
            column: pos.column+err.start,
            text: err.toString(),
            type: 'error'
        };
        editor.getSession().setAnnotations([annotation]);
        editor.gotoLine(annotation.row+1, pos.column+1+err.start);
    //            var f = editor.find(string, { range: null, regExp: false, start: start_of_buffer} );
        // console.log(f);
    }

    this.save_data = function(editor, prefix) {
        var pos = editor.getCursorPosition();
        //console.log(pos);
        localStorage.setItem(prefix+'_text', editor.getValue());
        localStorage.setItem(prefix+'_position', JSON.stringify(pos));
    }

    this.restore_data = function (editor, prefix, def) {
        var pos;
        editor.setValue(localStorage.getItem(prefix + '_text')|| def || '');
        var data = localStorage.getItem(prefix + '_position');
        if (typeof data == 'string') {
            try {
                pos = JSON.parse(data);
            } catch(e) {
                pos = { row: 0, column: 0};
            }
            editor.gotoLine(pos.row+1, pos.column);
        }
    }

    this.pretty_print = function(obj) {
        return JSON.stringify(obj, null, 4);
    }

    this.populate_examples = function() {
        let selector = document.querySelectorAll('#transformer_example_select')[0];
        let existing_options = document.querySelectorAll('#transformer_example_select option');
        existing_options.forEach(function(item) {
            item.remove();
        });
        
        Transformer_examples.forEach(function(item, index) {
            let option = new Option(item.name, index);
            selector.add(option);
        });
        this.example_selector_changed({ target: selector});
    }

    // runs when user selects a different set of example data
    this.example_selector_changed = function(e) {
        console.log(e.target);
        //window.location.hash = '#trydtlui';
        let selector = e.target;
        let option = selector.options[selector.selectedIndex].value;
        console.log("option " + option + " selected");
        console.log(Transformer_examples[option]);
        let selected_example = Transformer_examples[option];
        let description_paragraph = document.querySelector('#example-description');
        let description = selected_example.description.replace(/\`([^\`]*)\`/g, '<span class="code">$1</span>');
        description_paragraph.innerHTML =description; // selected_example.description;
        let input_content = this.get_editor_contents('input');
        let transform_content = this.get_editor_contents('transform');

        if (selected_example.dont_override_input != true || (input_content.length + transform_content.length == 0)) {
            if (typeof selected_example.input_data != 'undefined') {
                this.set_editor_contents('input', stringify_compact(selected_example.input_data, {maxLength: 64}));
            } else if (typeof selected_example.input_data_url != 'undefined') {
                this.set_editor_contents('input', '"// loading..."');
                this.fetch_json(selected_example.input_data_url, (data) => {
                    this.set_editor_contents('input', stringify_compact(data, {maxLength: 64}));
                });
            }
            if (typeof selected_example.transform != 'undefined') {
                this.set_editor_contents('transform', stringify_compact(selected_example.transform));
            }

        }
        this.set_editor_contents('result', '');
    }

    this.fetch_json = async function(url, cb) {
        const response = await fetch(url);
        const result = await response.json();
        cb(result);
    }

    return this;

}
