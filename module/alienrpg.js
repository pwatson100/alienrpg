// Import Modules
import registerActors from './register-actors.js';
import { alienrpgActor } from './actor/actor.js';
// import { alienrpgActor } from './actor/actor.js';
import { alienrpgItem } from './item/item.js';
import { alienrpgItemSheet } from './item/item-sheet.js';
import { yze } from './YZEDiceRoller.js';
import { ALIENRPG } from './config.js';
import registerSettings from './settings.js';
import { preloadHandlebarsTemplates } from './templates.js';
import { AlienRPGBaseDie } from './alienRPGBaseDice.js';
import { AlienRPGStressDie } from './alienRPGBaseDice.js';
import * as migrations from './migration.js';
import { AlienConfig } from './alienRPGConfig.js';
import AlienRPGCombat from './combat.js';
import AlienRPGCTContext from './CBTracker.js';
import { sendDevMessage } from './devmsg.js';
import { COMMON } from './common.js';
import { logger } from './logger.js';
import { ModuleImport, ImportFormWrapper } from './apps/init.js';
import { moduleKey, adventurePackName, adventurePack, moduleTitle } from './apps/init.js';
import { enrichTextEditors } from './enricher.js';

const includeRgx = new RegExp('/systems/alienrpg/module/');
CONFIG.compatibility.includePatterns.push(includeRgx);

// CONFIG.debug.hooks = true;

