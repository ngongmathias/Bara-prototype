# Country-Specific Event Links - User Guide

## Overview

You can now share links that automatically filter events by country! This makes it easy to share relevant events with specific audiences.

---

## How It Works

### **Automatic Filtering**

When someone visits a country-specific link, the events page automatically shows only events from that country.

### **Link Format**

```
https://officephase.com/events?country={country_name}
```

---

## Example Links

### **Rwanda Events**
```
https://officephase.com/events?country=rwanda
```

### **Kenya Events**
```
https://officephase.com/events?country=kenya
```

### **Uganda Events**
```
https://officephase.com/events?country=uganda
```

### **Tanzania Events**
```
https://officephase.com/events?country=tanzania
```

### **All Events (No Filter)**
```
https://officephase.com/events
```

---

## How to Use

### **Method 1: Share Button (Easiest)**

1. Go to the Events page
2. Select a country from the country selector in the navbar
3. Click the **"Share [Country] Events"** button at the top
4. The link is automatically copied to your clipboard
5. Paste and share the link anywhere!

### **Method 2: Manual Link Creation**

Create your own link by adding `?country=` to the events URL:

```
https://officephase.com/events?country=rwanda
```

**Important:** Use lowercase country names in the URL.

---

## Use Cases

### **Marketing Campaigns**
- Share Rwanda-specific events in Rwanda marketing materials
- Target Kenya events to Kenyan audiences
- Country-specific email campaigns

### **Social Media**
- Post country-specific event links on local Facebook groups
- Share on Twitter/X with country hashtags
- Instagram stories with local event links

### **Partnerships**
- Send partners links to events in their country
- Collaborate with local organizations
- Event organizer outreach

### **Email Newsletters**
- Send subscribers events from their country
- Segment email lists by country
- Personalized event recommendations

---

## Technical Details

### **How Filtering Works**

The link uses a URL parameter `?country=` that:
1. Reads the country name from the URL
2. Filters events to show only those from that country
3. Works alongside other filters (category, date, search)

### **Case Insensitive**

Country names are case-insensitive:
- `?country=Rwanda` ✅
- `?country=rwanda` ✅
- `?country=RWANDA` ✅

All work the same!

### **Combining with Other Filters**

You can combine country filtering with other parameters:

**Rwanda Music Events:**
```
https://officephase.com/events?country=rwanda&category=music
```

**Kenya Events This Weekend:**
```
https://officephase.com/events?country=kenya
(Then use the "Weekend" filter button)
```

---

## Best Practices

### **✅ Do:**
- Use country-specific links for targeted marketing
- Share links on country-specific social media groups
- Include in email signatures for local teams
- Use in partnership communications

### **❌ Don't:**
- Don't use misspelled country names
- Don't share links with wrong country to wrong audience
- Don't forget to test the link before sharing widely

---

## Troubleshooting

### **Link shows no events?**
- Check the country name spelling
- Verify events exist for that country in the database
- Try removing the `?country=` parameter to see all events

### **Link not filtering correctly?**
- Ensure country name matches exactly (case doesn't matter)
- Clear browser cache and try again
- Check if events have country information in database

### **Want to share all events?**
- Just use: `https://officephase.com/events`
- Or click "Share All Events" button

---

## Future Enhancements

Planned features:
- City-specific links (`?city=kigali`)
- Category + country links (`?country=rwanda&category=music`)
- Date range links
- QR codes for country-specific events
- Analytics tracking for shared links

---

## Support

Need help with country-specific links?
- Email: support@officephase.com
- Check the Events page for the "Share" button
- Contact your account manager

---

*Last updated: January 2026*
