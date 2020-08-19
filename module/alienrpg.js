// Import Modules
import registerActors from './register-actors.js';
import { alienrpgActor } from './actor/actor.js';
// import { alienrpgActorSheet } from './actor/actor-sheet.js';
import { alienrpgItem } from './item/item.js';
import { alienrpgItemSheet } from './item/item-sheet.js';
import { alienrpgPlanetSheet } from './item/planet-system-sheet.js';
import { yze } from './YZEDiceRoller.js';
import { ALIENRPG } from './config.js';
import registerSettings from './settings.js';
import { AlienRPGSetup } from './setupHandler.js';
import { preloadHandlebarsTemplates } from './templates.js';
import * as migrations from './migration.js';

Hooks.once('init', async function () {
  console.warn(`Initializing Alien RPG`);
  game.alienrpg = {
    alienrpgActor,
    alienrpgItem,
    alienrpgPlanetSheet,
    yze,
    rollItemMacro,
    registerSettings,
  };

  // Global define for this so the roll data can be read by the reroll method.
  game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, r3Dice: 0, r3One: 0, r3Six: 0, tLabel: '', sCount: 0 };
  // console.warn('sCount init', game.alienrpg.rollArr.sCount);
  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d10',
    decimals: 1,
  };

  // Define custom Entity classes
  CONFIG.ALIENRPG = ALIENRPG;
  CONFIG.Actor.entityClass = alienrpgActor;
  CONFIG.Item.entityClass = alienrpgItem;
  // CONFIG.Planet.entityClass = alienrpgPlanet;

  // Register sheet application classes
  // Actors.unregisterSheet('core', ActorSheet);
  // Actors.registerSheet('alienrpg', alienrpgActorSheet, { makeDefault: true });
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('alienrpg', alienrpgItemSheet, { types: ['item', 'weapon', 'armor', 'talent'], makeDefault: false });
  Items.registerSheet('alienrpg', alienrpgPlanetSheet, { types: ['planet-system'], makeDefault: false });
  // console.warn('*******************************');
  // console.warn('register');
  // console.warn('*******************************');
  registerSettings();
  registerActors();
  // Preload Handlebars Templates
  preloadHandlebarsTemplates();

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

  Handlebars.registerHelper('if_isWeapons', function (sectionlabel, options) {
    // console.warn('helper triggered', sectionlabel);
    if (sectionlabel === 'Weapons') {
      // console.warn('true');
      return options.fn(this);
    }
  });

  // Ifis not equal
  Handlebars.registerHelper('ifne', function (v1, v2, options) {
    if (v1 !== v2) return options.fn(this);
    else return options.inverse(this);
  });

  // if equal
  Handlebars.registerHelper('ife', function (v1, v2, options) {
    if (v1 === v2) return options.fn(this);
    else return options.inverse(this);
  });

  // Register system settings
  game.settings.register('alienrpg', 'macroShorthand', {
    name: 'Shortened Macro Syntax',
    hint:
      'Enable a shortened macro syntax which allows referencing attributes directly, for example @str instead of @attributes.str.value. Disable this setting if you need the ability to reference the full attribute model, for example @attributes.str.label.',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
  });
});

// Build the panic table if it does not exist.
Hooks.once('ready', async () => {
  await AlienRPGSetup.setup();
  // Determine whether a system migration is required and feasible
  const currentVersion = game.settings.get('alienrpg', 'systemMigrationVersion');
  const NEEDS_MIGRATION_VERSION = '1.1.0';
  const COMPATIBLE_MIGRATION_VERSION = '0' || isNaN('NaN');
  let needMigration = currentVersion < NEEDS_MIGRATION_VERSION || currentVersion === null;
  console.warn('needMigration', needMigration, currentVersion);
  // Perform the migration
  if (needMigration && game.user.isGM) {
    if (currentVersion && currentVersion < COMPATIBLE_MIGRATION_VERSION) {
      ui.notifications.error(
        `Your AlienRPG system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.`,
        { permanent: true }
      );
    }
    migrations.migrateWorld();
  }
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

Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addColorset({
    name: 'rainbow',
    description: 'Rainbow',
    category: 'Colors',
    foreground: ['#FF5959', '#FFA74F', '#FFFF56', '#59FF59', '#2374FF', '#00FFFF', '#FF59FF'],
    background: ['#900000', '#CE3900', '#BCBC00', '#00B500', '#00008E', '#008282', '#A500A5'],
    outline: 'black',
    texture: 'none',
  });
});

// Item Drag Hook
Hooks.once('ready', async function () {
  // Wait to register the Hotbar drop hook on ready sothat modulescould register earlier if theywant to
  Hooks.on('hotbarDrop', (bar, data, slot) => createAlienrpgMacro(data, slot));
});

