import os
import re

pages_dir = 'production/pages'
processed = 0

for filename in os.listdir(pages_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(pages_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove HTML comments
        cleaned = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        
        processed += 1
        if processed % 10 == 0:
            print(f"✓ Processed {processed} files...")

print(f"✓ Cleaned comments from {processed} HTML files")
