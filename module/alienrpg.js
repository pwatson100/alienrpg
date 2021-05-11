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
import { AlienConfig } from './alienRPGConfig.js';
import AlienRPGCombat from './combat.js';
import AlienRPGCTContext from './CBTracker.js';
import { sendDevMessage } from './devmsg.js';

const euclidianDistances = function (segments, options = {}) {
  const canvasSize = canvas.dimensions.size;
  const gridDistance = canvas.scene.data.gridDistance;

  return segments.map((s) => {
    let ray = s.ray;

    // Determine the total distance traveled
    let x = Math.abs(Math.ceil(ray.dx / canvasSize));
    let y = Math.abs(Math.ceil(ray.dy / canvasSize));

    return Math.hypot(x, y) * gridDistance;
  });
};

Hooks.on('canvasInit', function () {
  SquareGrid.prototype.measureDistances = euclidianDistances;
});

Hooks.once('init', async function () {
  console.warn(`Initializing Alien RPG`);
  game.alienrpg = {
    alienrpgActor,
    alienrpgItem,
    alienrpgPlanetSheet,
    yze,
    AlienConfig,
    rollItemMacro,
    registerSettings,
    AlienRPGCTContext,
  };

  // Set FVTT version constant
  const is07x = game.data.version.split('.')[1] === '7';

  // Global define for this so the roll data can be read by the reroll method.
  game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '', sCount: 0, multiPush: 0 };
  // console.warn('sCount init', game.alienrpg.rollArr.sCount);

  /**s
   * Set an initiative formula for the system
   * @type {String}
   */
  CONFIG.Combat.initiative = {
    formula: '1d10',
    decimals: 1,
  };
  // If the FVTT version is > V0.7.x initalise the Base and Stress dice terms
  // if (is07x) {
  CONFIG.Dice.terms['b'] = AlienRPGBaseDie;
  CONFIG.Dice.terms['s'] = AlienRPGStressDie;
  // }
  // debugger;
  // Define custom Entity classes
  CONFIG.ALIENRPG = ALIENRPG;
  CONFIG.Actor.documentClass = alienrpgActor;
  CONFIG.Item.documentClass = alienrpgItem;
  CONFIG.Combat.documentClass = AlienRPGCombat;
  CONFIG.CombatTracker = AlienRPGCTContext;
  CombatTracker.prototype._getEntryContextOptions = AlienRPGCTContext.getEntryContextOptions;

  // CONFIG.Planet.entityClass = alienrpgPlanet;

  // Register sheet application classes
  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('alienrpg', alienrpgItemSheet, { types: ['item', 'weapon', 'armor', 'talent', 'skill-stunts', 'agenda'], makeDefault: false });
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
  // if equal
  Handlebars.registerHelper('ifgt', function (v1, v2, options) {
    if (v1 > v2) return options.fn(this);
    else return options.inverse(this);
  });

  // Register system settings
  game.settings.register('alienrpg', 'macroShorthand', {
    name: 'ALIENRPG.DefMacro',
    hint: 'ALIENRPG.DefMacroHint',
    scope: 'world',
    type: Boolean,
    default: true,
    config: true,
  });

  game.settings.register('alienrpg', 'fontColour', {
    name: 'ALIENRPG.Fontpick',
    label: 'ALIENRPG.Colpick',
    hint: 'ALIENRPG.ColpickHint',
    icon: 'fas fa-dice-d20',
    restricted: false,
    type: String,
    config: false,
    scope: 'client',
    default: '#adff2f',
    onChange: () => {
      location.reload();
    },
  });
  game.settings.register('alienrpg', 'fontStyle', {
    name: 'ALIENRPG.FontStyle',
    label: 'ALIENRPG.StylePicker',
    hint: 'ALIENRPG.StylePickerHint',
    icon: 'fas fa-cogs',
    restricted: false,
    scope: 'client',
    type: String,
    config: false,
    default: 'Wallpoet',
    onChange: () => {
      location.reload();
    },
  });
  game.settings.registerMenu('alienrpg', 'alienrpgSettings', {
    name: 'ALIENRPG.MenuName',
    label: 'ALIENRPG.MenuLabel',
    hint: 'ALIENRPG.MenuHint',
    icon: 'fas fa-palette',
    type: AlienConfig,
    restricted: false,
  });

  // register setting for add/remove menu button
  game.settings.register('alienrpg', 'addMenuButton', {
    name: 'ALIENRPG.AddMenuName',
    hint: 'ALIENRPG.AddMenuHint',
    scope: 'world',
    config: true,
    default: AlienConfig.getDefaults.addMenuButton,
    type: Boolean,
    onChange: (enabled) => {
      AlienConfig.toggleConfigButton(enabled);
    },
  });
});

