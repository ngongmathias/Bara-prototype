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
    
    # Add import for MarketplaceNav if not already there
    if 'MarketplaceNav' not in content:
        # Find the Footer import line and add MarketplaceNav import after it
        content = re.sub(
            r"(import Footer from '@/components/Footer';)",
            r"\1\nimport { MarketplaceNav } from '@/components/marketplace/MarketplaceNav';",
            content
        )
        
        # Add MarketplaceNav after TopBannerAd in all three places (loading, not found, main)
        # Pattern 1: After TopBannerAd in loading state
        content = re.sub(
            r'(<Header />\s*<TopBannerAd />)',
            r'\1\n        <MarketplaceNav />',
            content
        )
        
        # Pattern 2: After TopBannerAd in main return (different indentation)
        content = re.sub(
            r'(<Header />\s*<TopBannerAd />\s*\n\s*<main)',
            r'<Header />\n      <TopBannerAd />\n      <MarketplaceNav />\n\n      <main',
            content
        )
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Added MarketplaceNav to: {file_path}")

print("\nAll detail pages updated with MarketplaceNav!")