const euclidianDistances = function (segments, options = {}) {
	const canvasSize = canvas.dimensions.size;
	const gridDistance = canvas.scene.grid.distance;

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

/*
  Initialize Module
*/
COMMON.build();

const SUB_MODULES = {
	COMMON,
	logger,
};

Hooks.once('init', async function () {
	console.warn(`Initializing Alien RPG`);
	game.alienrpg = {
		alienrpgActor,
		alienrpgItem,
		yze,
		ModuleImport,
		ImportFormWrapper,
		rollItemMacro,
		registerSettings,
		AlienRPGCTContext,
	};

	Object.values(SUB_MODULES).forEach((cl) => {
		logger.info(COMMON.localize('alienrpg.Init.SubModule', { name: cl.NAME }));
		cl.register();
	});

	// Set FVTT version constant
	// const is07x = game.data.version.split('.')[1] === '7';

	// Global define for this so the roll data can be read by the reroll method.
	game.alienrpg.rollArr = { r1Dice: 0, r1One: 0, r1Six: 0, r2Dice: 0, r2One: 0, r2Six: 0, tLabel: '', sCount: 0, multiPush: 0 };
	// console.warn('sCount init', game.alienrpg.rollArr.sCount);

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
		formula: '1d10',
		decimals: 2,
	};

	CONFIG.Dice.terms['b'] = AlienRPGBaseDie;
	CONFIG.Dice.terms['s'] = AlienRPGStressDie;

	// Define custom Entity classes
	CONFIG.ALIENRPG = ALIENRPG;
	CONFIG.Actor.documentClass = alienrpgActor;
	CONFIG.Item.documentClass = alienrpgItem;
	CONFIG.Combat.documentClass = AlienRPGCombat;
	CONFIG.CombatTracker = AlienRPGCTContext;
	CombatTracker.prototype._getEntryContextOptions = AlienRPGCTContext.getEntryContextOptions;
	CONFIG.ImportFormWrapper = ImportFormWrapper;

	game.alienrpg.config = ALIENRPG;
	// Register sheet application classes
	Items.unregisterSheet('core', ItemSheet);
	Items.registerSheet('alienrpg', alienrpgItemSheet, {
		types: [
			'item',
			'weapon',
			'armor',
			'talent',
			'skill-stunts',
			'agenda',
			'specialty',
			'planet-system',
			'critical-injury',
			'spacecraft-crit',
			'spacecraftmods',
			'spacecraftweapons',
			'colony-initiative',
		],
		makeDefault: false,
	});
	registerSettings();
	registerActors();

	enrichTextEditors();

	// Preload Handlebars Templates
	preloadHandlebarsTemplates();

	Handlebars.registerHelper('alienConcat', function () {
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
	Handlebars.registerHelper('addstats', function (v1, v2) {
		return v1 + v2;
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
	// if Greater than
	Handlebars.registerHelper('ifgt', function (v1, v2, options) {
		if (v1 > v2) return options.fn(this);
		else return options.inverse(this);
	});
	// if Less than
	Handlebars.registerHelper('iflt', function (v1, v2, options) {
		if (v1 < v2) return options.fn(this);
		else return options.inverse(this);
	});

	Handlebars.registerHelper('gRng', function (value, options) {
		let g = '';
		switch (value) {
			case '1':
				g = game.i18n.localize('ALIENRPG.Engaged');
				return g;
			case '2':
				g = game.i18n.localize('ALIENRPG.Short');
				return g;
			case '3':
				g = game.i18n.localize('ALIENRPG.Medium');
				return g;
			case '4':
				g = game.i18n.localize('ALIENRPG.Long');
				return g;
			case '5':
				g = game.i18n.localize('ALIENRPG.Extreme');
				return g;
			case '6':
				g = game.i18n.localize('ALIENRPG.Contact');
				return g;
			case '7':
				g = game.i18n.localize('ALIENRPG.Surface');
				return g;
		}
	});

	Handlebars.registerHelper('striptags', function (txt) {
		// console.log(txt);
		// exit now if text is undefined
		if (typeof txt == 'undefined') return;
		// the regular expresion
		var regexp = /<[\/\w]+>/g;
		// replacing the text
		return txt.replace(regexp, '');
	});

	/*
	 * Repeat given markup with n times
	 */
	Handlebars.registerHelper('times', function (n, block) {
		var result = '';
		for (let i = 0; i < n; ++i) {
			result += block.fn(i);
		}
		return result;
	});
});

// Build the panic table if it does not exist.
Hooks.once('ready', async () => {
	// debugger;

	sendDevMessage();
	showReleaseNotes();
	alienRPGCRTWarning();

	// Determine whether a system migration is required and feasible
	const currentVersion = game.settings.get('alienrpg', 'systemMigrationVersion');
	const NEEDS_MIGRATION_VERSION = '2.1.0';
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
	r.style.setProperty('--aliendarkergreen', game.settings.get('alienrpg', 'aliendarkergreen'));
	r.style.setProperty('--alienitemselect', game.settings.get('alienrpg', 'alienitemselect'));
	r.style.setProperty('--alienoddtab', game.settings.get('alienrpg', 'alienoddtab'));
	r.style.setProperty('--alientextjournal', game.settings.get('alienrpg', 'JournalFontColour'));
	if (game.settings.get('alienrpg', 'switchJournalColour')) {
		r.style.setProperty('--journalback', `#000000`);
	}
	if (game.settings.get('alienrpg', 'switchchatbackground')) {
		// r.style.setProperty('--chatbackground', `#000000`);
		r.style.setProperty('--chatbackground', `url('/systems/alienrpg/images/chat-middle.png')`);
	}

	AlienConfig.toggleConfigButton(JSON.parse(game.settings.get('alienrpg', 'addMenuButton')));

	setupMacroFolders();
});

//   // Wait to register the Hotbar drop hook on ready sothat modulescould register earlier if theywant to
Hooks.on('hotbarDrop', (bar, data, slot) => {
	let item = fromUuidSync(data.uuid);
	if (item && item.system && (item.type === 'weapon' || item.type === 'armor')) {
		createAlienrpgMacro(item, slot);
		return false;
	}
});

Hooks.on('renderPause', (_app, html, options) => {
	html.find('img[src="icons/svg/clockwork.svg"]').attr('src', 'systems/alienrpg/images/paused-alien.png');
});

// prevent players from deleting messages with rolls
Hooks.on('preDeleteChatMessage', (message) => {
	if (!game.user.isGM && message.rolls?.length) {
		ui.notifications.warn('No deleting messages');
		return false;
	}
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

	dice3d.addColorset(
		{
			name: 'AlienBlack',
			description: 'AlienBlack',
			category: 'Colors',
			foreground: ['#ffffff'],
			background: ['#000000'],
			outline: 'black',
			texture: 'none',
		},
		'preferred'
	);

	dice3d.addSystem({ id: 'alienrpg', name: 'Alien RPG - Blank' }, 'preferred');
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
		colorset: 'AlienBlack',
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

	dice3d.addSystem({ id: 'alienrpgf', name: 'Alien RPG - Full Dice' });
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
		colorset: 'AlienBlack',
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

//  Hook to watch for the Push button being pressed -   Need to refactor this so it does not fire all the time.
//

Hooks.on('renderChatMessage', (message, html, data) => {
	html.find('button.alien-Push-button').each((i, li) => {
		let hostile = '';
		li.addEventListener('click', function (ev) {
			let tarG = ev.target.previousElementSibling.checked;

			if (ev.target.classList.contains('alien-Push-button')) {
				// do stuff
				let actor = game.actors.get(message.speaker.actor);
				if (!actor) return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoToken'));
				let reRoll = 'push';

				if (tarG) {
					reRoll = 'mPush';
				}

				hostile = actor.type;
				let blind = false;

				if (actor.prototypeToken.disposition === -1) {
					blind = true;
				}

				switch (actor.type) {
					case 'character':
						actor.pushRoll(actor, reRoll, hostile, blind, message);
						break;
					default:
						return;
				}
			}
		});
	});
});

// // **********************************
// // If the Actor dragged on to the canvas has the NPC box checked unlink the token and change the disposition to Hostile.
// // **********************************

Hooks.on('preCreateToken', async (document, tokenData, options, userID) => {
	let createChanges = {};
	let aTarget = game.actors.find((i) => i.name == tokenData.name);
	if (aTarget.type !== 'spacecraft' && aTarget.system.header.npc) {
		foundry.utils.mergeObject(createChanges, {
			disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
			actorLink: false,
		});
		document.updateSource(createChanges);

		// await document.data.update({ disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE, actorLink: false });
	}
});

Hooks.once('setup', function () {
	const toLocalize = ['skills', 'attributes', 'creatureattributes', 'creaturedefence', 'general', 'vehicleattributes', 'spacecraftattributes'];
	for (let o of toLocalize) {
		CONFIG.ALIENRPG[o] = Object.entries(CONFIG.ALIENRPG[o]).reduce((obj, e) => {
			obj[e[0]] = game.i18n.localize(e[1]);

			return obj;
		}, {});
	}
});

Hooks.on('dropActorSheetData', async (actor, sheet, data) => {
	// When dropping something on a vehicle sheet.
	if (actor.type === 'vehicles' || actor.type === 'spacecraft') {
		// When dropping an actor on a vehicle sheet.
		let crew = await fromUuid(data.uuid);
		if (data.type === 'Actor') sheet._dropCrew(crew.id);
	}
});

function setupMacroFolders() {
	if (!game.user.isGM) {
		// Only make changes to system
		return;
	}
	const folderName = 'Alien RPG System Macros';
	let folder = game.folders.filter((f) => f.type === 'Macro').find((f) => f.name === folderName);
	if (!folder) {
		Folder.create({
			name: folderName,
			type: 'Macro',
			parent: null,
		});
	}
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} data     The dropped data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createAlienrpgMacro(item, slot) {
	const folder = game.folders.filter((f) => f.type === 'Macro').find((f) => f.name === 'Alien RPG System Macros');
	// Create the macro command
	const command = `game.alienrpg.rollItemMacro("${item.name}");`;
	let macro = game.macros.find(
		(m) =>
			m.name === item.name &&
			m.command === command &&
			(m.author === game.user.id ||
				m.ownership.default >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER ||
				m.ownership[game.user.id] >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
	);
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: 'script',
			img: item.img,
			command: command,
			flags: { 'alienrpg.itemMacro': true },
			folder: folder?.id,
			'ownership.default': CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER,
		});
	}
	game.user.assignHotbarMacro(macro, slot);
}

function rollItemMacro(itemName) {
	const speaker = ChatMessage.getSpeaker();
	let actor;
	if (speaker.token) actor = game.actors.tokens[speaker.token];
	if (!actor) actor = game.actors.get(speaker.actor);
	// console.warn('alienrpg.js 155 - Got here', speaker, actor);
	const item = actor ? actor.items.find((i) => i.name === itemName) : null;
	if (!item) return ui.notifications.warn(game.i18n.localize('ALIENRPG.NoItem') + ' ' + ` ${itemName}`);
	if (!item.system.header.active) return ui.notifications.warn(game.i18n.localize('ALIENRPG.NotActive') + ' ' + ` ${itemName}`);

	// Trigger the item roll
	return item.roll();
}

async function showReleaseNotes() {
	if (game.user.isGM) {
		try {
			const newVer = game.system.version;
			const releaseNoteName = 'MU/TH/ER Instructions.';

			let currentVer = '0';
			let oldReleaseNotes = game.journal.getName(releaseNoteName);
			if (oldReleaseNotes !== undefined && oldReleaseNotes !== null && oldReleaseNotes.getFlag('alienrpg', 'ver') !== undefined) {
				currentVer = oldReleaseNotes.getFlag('alienrpg', 'ver');
			}
			if (newVer === currentVer) {
				// Up to date
				return;
			}
			const pack = game.packs.get(adventurePack);
			const adventureId = pack.index.find((a) => a.name === adventurePackName)?._id;
			logger.info(`For ${adventurePackName} the Id is: ${adventureId}`);
			const adventure = await pack.getDocument(adventureId);
			const adventureData = adventure.toObject();
			const newData = { updateAssets: [] };

			const toUpdate = {};

			let newUpdate = [];
			const selected = game.journal.getName(releaseNoteName).id;
			const element = selected;

			for (const [field, cls] of Object.entries(Adventure.contentFields)) {
				if (adventureData[field].length > 0 && field != 'folders') {
					newData['updateAssets'].push({ section: field, sectionData: adventureData[field] });
				}
			}

			newData['updateAssets'].sort((a, b) => (a.section > b.section ? 1 : b.section > a.section ? -1 : 0));
			// newData['updateAssets'].sort();
			let spanner = foundry.utils.mergeObject(newData);
			newUpdate.push(spanner.updateAssets[1].sectionData[0]);
			toUpdate[Adventure.contentFields.journal.documentName] = newUpdate;

			if (toUpdate) {
				for (const [documentName, updateData] of Object.entries(toUpdate)) {
					const cls = getDocumentClass(documentName);
					const u = await cls.updateDocuments(updateData, { diff: false, recursive: false, noHook: true });
				}
			}
			let newReleaseJournal = game.journal.getName(releaseNoteName);
			await newReleaseJournal.setFlag('alienrpg', 'ver', newVer);

			// Show journal
			await newReleaseJournal.sheet.render(true, { sheetMode: 'text' });
		} catch (error) {
			// logger.debug('Error', error);
		} // end of try
	} // end of if(isgm)
}

async function alienRPGCRTWarning() {
	if (game.user.isGM) {
		if (game.modules.get('alien-crt-ui')?.active) {
			// If dice so nice is older than 4.2.2 - lets notify
			ui.notifications.warn(
				'You need to disable Alien RPG CRT UI as is has not been updated in some time and no longer works with the system and will corrupt your actors/items.  See the MO/TH/ER Instructions as it has been built in to the system for some time.',
				{ permanent: true }
			);
		}
	}
}

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
