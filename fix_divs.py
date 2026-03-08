import re
import os

path = r'd:\CODE\tpm\components\production\ComponentConfig.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

opens = len(re.findall(r'<div', content))
closes = len(re.findall(r'</div', content))
missing = opens - closes

print(f"Opens: {opens}, Closes: {closes}, Missing: {missing}")

if missing > 0:
    # Add missing closing tags before the end of the return
    # Find the last </table> and add them after it
    marker = '      </table>'
    if marker in content:
        replacement = marker + '\n' + '    </div>' * missing
        content = content.replace(marker, replacement)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print("Fixed.")
else:
    print("No missing closes.")
