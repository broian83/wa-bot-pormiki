#!/usr/bin/env node

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('🚀 Starting Supabase database setup...\n');

  try {
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Found ${statements.length} SQL statements to execute...\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        if (error) {
          console.log(`⚠️  [${i + 1}/${statements.length}] ${error.message.substring(0, 80)}...`);
          errorCount++;
        } else {
          successCount++;
          process.stdout.write(`✅ [${successCount}/${statements.length}]\r`);
        }
      } catch (err) {
        errorCount++;
      }
    }

    console.log(`\n\n✅ Database setup complete! (${successCount} success, ${errorCount} skipped)\n`);

    const { data: categories } = await supabase.from('categories').select('*');
    console.log(`📂 Categories: ${categories?.length || 0}`);

    const { data: knowledge } = await supabase.from('knowledge').select('*');
    console.log(`📚 Knowledge items: ${knowledge?.length || 0}`);

    const { data: events } = await supabase.from('events').select('*');
    console.log(`📅 Events: ${events?.length || 0}`);

    console.log('\n🎉 Supabase is ready!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

setupDatabase();