// Build the panic table if it does not exist.
Hooks.once('ready', async () => {
  // debugger;
  await AlienRPGSetup.setup();
  sendDevMessage();
  if (game.user.isGM) {
    try {
      const newVer = '2';
      if (game.journal.getName('MU/TH/ER Instructions.') !== null) {
        if (game.journal.getName('MU/TH/ER Instructions.').getFlag('alienrpg', 'ver') < newVer || game.journal.getName('MU/TH/ER Instructions.').getFlag('alienrpg', 'ver') === undefined) {
          await game.journal.getName('MU/TH/ER Instructions.').delete();
          await game.journal.importFromCollection('alienrpg.mother_instructions', `syX1CzWc8zG5jT5g`);
          await game.journal.getName('MU/TH/ER Instructions.').setFlag('alienrpg', 'ver', newVer);
          console.log('New version of MU/TH/ER Instructions.');
          await game.journal.getName('MU/TH/ER Instructions.').show();
        }
      } else {
        await game.journal.importFromCollection('alienrpg.mother_instructions', `syX1CzWc8zG5jT5g`);
        game.journal.getName('MU/TH/ER Instructions.').setFlag('alienrpg', 'ver', newVer);
        await game.journal.getName('MU/TH/ER Instructions.').show();
      }
    } catch (error) {}
  }
  // Determine whether a system migration is required and feasible
  const currentVersion = game.settings.get('alienrpg', 'systemMigrationVersion');
  const NEEDS_MIGRATION_VERSION = '1.3.5';
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
    await migrations.migrateWorld();
  }
  // clear the minimum resolution message faster

  setTimeout(() => {
    $('.notification.error').each((index, item) => {
      if ($(item).text().includes('requires a minimum screen resolution')) {
        $(item).remove();
      }
    });
  }, 250);

  let r = document.querySelector(':root');
  r.style.setProperty('--aliengreen', game.settings.get('alienrpg', 'fontColour'));
  r.style.setProperty('--alienfont', game.settings.get('alienrpg', 'fontStyle'));

  //   // Wait to register the Hotbar drop hook on ready sothat modulescould register earlier if theywant to
  Hooks.on('hotbarDrop', (bar, data, slot) => createAlienrpgMacro(data, slot));

  // setupCombatantCloning();
});

// function setupCombatantCloning() {
//   // this function replaces calls to Combat.createEmbeddedEntity to
//   // create additional combatants for xenos with a speed > 1.
//   // if relies on calling the original Combat.prototypecreateEmbeddedEntity so as long as this
//   // function is called late in the setup after any modules that want to override that function
//   // it should be compatable.
//   let originalCombatCreateEmbeddedEntity = Combat.prototype.createEmbeddedDocuments;

//   Combat.prototype.createEmbeddedDocuments = function (embeddedName, data, options) {
//     originalCombatCreateEmbeddedEntity.call(this, embeddedName, data, options); // create all the Primary combatants

//     if (embeddedName != 'Combatant') return; // presumably embeddedName would always be "Combatant" but this preserves the base behavior if not.

//     // data will be an array when combatants are created by the combat token icon.
//     // therefore only call ExtraSpeedCombatants if data is an array.
//     // this ensures cloning from inside the combattracker will make 1 clone only.
//     // toggling combat via the token can create extra speed combatants if needed.
//     // the token combat toggle is only available if the token is not already in combat.

//     if (Array.isArray(data)) data.forEach((combatant) => ExtraSpeedCombatants.call(this, combatant, options));

//     function ExtraSpeedCombatants(combatant, moptions) {
//       let token = canvas.tokens.placeables.find((i) => i.data._id == combatant.tokenId);
//       let ACTOR = game.actors.get(Actor.fromToken(token).actorId);
//       if (ACTOR == null) ACTOR = Actor.createTokenActor(token.actor, token);

//       // only creatures have speed right now.  Probably a getter method should be created like
//       // Actor.combatSpeed() to create a unified API to get the speed regardless of underlying
//       // actor type

//       if (ACTOR.data.type != 'creature') return;
//       const creatureSpeed = ACTOR.data.data.attributes?.speed?.value;
//       if (creatureSpeed > 1) {
//         const clones = [];
//         let x;
//         for (x = 1; x < creatureSpeed; x++) {
//           clones.push(token);
//         }
//         // Add extra clones to the Combat encounter for the actor's heightened speed
//         const creationData = clones.map((v) => {
//           return { tokenId: v.id, hidden: v.data.hidden };
//         });

//         originalCombatCreateEmbeddedEntity.call(this, embeddedName, creationData, moptions);
//       }
//     }
//     // debugger;
//   };
// }

