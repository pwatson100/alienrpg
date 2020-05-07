// Import Modules
import { alienrpgActor } from './actor/actor.js';
import { alienrpgActorSheet } from './actor/actor-sheet.js';
import { alienrpgItem } from './item/item.js';
import { alienrpgItemSheet } from './item/item-sheet.js';

Hooks.once('init', async function () {
  game.alienrpg = {
    alienrpgActor,
    alienrpgItem,
  };

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d6',
    decimals: 2,
  };

  // Define custom Entity classes
  CONFIG.Actor.entityClass = alienrpgActor;
  CONFIG.Item.entityClass = alienrpgItem;

  // Register sheet application classes
  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('alienrpg', alienrpgActorSheet, { makeDefault: true });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('alienrpg', alienrpgItemSheet, { makeDefault: true });

  // If you need to add Handlebars helpers, here are a few useful examples:
  Handlebars.registerHelper('concat', function () {
    var outStr = '';
    for (var arg in arguments) {
      if (typeof arguments[arg] != 'object') {
        outStr += arguments[arg];
      }
    }
    return outStr;
  });

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
  });
});

// clear the minimum resolution message
Hooks.once('ready', async function () {
  setTimeout(() => {
    $('.notification.error').each((index, item) => {
      if ($(item).text().includes('requires a minimum screen resolution')) {
        $(item).remove();
      }
    });
  }, 250);
});
