#!/bin/bash

# Move a revision file to the completed directory
# Usage: ./scripts/complete-revision.sh <filename>

REVISION_DIR="revisions"
COMPLETED_DIR="revisions/completed"
FILE_NAME="$1"

if [ -z "$FILE_NAME" ]; then
    echo "❌ Error: Please specify a filename"
    echo "Usage: ./scripts/complete-revision.sh <filename>"
    exit 1
fi

# Add .md extension if missing
if [[ "$FILE_NAME" != *".md" ]]; then
    FILE_NAME="$FILE_NAME.md"
fi

SOURCE_FILE="$REVISION_DIR/$FILE_NAME"
DEST_FILE="$COMPLETED_DIR/$FILE_NAME"

if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: File '$SOURCE_FILE' not found"
    exit 1
fi

# Move the file
mv "$SOURCE_FILE" "$DEST_FILE"

# Play completion sound
./scripts/beep.sh

echo "✅ Revision '$FILE_NAME' marked as complete!"
echo "   Moved to: $COMPLETED_DIR/"
