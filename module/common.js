//
// Distributed Module Class written by Matthew Haentschke as part of the symbaroum5ecore system.
// Used with permission in accordance with the GPL 3 licence.
//

/* Common operations and utilities for all
 * core submodules
 */

const NAME = 'alienrpg';
const TITLE = 'Alien RPG - Core System';
const PATH = `systems/${NAME}`;

export class COMMON {
  /** CONSTANTS **/
  static DATA = {
    name: NAME,
    path: PATH,
    title: TITLE,
    // dndPath: `${PATH}/../../systems/dnd5e`,
  };

  static NAME = this.name;
  /** \CONSTANTS **/

  /* pre-setup steps */
  static build() {}

  static register() {
    COMMON.globals();
  }

  static globals() {
    /* register our namespace */
    // globalThis.game.alienrpg = {
    //   debug: {},
    // };
  }

  /** HELPER FUNCTIONS **/
  static firstGM() {
    return game.users.find((u) => u.isGM && u.active);
  }

  static isFirstGM() {
    return game.user.id === COMMON.firstGM()?.id;
  }

  static setting(key, value = null) {
    if (value) {
      return game.settings.set(COMMON.DATA.name, key, value);
    }

    return game.settings.get(COMMON.DATA.name, key);
  }

  static localize(stringId, data = {}) {
    return game.i18n.format(stringId, data);
  }

  static applySettings(settingsData, moduleKey = COMMON.DATA.name) {
    Object.entries(settingsData).forEach(([key, data]) => {
      game.settings.register(moduleKey, key, {
        name: COMMON.localize(`ALIENRPG.${key}.name`),
        hint: COMMON.localize(`ALIENRPG.${key}.hint`),
        ...data,
      });
    });
  }

  static addGetter(object, fieldName, fn) {
    Object.defineProperty(object, fieldName, {
      get: fn,
    });
  }

  static translateObject(obj) {
    /* translate in place */
    Object.keys(obj).forEach((key) => (obj[key] = COMMON.localize(obj[key])));

    return obj;
  }

  static addAbstract(cls, key) {
    if (!globalThis.game.alienrpg.abstract) globalThis.game.alienrpg.abstract = {};
    globalThis.game.alienrpg.abstract[key] = cls;
  }
}
