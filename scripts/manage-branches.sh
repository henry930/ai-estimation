#!/bin/bash

# Branch Management Script
# This script helps organize branches by rebasing from main and merging

set -e

echo "🌿 Branch Management Script"
echo "============================"
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"
echo ""

# Fetch latest from origin
echo "📥 Fetching latest from origin..."
git fetch origin
echo ""

# Get list of local branches (excluding main and current)
BRANCHES=$(git branch | grep -v "main" | grep -v "\*" | sed 's/^[ \t]*//')

echo "📋 Found local branches:"
echo "$BRANCHES"
echo ""

# Function to check if branch is behind main
check_branch_status() {
    local branch=$1
    
    # Get commit counts
    local behind=$(git rev-list --count ${branch}..origin/main 2>/dev/null || echo "0")
    local ahead=$(git rev-list --count origin/main..${branch} 2>/dev/null || echo "0")
    
    echo "Branch: $branch"
    echo "  Ahead of main: $ahead commits"
    echo "  Behind main: $behind commits"
    
    if [ "$behind" -gt 0 ]; then
        echo "  ⚠️  Needs rebase"
        return 1
    else
        echo "  ✅ Up to date"
        return 0
    fi
}

# Function to rebase and merge branch
rebase_and_merge() {
    local branch=$1
    
    echo ""
    echo "🔄 Processing branch: $branch"
    echo "================================"
    
    # Checkout the branch
    git checkout $branch
    
    # Rebase from main
    echo "  📌 Rebasing from main..."
    if git rebase origin/main; then
        echo "  ✅ Rebase successful"
        
        # Check if there are any commits to merge
        local ahead=$(git rev-list --count origin/main..$branch 2>/dev/null || echo "0")
        
        if [ "$ahead" -gt 0 ]; then
            echo "  📦 Branch has $ahead commits to merge"
            
            # Checkout main
            git checkout main
            git pull origin main
            
            # Merge the branch
            echo "  🔀 Merging $branch into main..."
            if git merge --no-ff $branch -m "Merge branch '$branch'"; then
                echo "  ✅ Merge successful"
                
                # Push to origin
                echo "  📤 Pushing to origin..."
                git push origin main
                
                echo "  ✅ Branch $branch merged and pushed"
            else
                echo "  ❌ Merge failed - please resolve conflicts manually"
                return 1
            fi
        else
            echo "  ℹ️  No new commits to merge"
        fi
    else
        echo "  ❌ Rebase failed - please resolve conflicts manually"
        git rebase --abort
        return 1
    fi
}

# Interactive mode
echo "🤔 What would you like to do?"
echo ""
echo "1. Check status of all branches"
echo "2. Rebase and merge a specific branch"
echo "3. Rebase and merge all branches (interactive)"
echo "4. Exit"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📊 Checking all branches..."
        echo ""
        for branch in $BRANCHES; do
            check_branch_status $branch
            echo ""
        done
        ;;
    2)
        echo ""
        echo "Available branches:"
        select branch in $BRANCHES; do
            if [ -n "$branch" ]; then
                rebase_and_merge $branch
                break
            fi
        done
        ;;
    3)
        echo ""
        for branch in $BRANCHES; do
            check_branch_status $branch
            if [ $? -eq 1 ]; then
                read -p "Rebase and merge $branch? (y/n): " answer
                if [ "$answer" = "y" ]; then
                    rebase_and_merge $branch
                fi
            fi
            echo ""
        done
        ;;
    4)
        echo "👋 Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Return to original branch
git checkout $CURRENT_BRANCH
echo ""
echo "✅ Done! Returned to $CURRENT_BRANCH"
