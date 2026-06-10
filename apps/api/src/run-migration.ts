import { AppDataSource } from './data-source';

const command = process.argv[2];
const action = command === 'revert' ? 'revert' : 'run';

async function main() {
    await AppDataSource.initialize();

    if (action === 'revert') {
        await AppDataSource.undoLastMigration();
    } else {
        await AppDataSource.runMigrations();
    }

    await AppDataSource.destroy();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
