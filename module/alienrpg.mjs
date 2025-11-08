// Import document classes.

import {
	adventurePack,
	adventurePackName,
	ImportFormWrapper,
	ModuleImport,
	moduleKey,
	moduleTitle,
} from "./apps/init.mjs"
// Import DataModel classes
import * as models from "./data/_module.mjs"
import * as ActiveEffect from "./data/effect/_module.mjs"
import { alienrpgActor } from "./documents/actor.mjs"
import { alienrpgItem } from "./documents/item.mjs"
import { AlienRPGBaseDie, AlienRPGStressDie } from "./helpers/alienRPGBaseDice.mjs"
import { AlienConfig } from "./helpers/alienRPGConfig.mjs"
import { COMMON } from "./helpers/common.mjs"
// Import helper/utility classes and constants.
import { ALIENRPG } from "./helpers/config.mjs"
import { enrichTextEditors } from "./helpers/enricher.mjs"
import { initializeHandlebars } from "./helpers/handlebars.mjs"
import { logger } from "./helpers/logger.mjs"
import registerSettings from "./helpers/settings.mjs"
import { yze } from "./helpers/YZEDiceRoller.mjs"
import { AlienRPGActiveEffectConfig } from "./sheets/active-effect-config.mjs"
// import { addSlowAndFastActions } from './combat-slow-fast.js';

// Import sheet classes.
import { alienrpgCharacterSheet } from "./sheets/character-sheet.mjs"
import { alienrpgCreatureSheet } from "./sheets/creature-sheet.mjs"
import { alienrpgItemSheet } from "./sheets/item-sheet.mjs"
import { alienrpgSpacecraftSheet } from "./sheets/spacecraft-sheet.mjs"
import { alienrpgSyntheticSheet } from "./sheets/synthetic-sheet.mjs"
import { alienrpgTerritorySheet } from "./sheets/territory-sheet.mjs"
import { alienrpgVehicleSheet } from "./sheets/vehicle-sheet.mjs"

const collections = foundry.documents.collections
const sheets = foundry.appv1.sheets

const includeRgx = /\/systems\/ALIENRPG\/module\//
CONFIG.compatibility.includePatterns.push(includeRgx)

// CONFIG.debug.hooks = true;

const euclidianDistances = (segments, options = {}) => {
	const canvasSize = canvas.dimensions.size
	const gridDistance = canvas.scene.grid.distance

	return segments.map((s) => {
		const ray = s.ray

		// Determine the total distance traveled
		const x = Math.abs(Math.ceil(ray.dx / canvasSize))
		const y = Math.abs(Math.ceil(ray.dy / canvasSize))

		return Math.hypot(x, y) * gridDistance
	})
}

Hooks.on("canvasInit", () => {
	if (game.release.generation < 12) {
		// gameCanvas.grid.diagonalRule = game.settings.get('alienrpg', 'diagonalMovement');
		SquareGrid.prototype.measureDistances = euclidianDistances
	}

	foundry.grid.SquareGrid.measureDistances = euclidianDistances
})

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

const SUB_MODULES = {
	COMMON,
	logger,
}

// Add key classes to the global scope so they can be more easily used
// by downstream developers

// globalThis.ALIENRPG = {

