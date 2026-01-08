#!/bin/bash

# List all pending revisions
# Usage: ./scripts/list-revisions.sh

echo "📋 Pending Revisions"
echo "══════════════════════════════════════"
echo ""

REVISION_DIR="revisions"
COUNT=0

# Find all markdown files except README and TEMPLATE
for file in "$REVISION_DIR"/*.md; do
    # Skip if no files found
    [ -e "$file" ] || continue
    
    # Skip README and TEMPLATE
    basename=$(basename "$file")
    if [[ "$basename" == "README.md" ]] || [[ "$basename" == "TEMPLATE.md" ]]; then
        continue
    fi
    
    COUNT=$((COUNT + 1))
    echo "📄 $basename"
    
    # Show first line (title) and priority if exists
    head -n 5 "$file" | grep -E "^#|Priority:" | head -n 2
    echo ""
done

if [ $COUNT -eq 0 ]; then
    echo "✅ No pending revisions!"
else
    echo "══════════════════════════════════════"
    echo "Total: $COUNT revision file(s)"
fi

echo ""
