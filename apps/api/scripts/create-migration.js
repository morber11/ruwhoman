const { execSync } = require('child_process');
const { resolve } = require('path');
const name = process.argv[2];

// wrapper around npx typeorm migration:create 
if (!name) {
    console.error('Usage: node scripts/create-migration.js <MigrationName>');
    process.exit(1);
}

execSync(`npx typeorm migration:create src/migrations/${name}`, {
    stdio: 'inherit',
    cwd: resolve(__dirname, '..'),
});