Hooks.once("init", () => {
	console.warn("Initializing Alien RPG")
	game.alienrpg = {
		alienrpgActor,
		alienrpgItem,
		ActiveEffect,
		AlienRPGActiveEffectConfig,
		alienrpgCharacterSheet,
		alienrpgSyntheticSheet,
		alienrpgCreatureSheet,
		alienrpgVehicleSheet,
		alienrpgTerritorySheet,
		alienrpgSpacecraftSheet,
		alienrpgItemSheet,
		yze,
		registerSettings,
		rollItemMacro,
		ModuleImport,
		ImportFormWrapper,
	}
	// Add custom constants for configuration.
	CONFIG.ALIENRPG = ALIENRPG

	Object.values(SUB_MODULES).forEach((cl) => {
		logger.info(COMMON.localize("ALIENRPG.Init.SubModule", { name: cl.NAME }))
		cl.register()
	})

	// Global define for this so the roll data can be read by the reroll method.
	game.alienrpg.rollArr = {
		r1Dice: 0,
		r1One: 0,
		r1Six: 0,
		r2Dice: 0,
		r2One: 0,
		r2Six: 0,
		tLabel: "",
		sCount: 0,
		multiPush: 0,
	}
	// console.warn('sCount init', game.alienrpg.rollArr.sCount);
	const { DocumentSheetConfig } = foundry.applications.apps

	/**
	 * Set an initiative formula for the system
	 * @type {String}
	 */
	CONFIG.Combat.initiative = {
		formula: "1d10",
		decimals: 2,
	}

	CONFIG.Dice.terms["b"] = AlienRPGBaseDie
	CONFIG.Dice.terms["s"] = AlienRPGStressDie

	// Define custom Document and DataModel classes
	CONFIG.Actor.documentClass = alienrpgActor

	// Note that you don't need to declare a DataModel
	// for the base actor/item classes - they are included
	// with the Character/NPC as part of super.defineSchema()
	CONFIG.Actor.dataModels = {
		character: models.alienrpgCharacter,
		synthetic: models.alienrpgSynthetic,
		creature: models.alienrpgCreature,
		vehicles: models.alienrpgVehicle,
		territory: models.alienrpgTerritory,
		spacecraft: models.alienrpgSpacecraft,
	}
	CONFIG.Item.documentClass = alienrpgItem
	CONFIG.Item.dataModels = {
		item: models.alienrpgItem,
		weapon: models.alienrpgWeapon,
		"skill-stunts": models.alienrpgStunts,
		talent: models.alienrpgTalent,
		"critical-injury": models.alienrpgCritInj,
		agenda: models.alienrpgAgenda,
		armor: models.alienrpgArmor,
		specialty: models.alienrpgSpecialty,
		spacecraftweapons: models.alienrpgSpaceCraftWeapons,
		spacecraftmods: models.alienrpgSpaceCraftMods,
		"spacecraft-crit": models.alienrpgSpacecraftCrit,
		"planet-system": models.alienrpgPlanetSystem,
		"colony-initiative": models.alienrpgColonyInitiative,
	}

	// Active Effects are never copied to the Actor,
	// but will still apply to the Actor from within the Item
	// if the transfer property on the Active Effect is true.
	CONFIG.ActiveEffect.legacyTransferral = false

	// Register sheet application classes
	collections.Actors.unregisterSheet("core", sheets.ActorSheet)
	collections.Actors.registerSheet("alienrpg", alienrpgCharacterSheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Character",
	})
	collections.Actors.registerSheet("alienrpg", alienrpgSyntheticSheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Synthetic",
	})
	collections.Actors.registerSheet("alienrpg", alienrpgCreatureSheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Creature",
	})
	collections.Actors.registerSheet("alienrpg", alienrpgVehicleSheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Vehicle",
	})
	collections.Actors.registerSheet("alienrpg", alienrpgTerritorySheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Territory",
	})
	collections.Actors.registerSheet("alienrpg", alienrpgSpacecraftSheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Spacecraft",
	})
	collections.Items.unregisterSheet("core", sheets.ItemSheet)
	collections.Items.registerSheet("alienrpg", alienrpgItemSheet, {
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Item",
	})
	collections.Items.registerSheet("alienrpg", alienrpgItemSheet, {
		types: [
			"item",
			"weapon",
			"stunts",
			"talent",
			"critical-injury",
			"agenda",
			"armor",
			"specialty",
			"spacecraftweapons",
			"spacecraftmods",
			"spacecraft-crit",
			"planet-system",
			"colony-initiative",
		],
		makeDefault: true,
		label: "ALIENRPG.SheetLabels.Item",
	})
	DocumentSheetConfig.unregisterSheet(ActiveEffect, "core", foundry.applications.sheets.ActiveEffectConfig)
	DocumentSheetConfig.registerSheet(ActiveEffect, "alienrpg", AlienRPGActiveEffectConfig, {
		makeDefault: true,
		label: "ALIENRPG.SHEET.Labels.ActiveEffect",
	})

	game.alienrpg.config = ALIENRPG

	//Remove Status Effects Not Available in DrawSteel
	const toRemove = [
		"bless",
		"corrode",
		"curse",
		"degen",
		"disease",
		"upgrade",
		"fireShield",
		"fear",
		"holyShield",
		"hover",
		"coldShield",
		"magicShield",
		"paralysis",
		"poison",
		"regen",
		"restrain",
		"shock",
		"silence",
		"downgrade",
		"fly",
		"invisible",
		"eye",
		"deaf",
		"burrow",
		"sleep",
		"frozen",
		"blind",
		"bleeding",
		"burning",
		"keepingcool",
		// "spooked",
		// "twitchy",
		// "loseitem",
		// "noisy",
	]
	CONFIG.statusEffects = CONFIG.statusEffects.filter((effect) => !toRemove.includes(effect.id))
	// Status Effect Transfer
	for (const [id, value] of Object.entries(ALIENRPG.conditions)) {
		CONFIG.statusEffects.push({ id, _id: id.padEnd(16, "0"), ...value, tableNumber: value.tableNumber })
	}
	// for (const [id, value] of Object.entries(DS_CONST.staminaEffects)) {
	// 	CONFIG.statusEffects.push({ id, _id: id.padEnd(16, '0'), ...value });
	// }

	/* -------------------------------------------- */
	/*  Handlebars Helpers                          */
	/* -------------------------------------------- */
	initializeHandlebars()

	registerSettings()

	enrichTextEditors()
})

