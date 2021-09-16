export class AlienRPGSetup {
  static async setup() {
    console.warn('***************************************************************');
    console.warn('AlienRPGSetup Directories and tables');
    console.warn('***************************************************************');
    let changes = 0;

    function pExists() {
      if (game.folders.contents.filter((entry) => entry.data.name == 'Alien Tables').length > 0) {
        return true;
      } else {
        return false;
      }
    }
    function itemExists() {
      if (game.folders.contents.filter((entry) => entry.data.name == 'Skill-Stunts').length > 0) {
        return true;
      } else {
        return false;
      }
    }

    let isHere = pExists();

    if (!isHere) {
      changes++;
      let folder = await Folder.create(
        {
          color: '',
          name: 'Alien Tables',
          parent: null,
          nullsort: 100000,
          type: 'RollTable',
        },
        { temporary: false }
      );

      let crefolder = await Folder.create(
        {
          color: '#ff0000',
          name: 'Alien Creature Tables',
          parent: folder.id,
          nullsort: 100000,
          type: 'RollTable',
        },
        { temporary: false }
      );
      let mothfolder = await Folder.create(
        {
          color: '#00c100',
          name: 'Alien Mother Tables',
          parent: folder.id,
          nullsort: 100000,
          type: 'RollTable',
        },
        { temporary: false }
      );
    }
    const isThere = game.tables.getName('Panic Table');
    const folderId = await game.folders.getName('Alien Mother Tables').id;

    if (!isThere) {
      changes++;
      let PanicTablePack = game.packs.find((p) => p.metadata.label === 'Tables (GM)');
      await PanicTablePack.getIndex();
      let panicTable = PanicTablePack.index.find((j) => j.name === 'Panic Table');
      await game.tables.importFromCompendium(PanicTablePack, panicTable._id, { folder: folderId });
    }

    let isItems = itemExists();

    if (!isItems) {
      changes++;
      let folder = await Folder.create(
        {
          color: '',
          name: 'Skill-Stunts',
          parent: null,
          nullsort: 100000,
          type: 'Item',
        },
        { temporary: false }
      );
    }
    // Copy the gm tables from the pack into the correct folder so it's available to the templates.
    let skillStunts = game.folders.contents.filter((entry) => entry.data.name == 'Skill-Stunts');
    if (skillStunts[0].content.length < 1) {
      changes++;
      const sfolderId = await game.folders.getName('Skill-Stunts').id;
      let gItems = game.packs.find((p) => p.metadata.label === 'Skill-Stunts');
      await gItems.getIndex();
      gItems.getDocuments().then((d) =>
        d.forEach((a) => {
          game.items.importFromCompendium(gItems, a.data._id, { folder: sfolderId });
        })
      );
    }
    if (changes > 0) {
      ui.items.render();
      ui.notifications.info('First-Time-Setup complete');
    }
  }
}
