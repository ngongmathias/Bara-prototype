import os
import re

base_path = r'c:\Users\Hp\Bara-Prototype'

# List of marketplace pages to check and fix
marketplace_pages = [
    r'src\pages\marketplace\AllCategoriesPage.tsx',
    r'src\pages\marketplace\CartPage.tsx',
    r'src\pages\marketplace\CategoryPage.tsx',
    r'src\pages\marketplace\ClassifiedsPage.tsx',
    r'src\pages\marketplace\JobsPage.tsx',
    r'src\pages\marketplace\ListingDetailPage.tsx',
    r'src\pages\marketplace\MarketplaceStorefront.tsx',
    r'src\pages\marketplace\MotorsPage.tsx',
    r'src\pages\marketplace\MyAds.tsx',
    r'src\pages\marketplace\MyFavorites.tsx',
    r'src\pages\marketplace\MyPurchases.tsx',
    r'src\pages\marketplace\PropertyPage.tsx',
    r'src\pages\marketplace\PostListing.tsx',
    r'src\pages\marketplace\EditListing.tsx',
    r'src\pages\marketplace\StorefrontEditor.tsx',
]

for page_path in marketplace_pages:
    full_path = os.path.join(base_path, page_path)
    
    if not os.path.exists(full_path):
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if page has TopBannerAd before Header
    if '<TopBannerAd' in content and '<Header' in content:
        # Swap TopBannerAd and Header if TopBannerAd comes first
        # Pattern: <TopBannerAd /> followed by <Header />
        if content.find('<TopBannerAd') < content.find('<Header'):
            # Replace the pattern
            content = re.sub(
                r'(<TopBannerAd\s*/?>)\s*(<Header\s*/?>)',
                r'\2\n      \1',
                content
            )
            print(f"Fixed navbar position in: {page_path}")
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("\nAll marketplace pages checked and fixed!")
