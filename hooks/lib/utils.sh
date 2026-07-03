#!/bin/bash
# Shared utilities for trekker hooks

# Extract count from toon format (paginated: "total: N" on first line)
get_toon_count() {
    grep -m1 '^total:' | sed 's/^total:[[:space:]]*//' || true
}

# Extract task IDs from toon paginated output (items section)
get_toon_task_ids() {
    grep -oE 'TREK-[0-9]+' | head -50 || true
}

# Compact task context: id, title, desc, last 3 comment lines, deps
print_task_context() {
    local id="$1"
    local out=$(trekker --toon task show "$id" 2>/dev/null)
    local title=$(echo "$out" | grep '^title:' | cut -d' ' -f2-)
    local desc=$(echo "$out" | grep '^description:' | cut -d' ' -f2-)

    echo "- $id: $title"
    [ -n "$desc" ] && [ "$desc" != "null" ] && echo "  desc: $desc"

    # Comments: paginated TOON has "items[N]{...}:" header then data rows with leading spaces
    local comment_output=$(trekker --toon comment list "$id" 2>/dev/null)
    local cc=$(echo "$comment_output" | get_toon_count); cc=${cc:-0}
    if [ "$cc" -gt 0 ]; then
        echo "  comments:"
        echo "$comment_output" | grep -E '^  ' | tail -3 | sed 's/^/    /'
    fi

    # Deps: TOON has "dependsOn[N]" and "blocks[N]" sections
    local deps=$(trekker --toon dep list "$id" 2>/dev/null)
    local dep_count=$(echo "$deps" | grep -c -E 'dependsOn\[|blocks\[' || true)
    if [ "$dep_count" -gt 0 ]; then
        echo "  deps:"
        echo "$deps" | grep -E '^  ' | sed 's/^/    /'
    fi
}
