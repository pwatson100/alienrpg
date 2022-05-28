//
// Distributed Module Class written by Matthew Haentschke as part of the symbaroum5ecore system.
// Used with permission in accordance with the GPL 3 licence.
//

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
    if (!Hooks._hooks.hasOwnProperty(hook)) return true;
    const fns = new Array(...Hooks._hooks[hook]);
    for (let fn of fns) {
      let callAdditional = await Hooks._call(hook, fn, args);
      if (callAdditional === false) return false;
    }
    return true;
  }

  static _callRegistrations() {
    Hooks.call('alienrpgRegisterImport', globalThis.game.alienrpg.abstract.ImporterBase);
    return ImporterBase.callHook('alienrpgRunImport');
  }
}
