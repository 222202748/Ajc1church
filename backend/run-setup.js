// run-setup.js - Run this script to set up the admin user and test blog post
const { spawn } = require('child_process');
const path = require('path');

// Define scripts to run
const scripts = [
  './src/scripts/createDefaultAdmin.js',
  './src/scripts/createTestBlogPost.js'
];

// Function to run a script
const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    console.log(`\n🚀 Running ${path.basename(scriptPath)}...`);
    
    const child = spawn('node', [path.resolve(__dirname, scriptPath)], {
      stdio: 'inherit'
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${path.basename(scriptPath)} completed successfully`);
        resolve();
      } else {
        console.error(`❌ ${path.basename(scriptPath)} failed with code ${code}`);
        reject(new Error(`Script exited with code ${code}`));
      }
    });
    
    child.on('error', (err) => {
      console.error(`❌ Failed to start ${path.basename(scriptPath)}:`, err);
      reject(err);
    });
  });
};

// Run all scripts in sequence
const runAllScripts = async () => {
  console.log('🔧 Starting application setup...');
  
  for (const script of scripts) {
    try {
      await runScript(script);
    } catch (error) {
      console.error('Setup failed:', error.message);
      process.exit(1);
    }
  }
  
  console.log('\n✨ Setup completed successfully!');
  console.log('\n📝 Default admin credentials:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('\n⚠️  Please change the default password after first login.');
};

runAllScripts();