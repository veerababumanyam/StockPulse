#!/bin/bash

# Update frontend-guidelines.mdc
cat > .cursor/rules/frontend-guidelines.mdc << 'EOF'
---
description: Frontend development guidelines for StockPulse
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: true
---

# StockPulse Frontend Guidelines

## Component Architecture

1. **Component Organization**
   - Use atomic design principles (atoms, molecules, organisms, templates, pages)
   - Keep components focused on a single responsibility
   - Extract reusable parts into separate components
   - Use composition over inheritance

2. **Component Structure**
   - Define prop interfaces at the top of the file
   - Use function components with explicit return types
   - Use React.memo() for performance-critical components
   - Destructure props for clarity
EOF

echo "Updated frontend-guidelines.mdc"

# Update stockpulse-general.mdc
cat > .cursor/rules/stockpulse-general.mdc << 'EOF'
---
description: General architecture principles and code standards for StockPulse
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: true
---

# StockPulse General Guidelines

You are helping develop StockPulse, an advanced AI-powered stock analysis platform that leverages specialized AI agents to provide 360-degree analysis of stocks (technical, fundamental, sentiment, and alternative data) across multiple trading timeframes.
EOF

echo "Updated stockpulse-general.mdc"

# Update all other rule files
for file in .cursor/rules/*.mdc; do
  filename=$(basename "$file" .mdc)
  
  # Skip the already updated files
  if [[ "$filename" == "frontend-guidelines" || "$filename" == "stockpulse-general" ]]; then
    continue
  fi
  
  # Add metadata header to each file
  description=$(echo $filename | sed 's/-/ /g')
  
  echo "---" > "$file.new"
  echo "description: $description guidelines for StockPulse" >> "$file.new"
  echo "globs: [\"**/*.ts\", \"**/*.tsx\", \"**/*.js\", \"**/*.jsx\"]" >> "$file.new"
  echo "alwaysApply: true" >> "$file.new"
  echo "---" >> "$file.new"
  
  # Get the original content from line 5 onwards (skipping existing metadata if any)
  if grep -q "^---" "$file"; then
    # Skip everything between the first and second "---" lines
    sed -n '/^---/,/^---/!p;//!p' "$file" | tail -n +2 >> "$file.new"
  else
    # If no metadata, just copy the original content
    cat "$file" >> "$file.new"
  fi
  
  # Replace the original file
  mv "$file.new" "$file"
  echo "Updated $file"
done 