#!/usr/bin/env node

const bcrypt = require('bcryptjs');

/**
 * Generates a bcrypt hash for a password using the same configuration as the application
 * Compatible with the authentication system in src/lib/auth/users.ts
 */
async function generatePasswordHash(password) {
  try {
    // Use same salt rounds as the application (10)
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    console.log('\n=== Password Hash Generator ===');
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hash}`);
    console.log('\n📋 Copy the hash above and paste it in src/lib/auth/users.ts');
    console.log('🔐 This hash is compatible with bcryptjs and JWT authentication');
    console.log('================================\n');
    
    // Test the hash to ensure it's valid
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      console.log('✅ Hash validation: PASSED');
    } else {
      console.log('❌ Hash validation: FAILED');
    }
    
    return hash;
  } catch (error) {
    console.error('❌ Error generating password hash:', error);
    process.exit(1);
  }
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.log('\n📖 Usage:');
  console.log('  node scripts/generate-password.js <password>');
  console.log('  npm run generate-password <password>');
  console.log('\n💡 Example:');
  console.log('  npm run generate-password myNewPassword123');
  console.log('  node scripts/generate-password.js admin456\n');
  process.exit(1);
}

// Validate password strength (optional)
if (password.length < 6) {
  console.log('⚠️  Warning: Password is shorter than 6 characters');
}

generatePasswordHash(password);