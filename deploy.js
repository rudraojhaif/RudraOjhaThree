const { execSync } = require('child_process');

function run(command) {
  console.log(`Running: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Failed to execute: ${command}`);
    process.exit(1);
  }
}

console.log('Starting deployment process...\n');

// Check if there are changes to commit
console.log('Checking for changes...');
try {
  const status = execSync('git status --porcelain').toString();

  if (status) {
    console.log('Changes detected. Committing and pushing to main...');
    run('git add .');
    run('git commit -m "Deploy: update source code"');
    run('git push origin main');
    console.log('Successfully pushed to main!\n');
  } else {
    console.log('No changes to commit.\n');
  }
} catch (error) {
  console.error('Error checking git status');
  process.exit(1);
}

// Build and deploy to gh-pages
console.log('Building project...');
run('npm run build');

console.log('\nDeploying to gh-pages...');
run('gh-pages -d dist');

console.log('\nDeployment complete!');
console.log('- Source code pushed to main');
console.log('- Built site deployed to gh-pages');
