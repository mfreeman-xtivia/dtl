PEG=peggy
UGLIFY=uglifyjs

.PHONY: test browser docs browser-crypto

all: lib/dtl-expression-syntax.js docs browser browser-crypto

docs: dist/DTL-Helpers.md

lib/dtl-expression-syntax.js: lib/dtl-expression-syntax.peg
	cat lib/disclaimer.txt > lib/dtl-expression-syntax.js && $(PEG) --cache -o - $< >> lib/dtl-expression-syntax.js

browser-crypto: dist/dtl-transform-browser.crypto.min.js

browser: dist/dtl-transform-browser.min.js

dist/dtl-transform-browser.min.js: dist/dtl-transform-browser.js
	cat dist/dtl-transform-browser.js |$(UGLIFY) -c >dist/dtl-transform-browser.min.js

dist/dtl-transform-browser.js: lib/*.js lib/dtl-expression-syntax.js
	browserify -r ./lib/dtl-crypto-helpers-browser.js:./dtl-crypto-helpers.js -i crypto -e lib/DTL-browser.js >dist/dtl-transform-browser.js

dist/dtl-transform-browser.crypto.min.js: dist/dtl-transform-browser.crypto.js
	cat dist/dtl-transform-browser.crypto.js |$(UGLIFY) -c >dist/dtl-transform-browser.crypto.min.js

dist/dtl-transform-browser.crypto.js: lib/*.js lib/dtl-expression-syntax.js
	browserify --standalone DTL lib/DTL.js >dist/dtl-transform-browser.crypto.js

dist/DTL-Helpers.md: lib/*.js utils/Helpers/*
	cd utils/Helpers/ && cp DTL-Helpers-Top.md ../../dist/DTL-Helpers.md && node generate-helper-docs.js >> ../../dist/DTL-Helpers.md 


test: lib/dtl-expression-syntax.js
	mocha test/

clean:
	rm -f lib/dtl-expression-syntax.js dist/*
