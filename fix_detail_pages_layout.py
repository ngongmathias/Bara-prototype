import os
import re

# List of all detail page files
detail_files = [
    r'src\pages\marketplace\details\BusinessDetail.tsx',
    r'src\pages\marketplace\details\ElectronicsDetail.tsx',
    r'src\pages\marketplace\details\FashionDetail.tsx',
    r'src\pages\marketplace\details\FurnitureDetail.tsx',
    r'src\pages\marketplace\details\HobbiesDetail.tsx',
    r'src\pages\marketplace\details\JobsDetail.tsx',
    r'src\pages\marketplace\details\KidsDetail.tsx',
    r'src\pages\marketplace\details\MotorsDetail.tsx',
    r'src\pages\marketplace\details\PetsDetail.tsx',
    r'src\pages\marketplace\details\PropertyDetail.tsx',
    r'src\pages\marketplace\details\ServicesDetail.tsx',
]

base_path = r'c:\Users\Hp\Bara-Prototype'

for file_path in detail_files:
    full_path = os.path.join(base_path, file_path)
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace all occurrences of TopBannerAd before Header with Header before TopBannerAd
    # Pattern 1: In loading state
    content = re.sub(
        r'(<div className="min-h-screen bg-gray-50">\s*)<TopBannerAd />\s*<Header />',
        r'\1<Header />\n        <TopBannerAd />',
        content
    )
    
    # Pattern 2: In not found state
    content = re.sub(
        r'(<div className="min-h-screen bg-gray-50">\s*)<TopBannerAd />\s*<Header />',
        r'\1<Header />\n        <TopBannerAd />',
        content
    )
    
    # Pattern 3: In main return
    content = re.sub(
        r'(<div className="min-h-screen bg-gray-50 font-roboto">\s*)<TopBannerAd />\s*<Header />',
        r'\1<Header />\n      <TopBannerAd />',
        content
    )
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed: {file_path}")

print("\nAll detail pages updated!")
