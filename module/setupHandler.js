import { createPanicTable } from './alienrpg-panictable.js';
export class AlienRPGSetup {
  static async setup() {
    // console.warn('***************************************************************');
    // console.warn('AlienRPGSetup');
    // console.warn('***************************************************************');

    function pExists() {
      if (Folder.collection.entities.filter((entry) => entry.data.name == 'Alien Tables').length > 0) {
        return true;
      } else {
        return false;
      }
    }

    let isHere = pExists();

    if (!isHere) {
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

      console.warn('folder.id', mothfolder.id);
      await createPanicTable(mothfolder.id);
    }
    ui.notifications.info('First-Time-Setup complete');
  }
}