//  Hook to watch for the Push button being pressed -   Need to refactor this so it does not firee all the time.
//
Hooks.on('renderChatMessage', (message, html, data) => {
  // console.warn('init hook here');

  html.find('i.fas.fa-dice').each((i, li) => {
    // console.warn(li);
    li.addEventListener('click', function (ev) {
      // console.warn(ev);
      if (ev.target.classList.contains('fa-dice')) {
        // do stuff
        let actor = game.actors.get(ChatMessage.getSpeaker().actor);
        if (!actor) return ui.notifications.warn(`You do not have a token selected`);
        let token = game.actors.get(ChatMessage.getSpeaker().token);
        let reRoll = true;
        let hostile = actor.data.type;
        let blind = false;
        // actor.unsetFlag('alienrpg', 'sixEs');

        if (actor.data.token.disposition === -1) {
          blind = true;
        }
        if (actor.data.type != 'creature') {
          actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value + 1 });
        }
        // actor.update({ [{'data.header.stress.value'}]: [{'data.header.stress.value'}] + 1 });
        // const reRoll1 = game.alienrpg.rollArr.r1Dice - (game.alienrpg.rollArr.r1One + game.alienrpg.rollArr.r1Six);
        const reRoll1 = game.alienrpg.rollArr.r1Dice - game.alienrpg.rollArr.r1Six;
        const reRoll2 = game.alienrpg.rollArr.r2Dice + 1 - (game.alienrpg.rollArr.r2One + game.alienrpg.rollArr.r2Six);
        yze.yzeRoll(hostile, blind, reRoll, game.alienrpg.rollArr.tLabel, reRoll1, 'Black', reRoll2, 'Yellow');
      }
    });
  });
});

Hooks.on('preCreateActor', (actor, dir) => {
  if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
    // Set wounds, advantage, and display name visibility
    mergeObject(actor, {
      'token.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      // Default display name to be on owner hover
      'token.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
      // Default display bars to be on owner hover
      'token.disposition': CONST.TOKEN_DISPOSITIONS.HOSTILE,
      // Default disposition to hostile
      'token.name': actor.name, // Set token name to actor name
    }); // Default characters to HasVision = true and Link Data = true

    // actor.token.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
    // actor.token.vision = true;
    // actor.token.actorLink = true;

    if (actor.type === 'character') {
      mergeObject(actor, {
        'token.bar1': {
          attribute: 'header.stress.value',
        },
      });
      actor.token.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      actor.token.vision = true;
      actor.token.actorLink = true;
    } else if (actor.type === 'vehicles') {
      actor.token.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      actor.token.vision = true;
      actor.token.actorLink = true;
    } else if (actor.type === 'creature') {
      actor.token.vision = true;
      actor.token.actorLink = true;
    } else if (actor.type === 'synthetic') {
      actor.token.disposition = CONST.TOKEN_DISPOSITIONS.FRIENDLY;
      actor.token.vision = true;
      actor.token.actorLink = true;
    }
  }
});

Hooks.on('preUpdateActor', (data, updatedData) => {
  if (updatedData.img) {
    updatedData['token.img'] = updatedData.img;
    data.data.token.img = updatedData.img;
  }
  if (updatedData.name) {
    updatedData['token.name'] = updatedData.name;
  }
});

/* --
/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createAlienrpgMacro(data, slot) {
  if (data.type !== 'Item') return;
  if (!('data' in data)) return ui.notifications.warn('You can only create macro buttons for owned Items');
  const item = data.data;

  // Create the macro command
  const command = `game.alienrpg.rollItemMacro("${item.name}");`;
  let macro = game.macros.entities.find((m) => m.name === item.name && m.command === command);
  if (!macro) {
    macro = await Macro.create({
      name: item.name,
      type: 'script',
      img: item.img,
      command: command,
      flags: { 'alienrpg.itemMacro': true },
    });
  }
  game.user.assignHotbarMacro(macro, slot);
  return false;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @param {string} myitemType
 * @return {Promise}
 */
function rollItemMacro(itemName) {
  const speaker = ChatMessage.getSpeaker();
  let actor;
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);
  // console.warn('alienrpg.js 155 - Got here', speaker, actor);
  const item = actor ? actor.items.find((i) => i.name === itemName) : null;
  if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);

  // Trigger the item roll
  return item.roll();
}

Hooks.once('setup', function () {
  const toLocalize = ['skills', 'attributes'];

  for (let o of toLocalize) {
    CONFIG.ALIENRPG[o] = Object.entries(CONFIG.ALIENRPG[o]).reduce((obj, e) => {
      obj[e[0]] = game.i18n.localize(e[1]);

      return obj;
    }, {});
  }
});
