#!/bin/bash

# Fast notification with sound
# Usage: ./scripts/beep.sh

# Play system sound
afplay /System/Library/Sounds/Glass.aiff &

# Print notification
echo ""
echo "🔔 ═══════════════════════════════════════"
echo "   ✅ TASK COMPLETED - Ready for review!"
echo "═══════════════════════════════════════"
echo ""
