#!/bin/bash

# Notification script for task completion
# Usage: ./scripts/notify-complete.sh "Task description"

MESSAGE="${1:-Task completed}"

# Play system beep
echo -e "\a"

# macOS notification
osascript -e "display notification \"$MESSAGE\" with title \"AI Assistant\" sound name \"Glass\""

# Also speak it (optional - comment out if annoying)
say "$MESSAGE"

# Print to console
echo "✅ $MESSAGE"