// create/remove the quick access config button
Hooks.once('renderSettings', () => {
  AlienConfig.toggleConfigButton(JSON.parse(game.settings.get('alienrpg', 'addMenuButton')));
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

  dice3d.addSystem({ id: 'alienrpg', name: 'Alien RPG - Blank' }, 'exclusive');
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

  dice3d.addSystem({ id: 'alienrpgf', name: 'Alien RPG - Full Dice' }, 'exclusive');
  dice3d.addDicePreset({
    type: 'db',
    labels: [
      'systems/alienrpg/ui/DsN/b1.png',
      'systems/alienrpg/ui/DsN/b2.png',
      'systems/alienrpg/ui/DsN/b3.png',
      'systems/alienrpg/ui/DsN/b4.png',
      'systems/alienrpg/ui/DsN/b5.png',
      'systems/alienrpg/ui/DsN/alien-dice-b6.png',
    ],
    colorset: 'black',
    system: 'alienrpgf',
  });
  dice3d.addDicePreset({
    type: 'ds',
    labels: [
      'systems/alienrpg/ui/DsN/alien-dice-y1.png',
      'systems/alienrpg/ui/DsN/y2.png',
      'systems/alienrpg/ui/DsN/y3.png',
      'systems/alienrpg/ui/DsN/y4.png',
      'systems/alienrpg/ui/DsN/y5.png',
      'systems/alienrpg/ui/DsN/alien-dice-y6.png',
    ],
    colorset: 'yellow',
    system: 'alienrpgf',
  });
});

// Item Drag Hook
// Hooks.once('ready', async function () {
//   // Wait to register the Hotbar drop hook on ready sothat modulescould register earlier if theywant to
//   Hooks.on('hotbarDrop', (bar, data, slot) => createAlienrpgMacro(data, slot));
// });

//  Hook to watch for the Push button being pressed -   Need to refactor this so it does not fire all the time.
//
Hooks.on('renderChatMessage', (message, html, data) => {
  // console.warn('init hook here');

  html.find('button.alien-Push-button').each((i, li) => {
    // console.warn(li);
    li.addEventListener('click', function (ev) {
      // console.log('🚀 ~ file: alienrpg.js ~ line 332 ~ ev', ev);
      let tarG = ev.target.previousElementSibling.checked;
      // console.log('multi', tarG);

      if (ev.target.classList.contains('alien-Push-button')) {
        // do stuff
        let actor = game.actors.get(message.data.speaker.actor);
        if (!actor) return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoToken'));
        let reRoll = 'push';

        if (tarG) {
          reRoll = 'mPush';
          // game.alienrpg.rollArr.multiPush += game.alienrpg.rollArr.r1Six + game.alienrpg.rollArr.r2Six;
        }
        let hostile = actor.data.type;
        let blind = false;
        //  Initialse the chat message
        let chatMessage = '';

        if (actor.data.token.disposition === -1) {
          blind = true;
        }
        if (actor.data.type == 'character') {
          actor.update({ 'data.header.stress.value': actor.data.data.header.stress.value + 1 });
        } else return;
        const reRoll1 = game.alienrpg.rollArr.r1Dice - game.alienrpg.rollArr.r1Six;
        const reRoll2 = game.alienrpg.rollArr.r2Dice + 1 - (game.alienrpg.rollArr.r2One + game.alienrpg.rollArr.r2Six);
        yze.yzeRoll(hostile, blind, reRoll, game.alienrpg.rollArr.tLabel, reRoll1, game.i18n.localize('ALIENRPG.Black'), reRoll2, game.i18n.localize('ALIENRPG.Yellow'), actor.id);
      }
    });
  });
});

// *************************************************
// Setupthe prototype token
// *************************************************

Hooks.on('preCreateActor', (doc, createData, options, userid) => {
  mergeObject(createData, {
    'token.displayName': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    'token.displayBars': CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
    'token.disposition': CONST.TOKEN_DISPOSITIONS.FRIENDLY,
    'token.name': createData.name,
    'token.bar1': { attribute: 'header.health' },
    'token.bar2': { attribute: 'None' },
    'token.vision': true,
    'token.actorLink': true,
  });
  if (game.settings.get('alienrpg', 'defaultTokenSettings')) {
    switch (doc.type) {
      case 'character':
        mergeObject(createData, { 'token.bar2': { attribute: 'header.stress' } });
        break;
      case 'vehicles':
        mergeObject(createData, { 'token.bar1': { attribute: 'None' } });
        break;
      case 'creature':
        mergeObject(createData, { 'token.actorLink': false });
        mergeObject(createData, { 'token.disposition': CONST.TOKEN_DISPOSITIONS.HOSTILE });
        break;
      case 'synthetic':
        break;
      case 'territory':
        mergeObject(createData, { 'token.bar1': { attribute: 'None' } });
        break;
    }
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

// Hooks.on('updateToken', (actor, updates, options, userId) => {
//   // if (updates.name) {
//   //   mergeObject(updates, { 'token.name': updates.name });
//   //   // updates['token.name'] = updates.name;
//   // }
// });
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
  if (!('data' in data)) return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoActor'));
  const item = data.data;

  // Create the macro command
  const command = `game.alienrpg.rollItemMacro("${item.name}");`;
  let macro = game.macros.contents.find((m) => m.name === item.name && m.command === command);
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
  if (!item) return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoItem') + ' ' + ` ${itemName}`);

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
class Utils {
  /**
   *
   * @param cfg
   * @returns {{}}
   */
  static localize(cfg) {
    return Object.keys(cfg).reduce((i18nCfg, key) => {
      i18nCfg[key] = game.i18n.localize(cfg[key]);
      return i18nCfg;
    }, {});
  }
}
