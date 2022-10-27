import { moduleKey, moduleTitle, adventurePack, adventurePackName } from './init.js';

export default async function migrateFolders() {

    await delay(200);

    while (await game.settings.get('alienrpg', 'ARPGSemaphore') === 'busy') {
        await delay(10000);
        console.warn('Core System Waiting');
        ui.notifications.warn(`Core System Upgrade Waiting`);

    }

    await game.settings.set('alienrpg', 'ARPGSemaphore', 'busy');
    logger.warn('Status: ', await game.settings.get('alienrpg', 'ARPGSemaphore'), 'Core System Starting Upgrade');
    ui.notifications.warn(`Core System Starting Upgrade`);

    // Folder ID Migration
    const acFolderIDs = [
        { folderName: "Alien Creature Tables", folderID: 'LrpFZIuICZfNAr2v', folderType: 'RollTable' },
        { folderName: "Alien Mother Tables", folderID: 'A0N3Ct1TQq9BuGk6', folderType: 'RollTable' },
        { folderName: "Alien Sub-Tables", folderID: 'w3xO69hCmTtYDF8d', folderType: 'RollTable' },
        { folderName: "Alien Tables", folderID: 'Btepu5tifRV0Pj7w', folderType: 'RollTable' },
    ];

    // Remove assets that need to be updated
    await deleteTableIfExist('Panic Table');

    await deleteJournalIfExist('MU/TH/ER Instructions.')
    // Folders
    // await deleteFolderIfExist('The Art of Alien');

    // Get the existing folder contents and save
    let folderAssetIds = [];
    let updateAsset;
    let folderDeletes = [];

    for (const { folderName, folderID } of acFolderIDs) {
        game.folders.contents.filter(a => {
            if (a.name === folderName && a.id !== folderID) {
                // console.log(a);
                folderAssetIds.push([a.name, a.id, a.contents, a.type]);
            }
        });
    };
    // Now work out what is installed and run the adventure import to get the proper folder structure and import deleted assets
    await ReImportFolders(adventurePack, adventurePackName);

    // Now go through the old asset list and move the asssets to the correct new folders
    folderAssetIds.forEach(fName => {
        for (const { folderName, folderID } of acFolderIDs) {
            if (folderName === fName[0]) {
                fName[2].forEach(iName => {
                    switch (fName[3]) {
                        case 'JournalEntry':
                            updateAsset = game.journal.get(iName.id);
                            updateAsset.update({ folder: folderID });
                            break;
                        case 'Actor':
                            updateAsset = game.actors.get(iName.id);
                            updateAsset.update({ folder: folderID });
                            break;
                        case 'Item':
                            updateAsset = game.items.get(iName.id);
                            updateAsset.update({ folder: folderID });
                            break;
                        case 'Scene':
                            updateAsset = game.scenes.get(iName.id);
                            updateAsset.update({ folder: folderID });
                            break;
                        case 'RollTable':
                            updateAsset = game.tables.get(iName.id);
                            updateAsset.update({ folder: folderID });
                            break;
                        default:
                            break;
                    }
                });
            }
        };
        // store the folders we want to delete
        folderDeletes.push(fName[1])
    });

    // delete the old folders
    await Folder.deleteDocuments(folderDeletes);

    logger.info(`Asset Moves Completed`);

    // REfresh
    ui.sidebar.render();
    allDone(moduleTitle);
};

async function allDone(moduleTitle) {
    Dialog.prompt({
        title: `${moduleTitle} Update`,
        content: `<p>The update has completed</p> <br> `,
        label: 'Okay!',
        callback: () => {
            console.log('All Done');
        },
    });
    await game.settings.set('alienrpg', 'ARPGSemaphore', '');
    await game.settings.set(moduleKey, 'migrationVersion', game.system.version);
    game.journal.getName('MU/TH/ER Instructions.').show();

    logger.warn('Status: ', await game.settings.get('alienrpg', 'ARPGSemaphore'), 'Core System Upgrade Completed');
    logger.info("Imorted ", game.settings.get(moduleKey, 'imported'), "Version ", game.system.version, "Migration ", game.settings.get(moduleKey, 'migrationVersion'))
}

async function ReImportFolders(adventurePack, adventurePackName) {
    //
    // Non distructive import that only imports assets missing in the world. 
    //
    const pack = game.packs.get(adventurePack);
    const adventureId = pack.index.find(a => a.name === adventurePackName)?._id;
    logger.info(`For ${adventurePackName} the Id is: ${adventureId}`)
    const adventure = await pack.getDocument(adventureId);
    const adventureData = adventure.toObject();
    const toCreate = {};
    let created = 0;

    for (const [field, cls] of Object.entries(Adventure.contentFields)) {
        const newUpdate = [];
        const newAdd = [];
        const collection = game.collections.get(cls.documentName);
        const [c, u] = adventureData[field].partition(d => collection.has(d._id));
        if (c.length) {
            toCreate[cls.documentName] = c;
            created += c.length;
        }
    }

    //
    // Now create any new assets
    //

    if (toCreate) {
        for (const [documentName, createData] of Object.entries(toCreate)) {
            const cls = getDocumentClass(documentName);
            const c = await cls.createDocuments(createData, { keepId: true, keepEmbeddedId: true, renderSheet: false });
            created++;
        }
    }
    ui.notifications.warn(`Core System Upgrade Re-Import Completed Created ${created} Assets`);

    logger.info(` Created ${created} Assets`);
    return;
};


async function deleteFolderIfExist(folderName) {
    let delFolder = game.folders.getName(folderName);
    if (delFolder) {
        console.log(`${folderName} Deleted`)
        await delFolder.delete({ deleteSubfolders: true, deleteContents: true });
    }
}
async function deleteJournalIfExist(journalName) {
    let delJournal = game.journal.getName(journalName);
    if (delJournal) {
        await delJournal.delete();
    }
}

async function deleteIDJournalIfExist(journalID) {
    let delJournal = game.journal.get(journalID);
    if (delJournal) {
        await delJournal.delete();
    }
}
async function deleteTableIfExist(tableName) {
    let delTable = game.tables.getName(tableName);
    if (delTable) {
        await delTable.delete();
    }
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
