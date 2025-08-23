#!/bin/bash

# Run AI Bargaining Platform schema migration on Render PostgreSQL
echo "🚀 Running AI Bargaining Platform schema migration on Render PostgreSQL..."

# Connect to Render PostgreSQL and run the migration
psql postgresql://faredown_user:VFEkJ35EShYkok2OfgabKLRCKIluidqb@dpg-d2086mndiees739731t0-a.singapore-postgres.render.com:5432/faredown_booking_db -f final-ai-schema-complete.sql

echo "✅ AI schema migration completed!"

# Verify tables were created
echo "🔍 Verifying AI tables..."
psql postgresql://faredown_user:VFEkJ35EShYkok2OfgabKLRCKIluidqb@dpg-d2086mndiees739731t0-a.singapore-postgres.render.com:5432/faredown_booking_db -c "
SELECT 
    table_name,
    CASE 
        WHEN table_type = 'VIEW' THEN 'MATERIALIZED VIEW'
        ELSE 'TABLE'
    END as object_type
FROM information_schema.tables 
WHERE table_schema = 'ai' 
ORDER BY table_name;
"

echo "📊 Total AI tables/views:"
psql postgresql://faredown_user:VFEkJ35EShYkok2OfgabKLRCKIluidqb@dpg-d2086mndiees739731t0-a.singapore-postgres.render.com:5432/faredown_booking_db -c "
SELECT COUNT(*) as ai_objects_count
FROM information_schema.tables 
WHERE table_schema = 'ai';
"
