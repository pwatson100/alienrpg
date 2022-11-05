import updateModule from './update.js';
import migrateFolders from './migratefolders.js';

export const systemName = 'Alien RPG';
// export const requiredSystemVersion = '3.0.0';
// export const moduleVersion = '3.0.0';
export const moduleKey = 'alienrpg'; // Module name. Important that this one is the exact same as the name of the module
export const adventurePack = 'alienrpg.alien-rpg-system';
export const adventurePackName = 'Alien RPG System';
export const moduleTitle = "Alien RPG"; // Module Title, is not referenced beyond giving a title to HTML dialog, so can be anything
// export const welcomeJournalEntry = '00.00 HoD - How To Use This Module'; // The name of a journal entry you want to display after import.
// export const sceneToActivate = '00.00 - HoD Cover'; // The name of the scene you want to display after import.
// export const sceneToActivate = 'Core Rules Cover'; // The name of the scene you want to display after import.
export const welcomeJournalEntry = 'MU/TH/ER Instructions.'; // The name of a journal entry you want to display after import.

export class ImportFormWrapper extends FormApplication {
  render() {
    ReImport();
  }
}


// Setting Hooks to easily interact with the importing of the compendiums.
Hooks.on('init', () => {
  game.settings.register(moduleKey, 'imported', {
    name: 'Imported Compendiums',
    scope: 'world',
    config: false,
    type: Boolean,
    default: false,
  });
  game.settings.register(moduleKey, 'migrationVersion', {
    name: 'Module Version',
    scope: 'world',
    config: false,
    type: String,
    default: '0',
  });
  game.settings.registerMenu(moduleKey, 'import', {
    name: 'Import Adventure',
    label: 'Re-Import',
    hint: `Welcome to the ${adventurePackName}.  Click above to import any missing (deleted) content to your world.  If you want to do a full refresh (overwrite) open the Compendium and use the Adventure Importer. `,
    config: true,
    type: ImportFormWrapper,
    restricted: true,

  });

});


Hooks.on('ready', () => {
  if (!game.settings.get(moduleKey, 'imported') && game.user.isGM && !game.folders.getName('Alien Tables')) {
    ModuleImport();
    return;
  } else if (!game.settings.get(moduleKey, 'imported') && game.user.isGM && game.folders.getName('Alien Tables')) {
    migrateFolders();
    game.settings.set(moduleKey, 'imported', true);
    return;
  }
  else if (game.settings.get(moduleKey, 'imported') && game.user.isGM && game.settings.get(moduleKey, 'migrationVersion') < game.system.version) {
    updateModule();
  }
  logger.info("Imported ", game.settings.get(moduleKey, 'imported'), "Version ", game.system.version, "Migration ", game.settings.get(moduleKey, 'migrationVersion'))

});


export async function ModuleImport() {
  //
  // Imports all assets in the Adventure Collection.  
  // Will overwrite existing assets. 
  //
  // await deleteFolderIfExist("Skill-Stunts");
  // await deleteJournalIfExist('MU/TH/ER Instructions.');
  // await deleteFolderIfExist('Alien Tables');

  const pack = game.packs.get(adventurePack);
  const adventureId = pack.index.find(a => a.name === adventurePackName)?._id;
  logger.info(`For ${adventurePackName} the Id is: ${adventureId}`)
  const adventure = await pack.getDocument(adventureId);

  // await checkVersion();
  await adventure.sheet.render(true);

  Hooks.on('importAdventure', (created, updated) => {
    if (adventure.name === adventurePackName) {
      if (created || updated) {
        game.settings.set(moduleKey, 'imported', true);
        game.settings.set(moduleKey, 'migrationVersion', game.system.version);
        ui.notifications.notify("Import Complete");
        game.journal.getName(welcomeJournalEntry).show();
        return;
      } else {
        ui.notifications.warn("There was a problem with the Import");
      }
    }
  });

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
  async function deleteTableIfExist(tableName) {
    let delTable = game.tables.getName(tableName);
    if (delTable) {
      await delTable.delete();
    }
  }
};

export async function ReImport() {
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
  ui.notifications.warn(`Re-Import Completed Created ${created} Assets`);

  logger.info(` Created ${created} Assets`);
};


