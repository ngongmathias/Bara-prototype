"""
Extract Ghana events from Beyond The Return PDF
"""
import PyPDF2
import json
import re
from datetime import datetime

pdf_file = r"C:\Users\Hp\Downloads\Beyond The Return.pdf"

try:
    # Open and read the PDF
    with open(pdf_file, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        print(f"✅ Successfully opened PDF")
        print(f"📄 Total pages: {total_pages}")
        print("\n" + "="*80)
        
        # Extract text from all pages
        all_text = ""
        for page_num in range(total_pages):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()
            all_text += text + "\n\n"
            
            # Print first 2 pages to see structure
            if page_num < 2:
                print(f"\n--- Page {page_num + 1} ---")
                print(text[:500])  # First 500 chars
        
        # Save full text for inspection
        output_file = r"C:\Users\Hp\Bara-Prototype\scripts\beyond_return_text.txt"
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(all_text)
        
        print(f"\n✅ Full text saved to: {output_file}")
        print(f"📊 Total characters extracted: {len(all_text)}")
        
        # Try to identify event patterns
        print("\n" + "="*80)
        print("Looking for event patterns...")
        
        # Common event indicators
        date_patterns = [
            r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}',  # 12/31/2024
            r'[A-Z][a-z]+ \d{1,2},? \d{4}',     # December 31, 2024
            r'\d{1,2} [A-Z][a-z]+ \d{4}'        # 31 December 2024
        ]
        
        dates_found = []
        for pattern in date_patterns:
            matches = re.findall(pattern, all_text)
            dates_found.extend(matches)
        
        print(f"📅 Potential dates found: {len(set(dates_found))}")
        if dates_found:
            print("Sample dates:", list(set(dates_found))[:10])
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
