#!/bin/bash

# Quick notification script for task completion
# Usage: ./scripts/notify.sh "Task description"

MESSAGE="${1:-Task completed}"

# Play system beep (3 times for attention)
echo -e "\a\a\a"

# macOS notification with sound
osascript -e "display notification \"$MESSAGE\" with title \"✅ AI Assistant\" sound name \"Glass\"" 2>/dev/null &

# Print to console
echo "🔔 ✅ $MESSAGE"
