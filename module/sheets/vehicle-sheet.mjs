/** biome-ignore-all lint/complexity/noThisInStatic: <explanation> */
/** biome-ignore-all lint/style/useConst: <explanation> */
// import ALIENRPGActiveEffect from "../documents/active-effect.mjs"
import { logger } from "../helpers/logger.mjs"
import { collapseSection, expandSection } from "../helpers/utils.mjs"
import { yze } from "../helpers/YZEDiceRoller.mjs"

const { api, sheets } = foundry.applications

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export class alienrpgVehicleSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["alienrpg", "actor", "ALIENRPG"],
		position: {
			width: 846,
			height: 660,
		},
		window: {
			resizable: true,
		},
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewDoc,
			createDoc: this._createDoc,
			deleteDoc: this._deleteDoc,
			CrewRemove: this._onCrewRemove,
			CrewEdit: this._onCrewEdit,
			RollAbility: { handler: this._onRollAbility, buttons: [0, 2] },
			RollItem: { handler: this._onRollItem, buttons: [0, 2] },
			ItemActivate: { handler: this._onItemActivate, buttons: [0, 2] },
			CrewPanic: { handler: this._onCrewPanic, buttons: [0, 2] },
		},
		// Custom property that's merged into `this.options`
		// dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
		form: {
			submitOnChange: true,
			submitOnClose: false,
			closeOnSubmit: false,
		},
	}

	/**
	 * A set of the currently expanded document uuids.
	 * @type {Set<string>}
	 */
	_expandedDocumentDescriptions = new Set()

	/* -------------------------------------------------- */

	/** @override */
	static PARTS = {
		vehicleheader: {
			template: "systems/alienrpg/templates/actor/vehicle-header.hbs",
		},

		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		vehiclegeneral: {
			template: "systems/alienrpg/templates/actor/vehicle-general.hbs",
			scrollable: [""],
		},
		crew: {
			template: "systems/alienrpg/templates/actor/vehicle-crew.hbs",
			scrollable: [""],
		},
		inventory: {
			template: "systems/alienrpg/templates/actor/vehicle-inventory.hbs",
			scrollable: [""],
		},
		// crtuisyntheticheader: {
		// 	template: "systems/alienrpg/templates/actor/crt/crtui-synthetic-header.hbs",
		// },
		// crtuisyntheticgeneral: {
		// 	template: "systems/alienrpg/templates/actor/crt/crtui-synthetic-general.hbs",
		// 	scrollable: [""],
		// },
		// crtuicharacterskills: {
		// 	template: "systems/alienrpg/templates/actor/crt/crtui-character-skills.hbs",
		// 	scrollable: [""],
		// },
		// crtuicharacterinventory: {
		// 	template: "systems/alienrpg/templates/actor/crt/crtui-character-inventory.hbs",
		// 	scrollable: [""],
		// },
	}

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options)
		// Not all parts always render
		options.parts = []
		// Don't show the other tabs if only limited view
		if (this.document.limited) return
		// Control which parts show based on document subtype
		// if (game.settings.get("alienrpg", "aliencrt")) {
		// 	options.parts.push(
		// 		"crtuivehicleheader",
		// 		"tabs",
		// 		"crtuivehiclegeneral",
		// 		"crtuicharacterinventory",
		// 		"crtuivehiclecrew",
		// 	)
		// } else {
		options.parts.push("vehicleheader", "tabs", "vehiclegeneral", "inventory", "crew")
		// }
	}
	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		// Output initialization
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			limited: this.document.limited,
			// Add the actor document.
			actor: this.actor,
			// Add the actor's data to context.data for easier access, as well as flags.
			system: this.actor.system,
			flags: this.actor.flags,
			// Adding a pointer to CONFIG.ALIENRPG
			config: CONFIG.ALIENRPG,
			tabs: this._getTabs(options.parts),
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			// systemFields: this.document.system.schema.fields,
			isEnhanced: game.settings.get("alienrpg", "evolved"),
			isEnc: this.actor.type === "character" || this.actor.type === "synthetic",
			// isNPC: this.actor.system.header.npc || false,
			isSynthetic: this.actor.type === "synthetic",
			isVehicle: this.actor.type === "vehicle",
			isCreature: this.actor.type === "creature",
			isCharacter: this.actor.type === "character",
			isGM: game.user.isGM,
		}

		context.inventory = new Set()

		context.system.items = this.actor.items.map((i) => {
			i.labels = i.labels
			return i
		})
		context.system.items.sort((a, b) => (a.sort || 0) - (b.sort || 0))
		context.system.labels = this.actor.labels || {}
		context.system.filters = this._filters

		// Offloading context prep to a helper function
		// await this._characterData(data);
		// if (!game.settings.get("alienrpg", "evolved")) {
		// 	await this.actor.checkOverwatch(context)
		// }
		// this._prepareItems(context)

		await this._prepareVehicleItems(context)
		await this._prepareCrew(context)

		logger.debug("Vehicle Sheet derived data:", context)

		return context
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "vehiclegeneral":
			case "crew":
				// case "crtuivehiclegeneral":
				context.tab = context.tabs[partId]
				break
			case "inventory":
				// case "crtuicharacterinventory":
				context.tab = context.tabs[partId]
				// Enrich biography info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedAdhocitems = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.adhocitems, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.actor.getRollData(),
					// Relative UUID resolution
					relativeTo: this.actor,
				})
				break
		}

		return context
	}

	/**
	 * Generates the data for the generic tab navigation template
	 * @param {string[]} parts An array of named template parts to render
	 * @returns {Record<string, Partial<ApplicationTab>>}
	 * @protected
	 */
	_getTabs(parts) {
		// If you have sub-tabs this is necessary to change
		const tabGroup = "primary"
		// Default tab for first time it's rendered this session
		const sheetType = game.settings.get("alienrpg", "aliencrt")
		// const enhanced = game.settings.get("alienrpg", "evolved")

		if (!sheetType) {
			if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "vehiclegeneral"
		} else {
			if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "crtuivehiclegeneral"
		}

		return parts.reduce((tabs, partId) => {
			const tab = {
				cssClass: "",
				group: tabGroup,
				// Matches tab property to
				id: "",
				// FontAwesome Icon, if you so choose
				icon: "",
				// Run through localization
				label: "ALIENRPG.Actor.Tabs.",
			}
			switch (partId) {
				case "vehicleheader":
				// case "crtuivehicleheader":
				case "tabs":
					return tabs

				case "crew":
					tab.id = "crew"
					tab.label += "Crew"
					break
				case "vehiclegeneral":
					tab.id = "vehiclegeneral"
					tab.label += "General"
					break
				case "inventory":
					tab.id = "inventory"
					tab.label += "Inventory"
					break
				// case "crtuicharacterinventory":
				// 	tab.id = "crtuicharacterinventory"
				// 	tab.label += "Inventory"
				// 	break
				// case "crtuicharacterskills":
				// 	tab.id = "crtuicharacterskills"
				// 	tab.label += "Skills"
				// 	break
				// case "crtuivehiclegeneral":
				// 	tab.id = "crtuisyntheticgeneral"
				// 	tab.label += "General"
				// 	break
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active"
			tabs[partId] = tab
			return tabs
		}, {})
	}
	/**
	 * Organize and classify Items for Actor sheets.
	 *
	 * @param {object} context The context object to mutate
	 */
	async _prepareVehicleItems(context) {
		// Initialize containers.
		const inventory = {
			weapon: {
				section: "Weapons",
				label: game.i18n.localize("ALIENRPG.InventoryWeaponsHeader"),
				items: [],
				dataset: { type: "weapon" },
			},
			item: {
				section: "Items",
				label: game.i18n.localize("ALIENRPG.InventoryItemsHeader"),
				items: [],
				dataset: { type: "item" },
			},
			armor: {
				section: "Armor",
				label: game.i18n.localize("ALIENRPG.InventoryArmorHeader"),
				items: [],
				dataset: { type: "armor" },
			},
		}
		// Partition items by category
		let [items, Weapons, Armor] = context.system.items.reduce(
			(arr, item) => {
				// Item details
				item.img = item.img || DEFAULT_TOKEN
				item.isStack = item.system.quantity ? item.system.quantity > 1 : false

				// Classify items into types
				if (item.type === "Weapons") arr[1].push(item)
				else if (item.type === "Armor") arr[2].push(item)
				else if (Object.keys(inventory).includes(item.type)) arr[0].push(item)
				return arr
			},
			[[], [], []],
		)

		// Apply active item filters
		items = this._filterItems(items, context.inventory)
		let talents = []
		let agendas = []
		let specialities = []
		let critInj = []

		// Iterate through items, allocating to containers
		for (let i of context.system.items) {
			let item = i.system
			switch (i.type) {
				case "talent":
					talents.push(i)
					break

				case "agenda":
					agendas.push(i)
					break

				case "specialty":
					if (specialities.length > 1) {
						break
					}
					specialities.push(i)
					break
				case "critical-injury":
					critInj.push(i)
					break

				case "armor":
					inventory[i.type].items.push(i)
					break

				case "weapon":
					if (item.header.active !== "fLocker") {
					}
					inventory[i.type].items.push(i)

					break

				default:
					// Its just an item
					if (item.header.active !== "fLocker") {
					}
					inventory[i.type].items.push(i)
					break
			}
		}

		context.inventory = Object.values(inventory)
	}

	async _prepareCrew(sheetData) {
		sheetData.crew = sheetData.actor.system.crew.occupants.reduce((arr, o) => {
			o.actor = game.actors.get(o.id)
			// Creates a fake actor if it doesn't exist anymore in the database.
			if (!o.actor) {
				o.actor = {
					name: "{MISSING_CREW}",
					system: { system: { health: { value: 0, max: 0 } } },
					isCrewDeleted: true,
				}
			}
			arr.push(o)
			return arr
		}, [])
		sheetData.actor.system.crew.occupants.sort((o1, o2) => {
			const pos1 = CONFIG.ALIENRPG.vehicle.crewPositionFlags.indexOf(o1.position)
			const pos2 = CONFIG.ALIENRPG.vehicle.crewPositionFlags.indexOf(o2.position)
			if (pos1 < pos2) return -1
			if (pos1 > pos2) return 1
			// If they are at the same position, sort by their actor's names.
			if (o1.actor.name < o2.actor.name) return -1
			if (o1.actor.name > o2.actor.name) return 1
			return 0
		})
		return sheetData
	}

	async _dropCrew(actorId) {
		const crew = game.actors.get(actorId)
		const actorData = this.actor
		if (!crew) return
		if (crew.type === "vehicles" && crew.type === "spacecraft")
			return ui.notifications.info("Vehicle inceptions are not allowed!")
		if (crew.type !== "character" && crew.type !== "synthetic") return
		if (actorData.type === "vehicles") {
			if (actorData.system.crew.passengerQty >= actorData.system.attributes.passengers.value) {
				return ui.notifications.warn(game.i18n.localize("ALIENRPG.fullCrew"))
			}
			return await actorData.addVehicleOccupant(actorId)
		}
		if (actorData.type === "spacecraft") {
			if (actorData.system.crew.passengerQty >= actorData.system.attributes.crew.value) {
				return ui.notifications.warn(game.i18n.localize("ALIENRPG.fullCrew"))
			}
			return await actorData.addVehicleOccupant(actorId)
		}
	}

	static async _onCrewEdit(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const crewId = target.dataset.actorid
		const actor = game.actors.get(crewId)
		return actor.sheet.render(true)
	}

	static async _onCrewRemove(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const actorData = this.actor
		const crewId = target.dataset.actorid
		const occupants = this.actor.removeVehicleOccupant(crewId)
		let crewNumber = actorData.system.crew.passengerQty
		crewNumber--
		await actorData.update({ "system.crew.passengerQty": crewNumber })
		return await actorData.update({ "system.crew.occupants": occupants })
	}

	async _onChangePosition(event) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const crewId = event.currentTarget.dataset.actorid
		const position = event.currentTarget.selectedOptions[0].innerText
		return await this.actor.addVehicleOccupant(crewId, position)
	}

	static async _onCrewPanic(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const dataset = target.dataset
		const panicActor = game.actors.get(dataset.crewpanic)
		if (!game.settings.get("alienrpg", "evolved")) {
			if (event.button === 2) {
				await this.actor.rollPanicMod(panicActor, dataset)
			} else {
				await this.actor.rollPanic(panicActor, dataset)
			}
		} else {
			if (event.button === 2) {
				await this.actor.rollStressMod(this.actor, dataset)
			} else {
				await this.actor.rollStress(this.actor, dataset)
			}
		}
		return
	}

	static async crewPanic(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		// const dataset = event.currentTarget.dataset;
		const dataset = target.dataset
		const panicActor = game.actors.get(dataset.crewpanic)
		return await this.actor.rollAbility(panicActor, dataset)
	}

	static async crewPanicMod(event, target) {
		console.log("Crew Panic Mod")
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		// const dataset = event.currentTarget.dataset;
		const dataset = target.dataset
		const panicActor = game.actors.get(dataset.crewpanic)
		return await this.actor.rollAbilityMod(panicActor, dataset)
	}
	/* -------------------------------------------- */

	/**
	 * Determine whether an Owned Item will be shown based on the current set of filters
	 * @return {boolean}
	 * @private
	 */
	_filterItems(items, filters) {
		return items.filter((item) => {
			const data = item.system
			return true
		})
	}

	/**
	 * Actions performed after a first render of the Application.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 */
	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options)

		this._createContextMenu(this._getItemFullButtonContextOptions, ".item-edit", {
			hookName: "getItemFullButtonContextOptions",
			parentClassHooks: false,
			fixed: true,
		})
		this._createContextMenu(this._getItemPartButtonContextOptions, ".item-edit1", {
			hookName: "getItemPartButtonContextOptions",
			parentClassHooks: false,
			fixed: true,
		})
	}

	_getItemFullButtonContextOptions() {
		// name is auto-localized
		return [
			{
				name: game.i18n.localize("ALIENRPG.addToFLocker"),
				icon: '<i class="fas fa-archive"></i>',
				callback: async (target) => {
					const itemId = target.dataset.itemId
					const item = this.actor.items.get(itemId)
					item.update({ "system.header.active": "fLocker" })
				},
			},
			{
				name: game.i18n.localize("ALIENRPG.moveFromFlocker"),
				icon: '<i class="fas fa-archive"></i>',
				callback: async (target) => {
					const itemId = target.dataset.itemId
					const item = this.actor.items.get(itemId)
					item.update({ "system.header.active": "false" })
				},
			},
			{
				name: game.i18n.localize("ALIENRPG.EditItemTitle"),
				icon: '<i class="fas fa-edit"></i>',
				// condition: () => this.isEditMode,
				callback: async (target) => {
					const itemId = target.dataset.itemId
					const item = this.actor.items.get(itemId)
					await item.sheet.render(true)
				},
			},
			{
				name: game.i18n.localize("ALIENRPG.DeleteItem"),
				icon: '<i class="fas fa-trash"></i>',
				callback: async (target) => {
					const itemId = target.dataset.itemId
					const itemDel = this.actor.items.get(itemId)
					itemDel.delete()
				},
			},
		]
	}

	_getItemPartButtonContextOptions() {
		// name is auto-localized
		return [
			{
				name: game.i18n.localize("ALIENRPG.EditItemTitle"),
				icon: '<i class="fas fa-edit"></i>',
				callback: (element) => {
					const item = this.actor.items.get(element.dataset.itemId)
					item.sheet.render(true)
				},
			},
			{
				name: game.i18n.localize("ALIENRPG.DeleteItem"),
				icon: '<i class="fas fa-trash"></i>',
				callback: (element) => {
					const itemDel = this.actor.items.get(element.dataset.itemId)
					if (itemDel.type === "critical-injury" && this.actor.system.general.critInj.value <= 1) {
						this.actor.removeCondition("criticalinj")
					}
					itemDel.delete()
				},
			},
		]
	}

	/**
	 * Actions performed after any render of the Application.
	 * Post-render steps are not awaited by the render process.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 * @override
	 */
	async _onRender(context, options) {
		await super._onRender(context, options)
		this.#disableOverrides()
		// You may want to add other special handling here
		// Foundry comes with a large number of utility classes, e.g. SearchFilter
		// That you may want to implement yourself.

		const currency = this.element.querySelectorAll(".currency")
		for (const s of currency) {
			s.addEventListener("change", (event) => {
				this._currencyField(event)
			})
		}
		const changeposition = this.element.querySelectorAll(".changeposition")
		for (const c of changeposition) {
			c.addEventListener("change", (event) => {
				this._onChangePosition(event)
			})
		}
		// const inventory = document.getElementById("gear-list")
		// inventory.addEventListener("change", (event) => {
		// 	if (event.target.classList.contains("inline-edit")) {
		// 		this._inlineedit(event)
		// 	}
		// })
	}

	/**************
	 *
	 *   ACTIONS
	 *
	 **************/
	/**
	 * Handle changing a Document's image.
	 *
	 * @this AlienEnhancedActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */

	static async _onRollAbility(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks

		const dataset = target.dataset
		if (event.button === 2) {
			await this.actor.rollAbilityMod(this.actor, dataset)
		} else {
			await this.actor.abilityRoll(this.actor, dataset)
		}
	}
	static async _onRollItem(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const dataset = target.dataset
		const itemId = target.dataset.itemId
		const item = this.actor.items.get(itemId)
		const actorID = this.actor.id
		if (game.settings.get("alienrpg", "evolved")) {
			if (event.button === 2) {
				if (item.type === "weapon") {
					// Trigger the item roll
					return item.roll(true, dataset)
				}
			} else {
				if (item.type === "weapon" || item.type === "spacecraftweapons") {
					// Trigger the item roll
					if (item.system.header.type.value === "1" && item.system.attributes.rounds.value <= 0) {
						const chatMessage =
							`<div class="chatBG" + ${actorID} "><span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">` +
							game.i18n.localize("ALIENRPG.noAmmo") +
							"</span></div>"
						this.actor.createChatMessage(chatMessage, actorID)
					} else {
						await item.roll(false, dataset)
						return
					}
				}
			}
		} else {
			if (event.button === 2) {
				if (item.type === "weapon") {
					// Trigger the item roll
					return item.roll(true, dataset)
				}
			} else {
				if (item.type === "weapon" || item.type === "spacecraftweapons") {
					// Trigger the item roll
					return item.roll(false, dataset)
				}
			}
		}
	}

	static async _onClickXPStatLevel(event) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		await this.actor.ClickXPStatLevel(this.actor, event.button)
	}

	static async _onClickSPStatLevel(event) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		await this.actor.ClickSPStatLevel(this.actor, event.button)
	}

	static async _plusMinusButton(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		const dataset = target.dataset
		this.actor.stressChange(this.actor, dataset)
	}

	static async _onRadPointClick(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const dataset = target.dataset
		const actorID = this.actor.id
		let chatMessage = `<div class="chatBG" + ${actorID} ">`
		const addRad =
			`<span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">` +
			game.i18n.localize("ALIENRPG.PermanentRadiationAdded") +
			"</span></div>"
		const takeRad =
			`<span class="warnblink alienchatlightgreen"; style="font-weight: bold; font-size: larger">` +
			game.i18n.localize("ALIENRPG.PermanentRadiationRemoved") +
			"</span></div>"

		const rad = this.actor.system.general.radiation
		switch (event.ctrlKey) {
			case false:
				switch (event.button) {
					case 2:
						if (rad.value > 0) {
							switch (rad.value - 1 === 0) {
								case true:
									await this.actor.reduceRadiation(this.actor, dataset)
									if (this.actor.system.general.radiation.permanent === 0) {
										await this.actor.removeCondition("radiation")
									}
									break
								case false:
									await this.actor.reduceRadiation(this.actor, dataset)
									break
							}
						}
						break
					case 0:
						if (rad.value < rad.calculatedMax) {
							await this.actor.abilityRoll(this.actor, dataset)
							await this.actor.update({
								["system.general.radiation.value"]: rad.value + 1,
							})
							if (rad.value <= 1) {
								await this.actor.addCondition("radiation")
							}
						}
						break
				}
				break
			case true:
				switch (event.button) {
					case 2:
						if (rad.permanent > 0) {
							switch (rad.permanent - 1 === 0 && rad.value === 0) {
								case true: {
									await this.actor.update({
										["system.general.radiation.permanent"]: rad.permanent - 1,
									})
									await this.actor.removeCondition("radiation")
									this.actor.createChatMessage((chatMessage += takeRad), actorID)
									return
								}
								case false: {
									await this.actor.update({
										["system.general.radiation.permanent"]: rad.permanent - 1,
									})
									this.actor.createChatMessage((chatMessage += takeRad), actorID)
									return
								}
							}
						}
						break
					case 0:
						if (rad.permanent < 10) {
							await this.actor.update({
								["system.general.radiation.permanent"]: rad.permanent + 1,
							})
							if (rad.permanent <= 0) {
								await this.actor.addCondition("radiation")
							}
							this.actor.createChatMessage((chatMessage += addRad), actorID)
							return
						}
				}
		}
	}

	static async _onOverwatchToggle(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks

		const key = target.dataset.key
		if (key === "overwatch") {
			if (await this.actor.hasCondition(key)) await this.actor.removeCondition(key)
			else await this.actor.addCondition(key)
		} else {
			if (event.button === 0) {
				if (!(await this.actor.hasCondition(key))) await this.actor.addCondition(key)
			} else {
				if (key === "panicked") {
					if (await this.actor.hasCondition(key)) await this.actor.checkAndEndPanic(this.actor)
				} else {
					if (await this.actor.hasCondition(key)) await this.actor.removeCondition(key)
				}
			}
		}
	}

	async _currencyField(event) {
		event.preventDefault()
		// const element = event.currentTarget
		// format initial value
		onBlur({ target: event.currentTarget })

		function localStringToNumber(s) {
			return Number(String(s).replace(/[^0-9.-]+/g, ""))
		}
		function onBlur(e) {
			const value = localStringToNumber(e.target.value)
			if (game.settings.get("alienrpg", "dollar"))
				e.target.value = value
					? Intl.NumberFormat("en-EN", {
							style: "currency",
							currency: "USD",
						}).format(value)
					: "$0.00"
			else
				e.target.value = value
					? Intl.NumberFormat("en-EN", {
							style: "decimal",
							useGrouping: false,
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						}).format(value)
					: "0.00"
		}
	}

	/**
	 * Handle changing a Document's image.
	 *
	 * @this AlienEnhancedActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @returns {Promise}
	 * @protected
	 */
	static async _onEditImage(event, target) {
		const attr = target.dataset.edit
		const current = foundry.utils.getProperty(this.document, attr)
		const { img } = this.document.constructor.getDefaultArtwork?.(this.document.toObject()) ?? {}
		const fp = new FilePicker({
			current,
			type: "image",
			redirectToRoot: img ? [img] : [],
			callback: (path) => {
				this.document.update({ [attr]: path })
			},
			top: this.position.top + 40,
			left: this.position.left + 10,
		})
		return fp.browse()
	}

	/**
	 * Renders an embedded document's sheet
	 *
	 * @this AlienEnhancedActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _viewDoc(event, target) {
		const doc = this._getEmbeddedDocument(target)
		doc.sheet.render(true)
	}

	/**
	 * Handles item deletion
	 *
	 * @this AlienEnhancedActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _deleteDoc(event, target) {
		const doc = this._getEmbeddedDocument(target)
		await doc.delete()
	}

	/**
	 * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
	 *
	 * @this AlienEnhancedActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _createDoc(event, target) {
		// Retrieve the configured document class for Item or ActiveEffect
		const docCls = getDocumentClass(target.dataset.documentClass)
		// Prepare the document creation data by initializing it a default name.
		const docData = {
			name: docCls.defaultName({
				// defaultName handles an undefined type gracefully
				type: target.dataset.type,
				parent: this.actor,
			}),
		}
		// Loop through the dataset and add it to our docData
		for (const [dataKey, value] of Object.entries(target.dataset)) {
			// These data attributes are reserved for the action handling
			if (["action", "documentClass"].includes(dataKey)) continue
			// Nested properties require dot notation in the HTML, e.g. anything with `system`
			// An example exists in spells.hbs, with `data-system.spell-level`
			// which turns into the dataKey 'system.spellLevel'
			foundry.utils.setProperty(docData, dataKey, value)
		}

		// Finally, create the embedded document!
		await docCls.create(docData, { parent: this.actor })
	}

	// /**
	//  * Determines effect parent to pass to helper
	//  *
	//  * @this AlienEnhancedActorSheet
	//  * @param {PointerEvent} event   The originating click event
	//  * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	//  * @private
	//  */
	// static async _toggleEffect(event, target) {
	// 	const effect = this._getEmbeddedDocument(target)
	// 	await effect.update({ disabled: !effect.disabled })
	// }

	static async _onRollStress(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const dataset = target.dataset
		if (!game.settings.get("alienrpg", "evolved")) {
			if (event.button === 2) {
				await this.actor.rollPanicMod(this.actor, dataset)
			} else {
				await this.actor.rollPanic(this.actor, dataset)
			}
		} else {
			if (event.button === 2) {
				await this.actor.rollStressMod(this.actor, dataset)
			} else {
				await this.actor.rollStress(this.actor, dataset)
			}
		}
	}
	static async _onRollResolve(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks

		const dataset = target.dataset
		if (event.button === 2) {
			await this.actor.rollResolveMod(this.actor, dataset)
		} else {
			await this.actor.rollResolve(this.actor, dataset)
		}
	}

	static async _onRollCrit(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks

		const dataset = target.dataset
		if (event.button === 2) {
			await this.actor.rollCritMan(this.actor, this.actor.type, dataset)
		} else {
			await this.actor.rollCrit(this.actor, this.actor.type, dataset)
		}
	}

	static async _stuntBtn(event, target) {
		event.preventDefault()
		const li = $(target).parents(".grid-container")
		const li2 = li.children("#panel")[0]
		let item = ""
		let str = ""
		let chatData = ""
		let temp2 = ""
		let temp3 = ""
		const dataset = target.dataset
		const langItem = dataset.pmbut
		const langStr = langItem

		const newLangStr = langStr.replace(/\s+/g, "")
		const langTemp = "ALIENRPG." + [newLangStr]
		temp3 = game.i18n.localize(langTemp)

		try {
			item = game.items.getName(dataset.pmbut)
			str = item.name
			temp2 = item.system.description
			if (temp2 !== null || temp2.length) {
				chatData = item.system.description
			}
			if (temp3.startsWith("<ol>") && chatData.startsWith("<h2>No Stunts Entered</h2>")) {
				chatData = temp3
			}
		} catch {
			if (temp3.startsWith("<ol>")) {
				chatData = temp3
			} else {
				chatData = "<h2>No Stunts Entered</h2>"
			}
		}
		// Toggle summary
		if (li2.classList.contains("expanded")) {
			li2.innerHTML = ""
			collapseSection(li2)
		} else {
			li2.innerHTML = chatData
			expandSection(li2)
		}
		li2.classList.toggle("expanded")
	}

	static async _talentBtn(event, target) {
		event.preventDefault()
		const li = $(target).parents(".grid-container")
		const li2 = li.children("#panel")[0]
		let item = ""
		let str = ""
		let temp1 = ""
		let temp2 = ""
		let temp3 = ""
		let chatData = ""
		const dataset = target.dataset

		item = this.actor.items.get(dataset.pmbut)
		str = item.name
		temp2 = item.system.general.comment.value
		if (temp2 !== null && temp2.length > 0) {
			chatData = item.system.general.comment.value
		} else {
			// item = dataset.pmbut;
			// str = item;
			const newStr = str.replace(/\s+/g, "")
			temp1 = "ALIENRPG." + [newStr]
			temp3 = game.i18n.localize(temp1)
			if (temp3.startsWith("<p>")) {
				chatData = temp3
			} else {
				chatData = '<p style="font-size: xx-large;">👾</p>'
			}
		}

		// Toggle summary
		if (li2.classList.contains("expanded")) {
			li2.innerHTML = ""
			collapseSection(li2)
		} else {
			li2.innerHTML = chatData
			expandSection(li2)
		}
		li2.classList.toggle("expanded")
	}

	/** Helper Functions */

	/**
	 * Fetches the embedded document representing the containing HTML element
	 *
	 * @param {HTMLElement} target    The element subject to search
	 * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
	 */
	_getEmbeddedDocument(target) {
		const docRow = target.closest("a[data-document-class]")
		if (docRow.dataset.documentClass === "Item") {
			return this.actor.items.get(docRow.dataset.itemId)
		}
		if (docRow.dataset.documentClass === "ActiveEffect") {
			const parent =
				docRow.dataset.parentId === this.actor.id ? this.actor : this.actor.items.get(docRow?.dataset.parentId)
			return parent.effects.get(docRow?.dataset.effectId)
		}
		return console.warn("Could not find document class")
	}

	/***************
	 *
	 * Drag and Drop
	 *
	 ***************/

	/**
	 * Callback actions which occur when a dragged element is dropped on a target.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	// TODO V13 Not needed
	async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.getDragEventData(event)
		const actor = this.actor
		const allowed = Hooks.call("dropActorSheetData", actor, this, data)
		if (allowed === false) return

		// Handle different data types
		switch (data.type) {
			case "ActiveEffect":
				return this._onDropActiveEffect(event, data)
			case "Actor":
				return this._onDropActor(event, data)
			case "Item":
				return this._onDropItem(event, data)
			case "Folder":
				return this._onDropFolder(event, data)
		}
	}

	/**
	 * Handle the dropping of ActiveEffect data onto an Actor Sheet
	 * @param {DragEvent} event                  The concluding DragEvent which contains drop data
	 * @param {object} data                      The data transfer extracted from the event
	 * @returns {Promise<ActiveEffect|boolean>}  The created ActiveEffect object or false if it couldn't be created.
	 * @protected
	 */
	async _onDropActiveEffect(event, data) {
		const aeCls = getDocumentClass("ActiveEffect")
		const effect = await aeCls.fromDropData(data)
		if (!this.actor.isOwner || !effect) return false
		if (effect.target === this.actor) return this._onSortActiveEffect(event, effect)
		return aeCls.create(effect, { parent: this.actor })
	}

	/**
	 * Handle a drop event for an existing embedded Active Effect to sort that Active Effect relative to its siblings
	 *
	 * @param {DragEvent} event
	 * @param {ActiveEffect} effect
	 */
	async _onSortActiveEffect(event, effect) {
		/** @type {HTMLElement} */
		const dropTarget = event.target.closest("[data-effect-id]")
		if (!dropTarget) return
		const target = this._getEmbeddedDocument(dropTarget)

		// Don't sort on yourself
		if (effect.uuid === target.uuid) return

		// Identify sibling items based on adjacent HTML elements
		const siblings = []
		for (const el of dropTarget.parentElement.children) {
			const siblingId = el.dataset.effectId
			const parentId = el.dataset.parentId
			if (siblingId && parentId && (siblingId !== effect.id || parentId !== effect.parent.id))
				siblings.push(this._getEmbeddedDocument(el))
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(effect, {
			target,
			siblings,
		})

		// Split the updates up by parent document
		const directUpdates = []

		const grandchildUpdateData = sortUpdates.reduce((items, u) => {
			const parentId = u.target.parent.id
			const update = { _id: u.target.id, ...u.update }
			if (parentId === this.actor.id) {
				directUpdates.push(update)
				return items
			}
			if (items[parentId]) items[parentId].push(update)
			else items[parentId] = [update]
			return items
		}, {})

		// Effects-on-items updates
		for (const [itemId, updates] of Object.entries(grandchildUpdateData)) {
			await this.actor.items.get(itemId).updateEmbeddedDocuments("ActiveEffect", updates)
		}

		// Update on the main actor
		return this.actor.updateEmbeddedDocuments("ActiveEffect", directUpdates)
	}

	/**
	 * Handle dropping of an Actor data onto another Actor sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
	 *                                     not permitted.
	 * @protected
	 */
	// async _onDropActor(event, data) {
	// 	if (!this.actor.isOwner) return false
	// }
	/**
	 * Handle dropping of an Actor data onto another Actor sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
	 *                                     not permitted.
	 * @protected
	 */
	async _onDropActor(event, data) {
		if (!this.actor.isOwner) return false
		let fred = await fromUuid(data.uuid)
		const actor = game.actors.get(fred.id)
		if (!actor) {
			ui.notifications.error(game.i18n.localize("ALIENRPG.General.NeedToImportActor"))
			return
		}
		if (actor.type === "character" || actor.type === "synthetic") {
			if (data.type === "Actor") await this._dropCrew(actor.id)
		}
		// if (actor.type === 'animal' && actor.system.general.subtype === 'horse') {
		// 	if (data.type === 'Actor') await this._dropRemuda(actor.id);
		// }
	}

	/**
	 * Handle dropping of a Folder on an Actor Sheet.
	 * The core sheet currently supports dropping a Folder of Items to create all items as owned items.
	 * @param {DragEvent} event     The concluding DragEvent which contains drop data
	 * @param {object} data         The data transfer extracted from the event
	 * @returns {Promise<Item[]>}
	 * @protected
	 */
	async _onDropFolder(event, data) {
		if (!this.actor.isOwner) return []
		const folder = await Folder.implementation.fromDropData(data)
		if (folder.type !== "Item") return []
		const droppedItemData = await Promise.all(
			folder.contents.map(async (item) => {
				if (!(document instanceof Item)) item = await fromUuid(item.uuid)
				return item
			}),
		)
		return this._onDropItemCreate(droppedItemData, event)
	}
	/**
	 * Handle dropping of an item reference or item data onto an Actor Sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
	 * @protected
	 */
	async _onDropItem(event, data) {
		if (!this.actor.isOwner) return false
		const item = await Item.implementation.fromDropData(data)

		// Handle item sorting within the same Actor
		if (this.actor.uuid === item.parent?.uuid) return this._onSortItem(event, item)

		// Create the owned item
		return this._onDropItemCreate(item, event)
	}
	/**
	 * Handle the final creation of dropped Item data on the Actor.
	 * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
	 * @param {object[]|object} itemData      The item data requested for creation
	 * @param {DragEvent} event               The concluding DragEvent which provided the drop data
	 * @returns {Promise<Item[]>}
	 * @private
	 */
	// async _onDropItemCreate(itemData, event) {
	// 	itemData = itemData instanceof Array ? itemData : [itemData]
	// 	return this.actor.createEmbeddedDocuments("Item", itemData)
	// }

	/** @override */
	async _onDropItemCreate(itemData) {
		const type = itemData.type
		const alwaysAllowedItems = CONFIG.ALIENRPG.physicalItems
		const allowedItems = {
			character: ["item", "weapon", "armor", "talent", "agenda", "specialty", "critical-injury"],
			synthetic: ["item", "weapon", "armor", "talent", "agenda", "specialty", "critical-injury"],
			creature: ["critical-injury"],
			vehicles: ["item", "weapon", "armor"],
			territory: ["planet-system"],
		}
		let allowed = true

		if (!alwaysAllowedItems.includes(type)) {
			if (!allowedItems[this.actor.type].includes(type)) {
				allowed = false
			}
		}

		if (!allowed) {
			const msg = game.i18n.format("ALIENRPG.NotifWrongItemType", {
				type: type,
				actor: this.actor.type,
			})
			console.warn(`Alien RPG | ${msg}`)
			ui.notifications.warn(msg)
			return false
		}
		itemData = itemData instanceof Array ? itemData : [itemData]
		return this.actor.createEmbeddedDocuments("Item", itemData)

		// return super._onDropItemCreate(itemData)
	}

	/********************
	 *
	 * Actor Override Handling
	 *
	 ********************/

	/**
	 * Submit a document update based on the processed form data.
	 * @param {SubmitEvent} event                   The originating form submission event
	 * @param {HTMLFormElement} form                The form element that was submitted
	 * @param {object} submitData                   Processed and validated form data to be used for a document update
	 * @returns {Promise<void>}
	 * @protected
	 * @override
	 */
	async _processSubmitData(event, form, submitData) {
		const overrides = foundry.utils.flattenObject(this.actor.overrides)
		for (const k of Object.keys(overrides)) delete submitData[k]
		await this.document.update(submitData)
	}

	/**
	 * Disables inputs subject to active effects
	 */
	#disableOverrides() {
		const flatOverrides = foundry.utils.flattenObject(this.actor.overrides)
		for (const override of Object.keys(flatOverrides)) {
			const input = this.element.querySelector(`[name="${override}"]`)
			if (input) {
				input.disabled = true
			}
		}
	}

	async _inlineedit(event) {
		event.preventDefault()
		const itemId = event.target.parentElement.dataset.itemId
		const item = this.actor.items.get(itemId)
		const temp = event.target.dataset.mod

		return await item.update({ [temp]: event.target.value }, {})
	}

	static async _onItemActivate(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		const itemId = target.dataset.itemId
		const item = this.actor.items.get(itemId)

		if (event.button === 0) {
			await item.update({ "system.header.active": "true" })
		} else {
			await item.update({ "system.header.active": "false" })
		}
	}

	static async _onRollSupply(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks
		// If it's a power roll it will have an item number so test if it's zero
		if (target.dataset.item === "0") return
		const lTemp = "ALIENRPG." + target.dataset.spbutt
		// If this is a power roll get the exact id of the item to process
		const tItem = target.dataset.id || 0
		const item = this.actor.items.get(tItem)
		const label = game.i18n.localize(lTemp) + " " + game.i18n.localize("ALIENRPG.Supply")
		const consUme = target.dataset.spbutt.toLowerCase()
		let supplyModifier = 0

		if (event.button === 0) {
			const r1Data = 0
			let r2Data = 0
			if (!supplyModifier) {
				supplyModifier = 0
			}
			if (target.dataset.spbutt === "ammo") {
				r2Data = item.system.attributes.rounds.value + supplyModifier
				// this.update({ "system.attributes.rounds.value": itemData.attributes.rounds.value - 1 })
			} else {
				r2Data = this.actor.system.consumables[`${consUme}`].value + supplyModifier
			}

			const reRoll = true
			// let hostile = this.actor.system.type;
			let blind = false
			if (this.actor.token?.disposition === -1) {
				blind = true
			}
			if (r2Data <= 0) {
				return ui.notifications.warn(game.i18n.localize("ALIENRPG.NoSupplys"))
			}
			await yze.yzeRoll(
				"supply",
				blind,
				reRoll,
				label,
				r1Data,
				game.i18n.localize("ALIENRPG.Black"),
				r2Data,
				game.i18n.localize("ALIENRPG.Yellow"),
				this.actor.id,
			)
			if (game.alienrpg.rollArr.r2One) {
				getItems(this.actor, consUme, tItem)
			}
		} else {
			// If it's a power roll it will have an item number so test if it's zero
			// this.actor.consumablesCheck(this.actor, consUme, label, tItem);
		}
		async function getItems(aActor, aconsUme, atItem) {
			let bRoll = game.alienrpg.rollArr.r2One
			let tNum = 0
			let pValue = ""
			let pItem = ""
			let iConsUme = ""
			let field = `system.attributes.${aconsUme}.value`
			const aField = `system.consumables.${aconsUme}.value`

			switch (aconsUme) {
				case "power":
					pItem = aActor.items.get(atItem)
					pValue = pItem.system.attributes.power.value ?? 0
					field = "system.attributes.power.value"
					if (pValue - game.alienrpg.rollArr.r2One <= "0") {
						await pItem.update({ [field]: "0" })
						await aActor.update({
							"system.consumables.power.value": aActor.system.consumables.power.value - pValue,
						})
					} else {
						await pItem.update({
							[field]: pValue - game.alienrpg.rollArr.r2One,
						})
						await aActor.update({
							"system.consumables.power.value": aActor.system.consumables.power.value - game.alienrpg.rollArr.r2One,
						})
					}
					break
				case "ammo":
					pItem = aActor.items.get(atItem)
					pValue = pItem.system.attributes.rounds.value ?? 0
					field = "system.attributes.rounds.value"
					if (pValue - game.alienrpg.rollArr.r2One <= "0") {
						await pItem.update({ [field]: "0" })
						await aActor.update({
							"system.consumables.rounds.value": aActor.system.consumables.rounds.value - pValue,
						})
					} else {
						await pItem.update({
							[field]: pValue - game.alienrpg.rollArr.r2One,
						})
						await aActor.update({
							"system.consumables.rounds.value": aActor.system.consumables.rounds.value - game.alienrpg.rollArr.r2One,
						})
					}
					break
				case "air": {
					iConsUme = "airsupply"
					field = `system.attributes.${iConsUme}.value`
					break
				}
				default:
					iConsUme = aconsUme
					break
			} // while (bRoll > 0) {
			for (const key in aActor.items.contents) {
				if (bRoll <= 0) {
					break
				}

				if (aActor.items.contents[key].type === "item" && aActor.items.contents[key].system.header.active) {
					if (Object.hasOwn(aActor.items.contents, key) && bRoll > 0) {
						const element = aActor.items.contents[key]
						if (element.system.attributes[iConsUme].value) {
							const mitem = aActor.items.get(element.id)
							const iVal = element.system.attributes[iConsUme].value
							if (iVal - bRoll < 0) {
								tNum = iVal
								// bRoll -= iVal;
							} else {
								tNum = bRoll
							}
							await mitem.update({
								[field]: element.system.attributes[iConsUme].value - tNum,
							})
						}
					}
					bRoll -= tNum
				}

				if (
					aActor.items.contents[key].type === "armor" &&
					aconsUme === "air" &&
					aActor.items.contents[key].system.header.active
				) {
					if (Object.hasOwn(aActor.items.contents, key) && bRoll > 0) {
						const element = aActor.items.contents[key]
						if (element.system.attributes[iConsUme].value) {
							const mitem = aActor.items.get(element.id)
							const iVal = element.system.attributes[iConsUme].value
							if (iVal - bRoll < 0) {
								tNum = iVal
								// bRoll -= iVal;
							} else {
								tNum = bRoll
							}
							await mitem.update({
								[field]: element.system.attributes[iConsUme].value - tNum,
							})
						}
					}
					bRoll -= tNum
				}
			}
			const cValue = aActor.getRollData().consumables[aconsUme]
			if (cValue.value - tNum <= 0) {
				await aActor.update({ [aField]: 0 })
			} else {
				await aActor.update({
					[aField]: Number(`system.consumables.${aconsUme}.value` - tNum || 0),
				})
			}
		}
	}
	/**
	 * Creates or deletes a configured status effect.
	 *
	 * @this DrawSteelActorSheet
	 * @param {PointerEvent} event   The originating click event.
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action].
	 * @private
	 */
	static async #toggleStatus(event, target) {
		const status = target.dataset.statusId
		await this.actor.toggleStatusEffect(status)
	}

	/* -------------------------------------------------- */
	/**
	 * Toggles an active effect from disabled to enabled.
	 *
	 * @this DrawSteelActorSheet
	 * @param {PointerEvent} event   The originating click event.
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action].
	 * @private
	 */
	static async #toggleEffect(event, target) {
		const effect = this._getEmbeddedDocument(target)
		await effect.update({ disabled: !effect.disabled })
	}

	/* -------------------------------------------------- */
}
