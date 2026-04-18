import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # match minmax(150px, 1fr) or similar and replace with minmax(min(100%, 150px), 1fr)
    # Be careful not to replace something already having min(100%, ...)
    
    # regex pattern
    pattern = r'minmax\((\d+px),\s*1fr\)'
    new_content = re.sub(pattern, r'minmax(min(100%, \1), 1fr)', content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Fixed {filepath}')

frontend_dir = r'e:\SmartMallManagementSystem\frontend\src'
for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            fix_file(os.path.join(root, file))
