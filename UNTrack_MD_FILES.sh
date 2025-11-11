#!/bin/bash

# Script to untrack all .md files from git
# Run this if you want to remove already-tracked .md files from git

echo "Untracking all .md files from git..."
echo ""

# Find all tracked .md files
TRACKED_MD_FILES=$(git ls-files | grep "\.md$")

if [ -z "$TRACKED_MD_FILES" ]; then
    echo "No .md files are currently tracked."
else
    echo "Found the following tracked .md files:"
    echo "$TRACKED_MD_FILES"
    echo ""
    read -p "Do you want to untrack these files? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git rm --cached $TRACKED_MD_FILES
        echo ""
        echo "✅ All .md files have been untracked."
        echo "They will remain in your local filesystem but won't be committed to git."
    else
        echo "Cancelled."
    fi
fi