/* -------------------------------------------- */
/*  Ready Hook                                  */
/* -------------------------------------------- */

Hooks.once("ready", async () => {
	// Wait to register hotbar drop hook on ready so that modules could register earlier if they want to
	Hooks.on("hotbarDrop", (bar, data, slot) => createDocMacro(data, slot))

	// sendDevMessage()
	// showReleaseNotes()

	// Determine whether a system migration is required and feasible
	// const currentVersion = game.settings.get("alienrpg", "systemMigrationVersion")
	// const NEEDS_MIGRATION_VERSION = "2.1.0"
	// const COMPATIBLE_MIGRATION_VERSION = "0" || isNaN("NaN")
	// const needMigration = currentVersion < NEEDS_MIGRATION_VERSION || currentVersion === null
	// console.warn("needMigration", needMigration, currentVersion)
	// // Perform the migration
	// if (needMigration && game.user.isGM) {
	// 	if (currentVersion && currentVersion < COMPATIBLE_MIGRATION_VERSION) {
	// 		ui.notifications.error(
	// 			"Your AlienRPG system data is from too old a Foundry version and cannot be reliably migrated to the latest version. The process will be attempted, but errors may occur.",
	// 			{ permanent: true },
	// 		)
	// 	}
	// 	await migrations.migrateWorld()
	// }

	setTimeout(() => {
		$(".notification.error").each((index, item) => {
			if ($(item).text().includes("requires a minimum screen resolution")) {
				$(item).remove()
			}
		})
	}, 250)

	const r = document.querySelector(":root")
	r.style.setProperty("--aliengreen", game.settings.get("alienrpg", "fontColour"))
	r.style.setProperty("--alienfont", game.settings.get("alienrpg", "fontStyle"))
	r.style.setProperty("--aliendarkergreen", game.settings.get("alienrpg", "aliendarkergreen"))
	r.style.setProperty("--alienitemselect", game.settings.get("alienrpg", "alienitemselect"))
	r.style.setProperty("--alienoddtab", game.settings.get("alienrpg", "alienoddtab"))
	r.style.setProperty("--alientextjournal", game.settings.get("alienrpg", "JournalFontColour"))
	if (game.settings.get("alienrpg", "switchJournalColour")) {
		r.style.setProperty("--journalback", "#000000")
	}
	if (game.settings.get("alienrpg", "switchchatbackground")) {
		r.style.setProperty("--chatbackground", `url('../images/chat-middle.png')`)
	}

	AlienConfig.toggleConfigButton(JSON.parse(game.settings.get("alienrpg", "addMenuButton")))

	// addSlowAndFastActions()

	// Set turnmarker to the Alien symbol
	if (game.settings.get("core", "combatTrackerConfig").turnMarker.src.length === 0) {
		game.settings.set("core", "combatTrackerConfig", {
			turnMarker: { src: "systems/alienrpg/images/paused-alien.png" },
		})
	}
})

