import re

with open(r'e:\SmartMallManagementSystem\frontend\src\styles\global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace occurrences of .data-table-wrapper blocks
# that contain 'overflow: hidden;' to include 'overflow-x: auto;'
new_css = re.sub(
    r'(\.data-table-wrapper\s*\{[^}]*?overflow:\s*hidden;)([^}]*?\})',
    r'\1\n  overflow-x: auto;\2',
    css,
    flags=re.MULTILINE
)

with open(r'e:\SmartMallManagementSystem\frontend\src\styles\global.css', 'w', encoding='utf-8') as f:
    f.write(new_css)
