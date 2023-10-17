# Define the marked-man command
MARKED_MAN = ../../node_modules/marked-man/bin/marked-man.js

# Define the source directory where the Markdown files are located
SRC_DIR = .

# Define the target directory where the man pages will be generated
TARGET_DIR = .

# Get a list of all the Markdown files in the source directory
MARKDOWN_FILES := $(wildcard $(SRC_DIR)/*.md)

# Convert Markdown files to man pages
MAN_PAGES := $(patsubst $(SRC_DIR)/%.md,$(TARGET_DIR)/%.1,$(MARKDOWN_FILES))

# Default target
all: $(MAN_PAGES)

# Rule to convert Markdown files to man pages
$(TARGET_DIR)/%.1: $(SRC_DIR)/%.md
	$(MARKED_MAN) $< > $@

# Clean generated man pages
clean:
	rm -f $(MAN_PAGES)

.PHONY: all clean

