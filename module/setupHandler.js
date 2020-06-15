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
      await createPanicTable(folder.id);
    }
    ui.notifications.info('First-Time-Setup complete');
  }
}
