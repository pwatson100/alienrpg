import { moduleKey, adventurePackName, adventurePack, moduleTitle } from './init.js';

export default async function updateModule() {

    /**
    * updateAssets
    * Param for number of dice to roll for each die type/rolls
    * @param {Text} assetType - Allowed Asset types : 'actors', 'items','journal' & 'scenes'
    * @param {Text} assetName - The name of the asset
    * @param {Text} action - Allowed Actions: 'update', 'delete' & 'add'
    *
    * NOTE: 'add' will not delete existing assets so they need to be deleted first if you want to replace.
    * 
    * Examples:
    * { assetType: 'actors', assetName: 'Hannah Singleton', action: 'delete' },
    * { assetType: 'actors', assetName: 'Hannah Singleton', action: 'add' },
    * { assetType: 'actors', assetName: 'Holroyd', action: 'update' },
    * { assetType: 'items', assetName: '20mm Gatling Gun', action: 'update' },
    * { assetType: 'journal', assetName: 'ALIEN RPG GM RULES INDEX', action: 'update' },
    * { assetType: 'scenes', assetName: 'Station Layout', action: 'update' },  
    *
    */

    const updateAssets = [];

    const updateNotes = `<ul>
    <li>Added Hannah Singleton</li>
    </ul>`;

    // If there are no actual asset updates quit.
    if (!updateAssets.length) {
        logger.info("No asset updates required");

        await game.settings.set(moduleKey, 'migrationVersion', game.system.version);
        return;
    };

    const pack = game.packs.get(adventurePack);
    const adventureId = pack.index.find(a => a.name === adventurePackName)?._id;
    const tPack = await pack.getDocument(adventureId);
    const aPack = tPack.toObject()

    await getUpdateIDs(aPack, updateAssets);
    await ModuleUpdate(aPack, updateAssets);

    await allDone(moduleTitle, updateNotes);
}


async function getUpdateIDs(aPack, updateAssets) {

    for (let key in updateAssets) {
        if (updateAssets.hasOwnProperty(key)) {
            if (updateAssets[key].action === "update") {
                const tempID = await game[updateAssets[key].assetType].getName(updateAssets[key].assetName).id;
                const tempClass = await game[updateAssets[key].assetType].getName(updateAssets[key].assetName).documentName;
                Object.assign(updateAssets[key], { assetID: tempID, assetClass: tempClass });
            } else {
                Object.assign(updateAssets[key], { assetClass: 'new' });
            }
        }
    }
    return updateAssets;
}

async function ModuleUpdate(aPack, updateAssets) {
    const toUpdate = {};
    const toCreate = {};
    let created = 0;
    let updated = 0;

    for (const [field, cls] of Object.entries(Adventure.contentFields)) {
        const newUpdate = [];
        const newAdd = [];
        for (const { assetType, assetName, action, assetID, assetClass } of updateAssets) {
            if (assetClass === cls.documentName || assetClass === 'new') {
                switch (action) {
                    case 'delete':
                        try {
                            const isThere = game[assetType].getName(assetName);
                            if (isThere) {
                                console.log('It Exists');
                                await isThere.delete({ deleteSubfolders: true, deleteContents: true });
                            }
                        } catch (error) {
                            console.warn(`${assetName} already deleted`);
                        }
                        break;
                    case 'add':
                        if (!game[assetType].getName(assetName)) {
                            const [c] = aPack[field].partition(d => d.name != assetName);
                            if (c.length) {
                                newAdd.push(c[0]);
                            }
                        } else {
                            console.warn(`${assetName} ${assetType} Exists so no overwrite.  Delete first!`);
                            // Uncomment the next line if you want a distructive add.
                            // await assetName.delete({ deleteSubfolders: true, deleteContents: true });
                        }

                        break;
                    case 'update':
                        const [u] = aPack[field].partition(d => d._id != assetID);
                        if (u.length) {
                            newUpdate.push(u[0]);
                        }
                        break;
                    default:
                        break;
                }
            }
        }
        // Now create the update entries for that asset class.
        if (newAdd.length) {
            toCreate[cls.documentName] = newAdd;
        }
        if (newUpdate.length) {
            toUpdate[cls.documentName] = newUpdate;
        }
    }


    //
    // Now update any assets.
    //
    if (toUpdate) {
        for (const [documentName, updateData] of Object.entries(toUpdate)) {
            const cls = getDocumentClass(documentName);
            const u = await cls.updateDocuments(updateData, { diff: false, recursive: false, noHook: true });
            updated++;
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
    logger.info(`${moduleKey} Updated ${updated} Asset, Created ${created} Asset`);
}

async function allDone(moduleTitle, updateNotes) {
    await game.settings.set(moduleKey, 'migrationVersion', game.system.version);
    Dialog.prompt({
        title: `${moduleTitle} Update`,
        content: `<p>The update has completed and the following have been updated:</p> <br> ${updateNotes}`,
        label: 'Okay!',
        callback: () => {
            console.log('All Done');
        },
    });
    logger.info("Imported ", game.settings.get(moduleKey, 'imported'), "Version ", game.system.version, "Migration ", game.settings.get(moduleKey, 'migrationVersion'))
}
