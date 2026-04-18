import re

with open(r'e:\SmartMallManagementSystem\frontend\src\styles\global.css', 'r', encoding='utf-8') as f:
    css = f.read()

# match block
blocks = re.findall(r'(\.[a-zA-Z0-9_-]+)\s*\{([^}]+)\}', css)
flex_nowrap = []
for name, content in blocks:
    if 'display: flex' in content and 'flex-wrap' not in content:
        flex_nowrap.append(name)

print("Flex classes without wrap:", flex_nowrap[:20])