Hooks.on("renderGamePause", (_app, html, options) => {
	// Hooks.on('pauseGame', (_app, html, options) => {
	document.getElementById("pause").innerHTML =
		`<img src="systems/alienrpg/images/paused-alien.png" class="fa-spin"><figcaption>GAME PAUSED</figcaption>`
})

// Hooks.on("dropActorSheetData", async (actor, sheet, data) => {
// 	// When dropping something on a vehicle sheet.
// 	if (actor.type === "vehicles" || actor.type === "spacecraft") {
// 		// When dropping an actor on a vehicle sheet.
// 		const crew = await fromUuid(data.uuid)
// 		if (data.type === "Actor") await sheet._dropCrew(crew.id)
// 	}
// })

// // **********************************
// // If the Actor dragged on to the canvas has the NPC box checked unlink the token and change the disposition to Hostile.
// // **********************************

Hooks.on("preCreateToken", async (document, tokenData, options, userID) => {
	const createChanges = {}
	const aTarget = game.actors.find((i) => i.name === tokenData.name)
	if (aTarget.type !== "spacecraft" && aTarget.system.header.npc) {
		foundry.utils.mergeObject(createChanges, {
			disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE,
			actorLink: false,
		})
		document.updateSource(createChanges)
	}
})
// ***************************
// DsN V3 Hooks
// ***************************
Hooks.on("diceSoNiceRollComplete", (chatMessageID) => {})

