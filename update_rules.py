#!/usr/bin/env python3
import os
import re

rules_dir = '.cursor/rules'
rule_files = [f for f in os.listdir(rules_dir) if f.endswith('.mdc')]

for rule_file in rule_files:
    file_path = os.path.join(rules_dir, rule_file)
    
    # Generate description based on filename
    rule_name = os.path.splitext(rule_file)[0]
    description = ' '.join([word.capitalize() for word in rule_name.split('-')]) + ' guidelines for StockPulse'
    
    # Read the original content
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove existing metadata if present
    if content.startswith('---'):
        # Find the second --- marker
        second_marker = content.find('---', 3)
        if second_marker != -1:
            content = content[second_marker + 3:].strip()
    
    # Create the new metadata
    metadata = f"""---
description: {description}
globs: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
alwaysApply: true
---
"""
    
    # Write the updated content
    with open(file_path, 'w') as f:
        f.write(metadata + content)
    
    print(f"Updated {rule_file}")

print("All Cursor rule files have been updated with alwaysApply: true") 