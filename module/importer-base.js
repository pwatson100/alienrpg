import { COMMON } from './common.js';
import { ModuleImportDialog } from './apps/import-dialog.js';
import { logger } from './logger.js';

export class ImporterBase {
  static register() {
    this.globals();
    this.hooks();
  }

  static globals() {
    COMMON.addAbstract(ModuleImportDialog, 'ImporterBase');
  }

  static hooks() {
    Hooks.on('ready', this._callRegistrations);
  }

  static async callHook(hook, ...args) {
    if (CONFIG.debug.hooks) {
      logger.info(`Calling ${hook} hook with args:`);
      logger.info(args);
    }

    if (!Hooks.events.hasOwnProperty(hook)) return true;
    const fns = new Array(...Hooks.events[hook]);
    for (let fn of fns) {
      let callAdditional = await Hooks.call(hook, fn, args);
      if (callAdditional === false) return false;
    }
    return true;
  }

  static _callRegistrations() {
    Hooks.call('alienrpgRegisterImport', globalThis.game.alienrpg.abstract.ImporterBase);
    return ImporterBase.callHook('alienrpgRunImport');
  }
}
