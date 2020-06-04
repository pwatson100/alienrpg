import { createPanicTable } from './alienrpg-panictable.js';
export class AlienRPGSetup {
  static async setup() {
    if (!game.tables.getName('Panic Table')) {
      await createPanicTable();
      ui.notifications.info('First-Time-Setup complete');
    }
  }
}
