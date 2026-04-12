import os
import re

base_path = r'c:\Users\Hp\Bara-Prototype'

# Add to EventsPage.tsx
events_file = os.path.join(base_path, r'src\pages\EventsPage.tsx')
with open(events_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
if 'SectionNavButton' not in content:
    content = re.sub(
        r"(import { useShare } from '@/context/ShareContext';)",
        r"\1\nimport { SectionNavButton } from '@/components/SectionNavButton';",
        content
    )
    
    # Find the filters section and add button near the search/filter controls
    # Look for the search input area and add button there
    content = re.sub(
        r'(<div className="flex flex-col md:flex-row gap-4 mb-6">.*?<div className="flex-1 relative">.*?<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />)',
        r'<div className="flex items-center justify-between mb-4">\n                <h2 className="text-2xl font-bold text-gray-900">Events</h2>\n                <SectionNavButton section="events" />\n              </div>\n\n              \1',
        content,
        flags=re.DOTALL
    )

with open(events_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Added SectionNavButton to EventsPage.tsx")

# Add to BlogPage.tsx
blog_file = os.path.join(base_path, r'src\pages\BlogPage.tsx')
if os.path.exists(blog_file):
    with open(blog_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'SectionNavButton' not in content:
        # Add import after other imports
        content = re.sub(
            r"(import.*?from.*?;)\n(export const BlogPage)",
            r"\1\nimport { SectionNavButton } from '@/components/SectionNavButton';\n\n\2",
            content
        )
        
        # Add button near the top of the page
        content = re.sub(
            r'(<div className="max-w-7xl mx-auto px-4.*?">)',
            r'\1\n          <div className="flex items-center justify-between mb-6">\n            <h1 className="text-3xl font-bold">Blog</h1>\n            <SectionNavButton section="blog" />\n          </div>',
            content,
            count=1
        )
    
    with open(blog_file, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Added SectionNavButton to BlogPage.tsx")

print("\nAll section nav buttons added!")
