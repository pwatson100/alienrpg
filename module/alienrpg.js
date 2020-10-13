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
import { AlienRPGBaseDie } from './alienRPGBaseDice.js';
import { AlienRPGStressDie } from './alienRPGBaseDice.js';
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

  // Set FVTT version constant
  const is07x = game.data.version.split('.')[1] === '7';

  // Global define for this so the roll data can be read by the reroll method.
  game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '', sCount: 0 };
  // console.warn('sCount init', game.alienrpg.rollArr.sCount);

  /**
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d10',
    decimals: 1,
  };
  // If the FVTT version is > V0.7.x initalise the Base and Stress dice terms
  if (is07x) {
    CONFIG.Dice.terms['b'] = AlienRPGBaseDie;
    CONFIG.Dice.terms['s'] = AlienRPGStressDie;
  }

  // Define custom Entity classes
  CONFIG.ALIENRPG = ALIENRPG;
  CONFIG.Actor.entityClass = alienrpgActor;
  CONFIG.Item.entityClass = alienrpgItem;
  // CONFIG.Planet.entityClass = alienrpgPlanet;

  // Register sheet application classes
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('alienrpg', alienrpgItemSheet, { types: ['item', 'weapon', 'armor', 'talent', 'skill-stunts'], makeDefault: false });
  Items.registerSheet('alienrpg', alienrpgPlanetSheet, { types: ['planet-system'], makeDefault: false });
  registerSettings();
  registerActors();

  // Preload Handlebars Templates
  preloadHandlebarsTemplates();

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
  const NEEDS_MIGRATION_VERSION = '1.2.0';
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

// clear the minimum resolution message faster
Hooks.once('ready', async function () {
  setTimeout(() => {
    $('.notification.error').each((index, item) => {
      if ($(item).text().includes('requires a minimum screen resolution')) {
        $(item).remove();
      }
    });
  }, 250);
});

// ***************************
// DsN V3 Hooks
// ***************************
Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {});

Hooks.once('diceSoNiceReady', (dice3d) => {
  dice3d.addColorset({
    name: 'yellow',
    description: 'Yellow',
    category: 'Colors',
    foreground: ['#e3e300'],
    background: ['#e3e300'],
    outline: 'black',
    texture: 'none',
  });

  dice3d.addSystem({ id: 'alienrpg', name: 'Alien RPG' }, true);
  dice3d.addDicePreset({
    type: 'db',
    labels: [
      'systems/alienrpg/ui/DsN/alien-dice-b0.png',
      'systems/alienrpg/ui/DsN/alien-dice-b0.png',
      'systems/alienrpg/ui/DsN/alien-dice-b0.png',
      'systems/alienrpg/ui/DsN/alien-dice-b0.png',
      'systems/alienrpg/ui/DsN/alien-dice-b0.png',
      'systems/alienrpg/ui/DsN/alien-dice-b6.png',
    ],
    colorset: 'black',
    system: 'alienrpg',
  });
  dice3d.addDicePreset({
    type: 'ds',
    labels: [
      'systems/alienrpg/ui/DsN/alien-dice-y1.png',
      'systems/alienrpg/ui/DsN/alien-dice-y0.png',
      'systems/alienrpg/ui/DsN/alien-dice-y0.png',
      'systems/alienrpg/ui/DsN/alien-dice-y0.png',
      'systems/alienrpg/ui/DsN/alien-dice-y0.png',
      'systems/alienrpg/ui/DsN/alien-dice-y6.png',
    ],
    colorset: 'yellow',
    system: 'alienrpg',
  });
});

// Item Drag Hook
Hooks.once('ready', async function () {
  // Wait to register the Hotbar drop hook on ready sothat modulescould register earlier if theywant to
  Hooks.on('hotbarDrop', (bar, data, slot) => createAlienrpgMacro(data, slot));
});

//  Hook to watch for the Push button being pressed -   Need to refactor this so it does not fire all the time.
//
Hooks.on('renderChatMessage', (message, html, data) => {
  // console.warn('init hook here');

  html.find('i.alien-Push-button').each((i, li) => {
    // console.warn(li);
    li.addEventListener('click', function (ev) {
      // console.warn(ev);
      if (ev.target.classList.contains('alien-Push-button')) {
        // do stuff
        let actor = game.actors.get(ChatMessage.getSpeaker().actor);
        if (!actor) return ui.notifications.warn(`You do not have a token selected`);
        let token = game.actors.get(ChatMessage.getSpeaker().token);
        let reRoll = true;
        let hostile = actor.data.type;
        let blind = false;
        //  Initialse the chat message
        let chatMessage = '';

        if (actor.data.token.disposition === -1) {
          blind = true;
        }
        if (actor.data.type != 'creature') {
          actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value + 1 });
        }
        const reRoll1 = game.alienrpg.rollArr.r1Dice - game.alienrpg.rollArr.r1Six;
        const reRoll2 = game.alienrpg.rollArr.r2Dice + 1 - (game.alienrpg.rollArr.r2One + game.alienrpg.rollArr.r2Six);
        yze.yzeRoll(hostile, blind, reRoll, game.alienrpg.rollArr.tLabel, reRoll1, 'Black', reRoll2, 'Yellow');
      }
    });
  });
});

// *************************************************
// Setupthe prototype token
// *************************************************
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
      actor.token.actorLink = false;
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

// **********************************
// If the Actor dragged on to the canvas has the NPC box checked unlink the token and change the disposition to Hostile.
// **********************************
Hooks.on('preCreateToken', async (scene, tokenData) => {
  let aTarget = game.actors.find((i) => i.data.name === tokenData.name);
  if (aTarget.data.data.header.npc) {
    tokenData.disposition = CONST.TOKEN_DISPOSITIONS.HOSTILE;
    tokenData.actorLink = false;
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
