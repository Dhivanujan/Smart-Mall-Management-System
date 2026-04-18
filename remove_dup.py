import re
with open(r'e:\SmartMallManagementSystem\frontend\src\styles\global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace duplicated overflow-x: auto;
css = css.replace('\n  overflow-x: auto;\n  overflow-x: auto;', '\n  overflow-x: auto;')

with open(r'e:\SmartMallManagementSystem\frontend\src\styles\global.css', 'w', encoding='utf-8') as f:
    f.write(css)
