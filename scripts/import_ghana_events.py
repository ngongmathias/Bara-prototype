"""
Import Ghana events from Beyond The Return Excel file
"""
import pandas as pd
import json
from datetime import datetime

# Read the Excel file
excel_file = r"C:\Users\Hp\Downloads\PopUp ads\AFRIKANEKT_TOURKANEKT_Kigali_29082020.xlsx12.xlsx"

try:
    # Try reading the Excel file
    df = pd.read_excel(excel_file)
    
    print(f"✅ Successfully read Excel file")
    print(f"📊 Total rows: {len(df)}")
    print(f"📋 Columns: {list(df.columns)}")
    print("\n" + "="*80)
    print("First few rows:")
    print(df.head())
    print("\n" + "="*80)
    
    # Save as JSON for easier inspection
    output_file = r"C:\Users\Hp\Bara-Prototype\scripts\ghana_events_preview.json"
    df.to_json(output_file, orient='records', indent=2)
    print(f"\n✅ Preview saved to: {output_file}")
    
except Exception as e:
    print(f"❌ Error reading Excel file: {e}")
    print("\nTrying alternative methods...")
    
    # Try with different engines
    try:
        df = pd.read_excel(excel_file, engine='openpyxl')
        print("✅ Success with openpyxl engine")
        print(f"Columns: {list(df.columns)}")
        print(df.head())
    except Exception as e2:
        print(f"❌ openpyxl failed: {e2}")
