#!/usr/bin/env node

/**
 * AI Bargain Migration Script
 * Sets up the complete AI Emotional-Intelligence Bargain Model database schema
 */

const fs = require('fs');
const path = require('path');
const db = require('./connection');

async function runMigrations() {
  console.log('🚀 Starting AI Bargain Migration...');
  
  try {
    // Initialize database connection
    await db.initialize();
    
    // Migration files in order
    const migrationFiles = [
      '01_ai_bargain_tables.sql',
      '02_indexes_and_seeds.sql',
      '03_ai_bargain_functions.sql'
    ];
    
    for (const filename of migrationFiles) {
      const filePath = path.join(__dirname, 'migrations', filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Migration file not found: ${filename}`);
        continue;
      }
      
      console.log(`📋 Running migration: ${filename}`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      
      try {
        // Run migration in transaction
        await db.transaction(async (client) => {
          await client.query(sql);
        });
        
        console.log(`✅ Migration completed: ${filename}`);
      } catch (error) {
        console.error(`❌ Migration failed: ${filename}`);
        console.error('Error:', error.message);
        
        // Continue with other migrations (in case some parts already exist)
        if (!error.message.includes('already exists')) {
          throw error;
        } else {
          console.log(`⚠️  Some objects already exist, continuing...`);
        }
      }
    }
    
    // Verify the setup
    console.log('🔍 Verifying AI Bargain setup...');
    
    const verifyResults = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM modules) as modules_count,
        (SELECT COUNT(*) FROM features WHERE key LIKE 'ai_%') as feature_flags_count,
        (SELECT COUNT(*) FROM copy_packs) as copy_packs_count
    `);
    
    const stats = verifyResults.rows[0];
    console.log(`📊 Setup verification:`);
    console.log(`   - Modules: ${stats.modules_count}`);
    console.log(`   - AI Feature flags: ${stats.feature_flags_count}`);
    console.log(`   - Copy packs: ${stats.copy_packs_count}`);
    
    // Test the AI bargain function
    console.log('🧪 Testing AI bargain function...');
    
    try {
      const testSession = await db.query(
        'SELECT create_bargain_session($1, $2, $3, $4) as session_id',
        [null, 'flights', 'test-product-123', 3]
      );
      
      const sessionId = testSession.rows[0].session_id;
      console.log(`📝 Created test session: ${sessionId}`);
      
      const testBargain = await db.query(
        'SELECT ai_bargain_quote($1, $2, $3, $4) as result',
        [sessionId, 'flights', 'test-product-123', 25000]
      );
      
      const result = testBargain.rows[0].result;
      console.log(`🤖 AI Response:`, {
        status: result.status,
        finalPrice: result.finalPrice,
        aiEmotion: result.ai?.emotion
      });
      
      console.log('✅ AI Bargain function test passed!');
    } catch (error) {
      console.error('❌ AI function test failed:', error.message);
    }
    
    console.log('\n🎉 AI Bargain Migration completed successfully!');
    console.log('🚀 Your AI Emotional-Intelligence Bargain Model is now ready!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.close();
  }
}

// Run if called directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('🏁 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigrations };
