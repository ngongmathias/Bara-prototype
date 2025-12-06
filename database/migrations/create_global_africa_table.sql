-- Create Global Africa table for diaspora communities and institutions
-- These are NOT countries but African diaspora locations (African Americans, HBCUs, etc.)

-- Create the global_africa table
CREATE TABLE IF NOT EXISTS global_africa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    code TEXT UNIQUE, -- e.g., 'US-AA' for African Americans, 'US-HBCU' for HBCUs
    flag_emoji TEXT, -- e.g., '🇺🇸' for USA-based entries
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the global_africa_info table (similar to country_info)
CREATE TABLE IF NOT EXISTS global_africa_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    global_africa_id UUID NOT NULL REFERENCES global_africa(id) ON DELETE CASCADE,
    description TEXT,
    location TEXT, -- e.g., "United States", "Brazil"
    population BIGINT,
    area_sq_km NUMERIC,
    
    -- Leadership & Organization
    leader_name TEXT, -- e.g., prominent community leaders
    organization_type TEXT, -- e.g., "Diaspora Community", "Educational Network"
    established_date TEXT,
    
    -- Demographics
    average_age NUMERIC,
    largest_city TEXT,
    largest_city_population BIGINT,
    
    -- Geographic Information
    latitude NUMERIC,
    longitude NUMERIC,
    timezone TEXT,
    
    -- Cultural & Social
    primary_language TEXT,
    cultural_heritage TEXT,
    notable_institutions TEXT, -- e.g., list of HBCUs
    historical_significance TEXT,
    
    -- Visual Assets
    flag_url TEXT,
    emblem_url TEXT, -- Similar to coat of arms
    leader_image_url TEXT,
    landmark_image_url TEXT,
    
    -- Additional Information
    key_contributions TEXT,
    cultural_events TEXT,
    notable_figures TEXT,
    resources TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(global_africa_id)
);

-- Insert initial Global Africa entries
INSERT INTO global_africa (name, code, flag_emoji, display_order) VALUES
    ('African Americans', 'US-AA', '🇺🇸', 1),
    ('HBCUs (USA)', 'US-HBCU', '🎓', 2),
    ('Brazil', 'BR-AFRO', '🇧🇷', 3),
    ('Haïti', 'HT', '🇭🇹', 4),
    ('Jamaica', 'JM', '🇯🇲', 5),
    ('Trinidad', 'TT', '🇹🇹', 6)
ON CONFLICT (name) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_global_africa_code ON global_africa(code);
CREATE INDEX IF NOT EXISTS idx_global_africa_active ON global_africa(is_active);
CREATE INDEX IF NOT EXISTS idx_global_africa_info_global_africa_id ON global_africa_info(global_africa_id);

-- Add comments
COMMENT ON TABLE global_africa IS 'African diaspora communities and institutions outside of Africa';
COMMENT ON TABLE global_africa_info IS 'Detailed information about Global Africa entries';
COMMENT ON COLUMN global_africa.code IS 'Unique identifier code (e.g., US-AA, US-HBCU)';
COMMENT ON COLUMN global_africa_info.organization_type IS 'Type: Diaspora Community, Educational Network, etc.';

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_global_africa_updated_at ON global_africa;
CREATE TRIGGER update_global_africa_updated_at
    BEFORE UPDATE ON global_africa
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_global_africa_info_updated_at ON global_africa_info;
CREATE TRIGGER update_global_africa_info_updated_at
    BEFORE UPDATE ON global_africa_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