Hooks.once("diceSoNiceReady", (dice3d) => {
	dice3d.addColorset({
		name: "yellow",
		description: "Yellow",
		category: "Colors",
		foreground: ["#e3e300"],
		background: ["#e3e300"],
		outline: "black",
		texture: "none",
	})

	dice3d.addColorset(
		{
			name: "AlienBlack",
			description: "AlienBlack",
			category: "Colors",
			foreground: ["#ffffff"],
			background: ["#000000"],
			outline: "black",
			texture: "none",
		},
		"preferred",
	)

	dice3d.addSystem({ id: "alienrpg", name: "Alien RPG - Blank" }, "preferred")
	dice3d.addDicePreset({
		type: "db",
		labels: [
			"systems/alienrpg/ui/DsN/alien-dice-b0.png",
			"systems/alienrpg/ui/DsN/alien-dice-b0.png",
			"systems/alienrpg/ui/DsN/alien-dice-b0.png",
			"systems/alienrpg/ui/DsN/alien-dice-b0.png",
			"systems/alienrpg/ui/DsN/alien-dice-b0.png",
			"systems/alienrpg/ui/DsN/alien-dice-b6.png",
		],
		colorset: "AlienBlack",
		system: "alienrpg",
	})
	dice3d.addDicePreset({
		type: "ds",
		labels: [
			"systems/alienrpg/ui/DsN/alien-dice-y1.png",
			"systems/alienrpg/ui/DsN/alien-dice-y0.png",
			"systems/alienrpg/ui/DsN/alien-dice-y0.png",
			"systems/alienrpg/ui/DsN/alien-dice-y0.png",
			"systems/alienrpg/ui/DsN/alien-dice-y0.png",
			"systems/alienrpg/ui/DsN/alien-dice-y6.png",
		],
		colorset: "yellow",
		system: "alienrpg",
	})

	dice3d.addSystem({ id: "alienrpgf", name: "Alien RPG - Full Dice" })
	dice3d.addDicePreset({
		type: "db",
		labels: [
			"systems/alienrpg/ui/DsN/b1.png",
			"systems/alienrpg/ui/DsN/b2.png",
			"systems/alienrpg/ui/DsN/b3.png",
			"systems/alienrpg/ui/DsN/b4.png",
			"systems/alienrpg/ui/DsN/b5.png",
			"systems/alienrpg/ui/DsN/alien-dice-b6.png",
		],
		colorset: "AlienBlack",
		system: "alienrpgf",
	})
	dice3d.addDicePreset({
		type: "ds",
		labels: [
			"systems/alienrpg/ui/DsN/alien-dice-y1.png",
			"systems/alienrpg/ui/DsN/y2.png",
			"systems/alienrpg/ui/DsN/y3.png",
			"systems/alienrpg/ui/DsN/y4.png",
			"systems/alienrpg/ui/DsN/y5.png",
			"systems/alienrpg/ui/DsN/alien-dice-y6.png",
		],
		colorset: "yellow",
		system: "alienrpgf",
	})
})

Hooks.on("renderChatMessage", (message, html, data) => {
	html.find("button.alien-Push-button").each((i, li) => {
		let hostile = ""
		li.addEventListener("click", (ev) => {
			const tarG = ev.target.previousElementSibling.checked

			if (ev.target.classList.contains("alien-Push-button")) {
				// do stuff
				const actor = game.actors.get(message.speaker.actor)
				if (!actor) return ui.notifications.warn(game.i18n.localize("ALIENRPG.NoToken"))
				let reRoll = "push"

				if (tarG) {
					reRoll = "mPush"
				}

				hostile = actor.type
				let blind = false

				if (actor.prototypeToken.disposition === -1) {
					blind = true
				}

				switch (actor.type) {
					case "character":
						actor.pushRoll(actor, reRoll, hostile, blind, message)
						break
					default:
						return
				}
			}
		})
	})
})

// Hooks.on("renderChatMessage", (message, html, data) => {
// 	let listenArea = ""
// 	listenArea = document.querySelectorAll(".chat-log")
// 	if (!listenArea) return
// 	for (const addButton of listenArea) {
// 		let hostile = ""

// 		addButton.addEventListener("click", async (ev) => {
// 			// switch (ev.target.getElementsByClassName("button.alien-Push-button")) {
// 			if (ev.target.getElementsByClassName("button.alien-Push-button")) {
// 				const tarG = ev.target.previousElementSibling.checked

// 				// case "push": {
// 				ev.preventDefault()
// 				ev.stopPropagation()
// 				// const message = game.messages.get(ev.target.getAttribute("data-message-id"))
// 				const actor = game.actors.get(message.speaker.actor)
// 				// if (!actor) return ui.notifications.warn(game.i18n.localize("ALIENRPG.NoToken"))
// 				let reRoll = "push"

// 				if (tarG) {
// 					reRoll = "mPush"
// 				}

// 				hostile = actor.type
// 				let blind = false

// 				if (actor.prototypeToken.disposition === -1) {
// 					blind = true
// 				}

// 				switch (actor.type) {
// 					case "character":
// 						actor.pushRoll(actor, reRoll, hostile, blind, message)
// 						break
// 					default:
// 						return
// 				}
// 				// }
// 			}
// 		})
// 	}
// })

// Register the settings for the Year Zero Engine: Combat module.
Hooks.once("yzeCombatReady", (yzec) =>
	yzec.register({
		actorSpeedAttribute: "system.attributes.speed.value",
		duplicateCombatantOnCombatStart: true,
	}),
)

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
async function createDocMacro(data, slot) {
	// First, determine if this is a valid owned item.
	if (data.type !== "Item") return
	if (!data.uuid.includes("Actor.") && !data.uuid.includes("Token.")) {
		return ui.notifications.warn("You can only create macro buttons for owned Items")
	}
	// If it is, retrieve it based on the uuid.
	const item = await Item.fromDropData(data)

	// Create the macro command using the uuid.
	const command = `game.alienrpg.rollItemMacro("${data.uuid}");`
	let macro = game.macros.find((m) => m.name === item.name && m.command === command)
	if (!macro) {
		macro = await Macro.create({
			name: item.name,
			type: "script",
			img: item.img,
			command: command,
			flags: { "alienrpg.itemMacro": true },
		})
	}
	game.user.assignHotbarMacro(macro, slot)
	return false
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemUuid
 */
function rollItemMacro(itemUuid) {
	// Reconstruct the drop data so that we can load the item.
	const dropData = {
		type: "Item",
		uuid: itemUuid,
	}
	// Load the item from the uuid.
	Item.fromDropData(dropData).then((item) => {
		// Determine if the item loaded and if it's an owned item.
		if (!item || !item.parent) {
			const itemName = item?.name ?? itemUuid
			return ui.notifications.warn(`Could not find item ${itemName}. You may need to delete and recreate this macro.`)
		}

		// Trigger the item roll
		item.roll()
	})

	async function showReleaseNotes() {
		if (game.user.isGM) {
			try {
				const newVer = game.system.version
				const releaseNoteName = "MU/TH/ER Instructions."

				let currentVer = "0"
				const oldReleaseNotes = game.journal.getName(releaseNoteName)
				if (
					oldReleaseNotes !== undefined &&
					oldReleaseNotes !== null &&
					oldReleaseNotes.getFlag("alienrpg", "ver") !== undefined
				) {
					currentVer = oldReleaseNotes.getFlag("alienrpg", "ver")
				}
				if (newVer === currentVer) {
					// Up to date
					return
				}
				const pack = game.packs.get(adventurePack)
				const adventureId = pack.index.find((a) => a.name === adventurePackName)?._id
				logger.info(`For ${adventurePackName} the Id is: ${adventureId}`)
				const adventure = await pack.getDocument(adventureId)
				const adventureData = adventure.toObject()
				const newData = { updateAssets: [] }

				const toUpdate = {}

				const newUpdate = []
				const selected = game.journal.getName(releaseNoteName).id
				const element = selected

				for (const [field, cls] of Object.entries(Adventure.contentFields)) {
					if (adventureData[field].length > 0 && field != "folders") {
						newData["updateAssets"].push({ section: field, sectionData: adventureData[field] })
					}
				}

				newData["updateAssets"].sort((a, b) => (a.section > b.section ? 1 : b.section > a.section ? -1 : 0))
				// newData['updateAssets'].sort();
				const spanner = foundry.utils.mergeObject(newData)
				newUpdate.push(spanner.updateAssets[1].sectionData[0])
				toUpdate[Adventure.contentFields.journal.documentName] = newUpdate

				if (toUpdate) {
					for (const [documentName, updateData] of Object.entries(toUpdate)) {
						const cls = getDocumentClass(documentName)
						const u = await cls.updateDocuments(updateData, { diff: false, recursive: false, noHook: true })
					}
				}
				const newReleaseJournal = game.journal.getName(releaseNoteName)
				await newReleaseJournal.setFlag("alienrpg", "ver", newVer)

				// Show journal
				await newReleaseJournal.sheet.render(true, { sheetMode: "text" })
			} catch (error) {
				// logger.debug('Error', error);
			} // end of try
		} // end of if(isgm)
	}
}
