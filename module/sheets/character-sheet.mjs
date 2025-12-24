/** biome-ignore-all lint/complexity/noThisInStatic: <explanation> */
import AlienRPGActiveEffect from "../documents/active-effect.mjs"
import { logger } from "../helpers/logger.mjs"
import { collapseSection, expandSection } from "../helpers/utils.mjs"
import { yze } from "../helpers/YZEDiceRoller.mjs"

const { api, sheets } = foundry.applications

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export default class alienrpgCharacterSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["alienrpg", "actor", "ALIENRPG"],
		position: {
			width: 846,
			height: 876,
		},
		window: {
			resizable: true,
		},
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewDoc,
			createDoc: this._createDoc,
			deleteDoc: this._deleteDoc,
			toggleStatus: this.#toggleStatus,
			toggleEffect: this.#toggleEffect,
			plusMinusButton: this._plusMinusButton,
			ShowStunt: this._stuntBtn,
			ShowTalentAgenda: this._talentBtn,
			RollAbility: { handler: this._onRollAbility, buttons: [0, 2] },
			RollItem: { handler: this._onRollItem, buttons: [0, 2] },
			RollStress: { handler: this._onRollStress, buttons: [0, 2] },
			RollResolve: { handler: this._onRollResolve, buttons: [0, 2] },
			ClickXPStatLevel: { handler: this._onClickXPStatLevel, buttons: [0, 2] },
			ClickSPStatLevel: { handler: this._onClickSPStatLevel, buttons: [0, 2] },
			RadPointClick: { handler: this._onRadPointClick, buttons: [0, 2] },
			OverwatchToggle: { handler: this._onOverwatchToggle, buttons: [0, 2] },
			ItemActivate: { handler: this._onItemActivate, buttons: [0, 2] },
			RollCrit: { handler: this._onRollCrit, buttons: [0, 2] },
			SupplyBtn: { handler: this._onRollSupply, buttons: [0, 2] },
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
		header: {
			template: "systems/alienrpg/templates/actor/character-header.hbs",
		},
		characterENheader: {
			template: "systems/alienrpg/templates/actor/character-enhanced-header.hbs",
		},
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		charactergeneral: {
			template: "systems/alienrpg/templates/actor/character-general.hbs",
			scrollable: [""],
		},
		characterENgeneral: {
			template: "systems/alienrpg/templates/actor/character-enhanced-general.hbs",
			scrollable: [""],
		},
		notes: {
			template: "systems/alienrpg/templates/actor/notes.hbs",
			scrollable: [""],
		},
		skills: {
			template: "systems/alienrpg/templates/actor/character-skills.hbs",
			scrollable: [""],
		},
		inventory: {
			template: "systems/alienrpg/templates/actor/character-inventory.hbs",
			scrollable: [""],
		},
		crtuicharacterheader: {
			template: "systems/alienrpg/templates/actor/crt/crtui-character-header.hbs",
		},
		crtuicharactergeneral: {
			template: "systems/alienrpg/templates/actor/crt/crtui-character-general.hbs",
			scrollable: [""],
		},
		crtuicharacterskills: {
			template: "systems/alienrpg/templates/actor/crt/crtui-character-skills.hbs",
			scrollable: [""],
		},
		crtuicharacterinventory: {
			template: "systems/alienrpg/templates/actor/crt/crtui-character-inventory.hbs",
			scrollable: [""],
		},
	}

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options)
		// Not all parts always render
		options.parts = []
		// Don't show the other tabs if only limited view
		if (this.document.limited) return
		// Control which parts show based on document subtype
		switch (game.settings.get("alienrpg", "evolved")) {
			case true:
				// {					if (game.settings.get("alienrpg", "aliencrt")) {
				// 						options.parts.push(
				// 							"crtuicharacterheader",
				// 							"tabs",
				// 							"crtuicharactergeneral",
				// 							"crtuicharacterskills",
				// 							"crtuicharacterinventory",
				// 							"notes",
				// 						)
				// 					} else {
				options.parts.push("characterENheader", "tabs", "characterENgeneral", "skills", "inventory", "notes")
				// }
				// }
				break
			case false:
				{
					if (game.settings.get("alienrpg", "aliencrt")) {
						options.parts.push(
							"crtuicharacterheader",
							"tabs",
							"crtuicharactergeneral",
							"crtuicharacterskills",
							"crtuicharacterinventory",
							"notes",
						)
					} else {
						options.parts.push("header", "tabs", "charactergeneral", "skills", "inventory", "notes")
					}
				}
				break
		}
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
			systemFields: this.document.system.schema.fields,
			isEvolved: game.settings.get("alienrpg", "evolved"),
			isEnc: this.actor.type === "character" || this.actor.type === "synthetic",
			isNPC: this.actor.system.header.npc || false,
			isSynthetic: this.actor.type === "synthetic",
			isVehicles: this.actor.type === "vehicles",
			isCreature: this.actor.type === "creature",
			isCharacter: this.actor.type === "character",
			isGM: game.user.isGM,
		}
		context.career_list = CONFIG.ALIENRPG.career_list

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
		if (!game.settings.get("alienrpg", "evolved")) {
			await this.actor.checkOverwatch(context)
		}
		this._prepareItems(context)
		context.statuses = await this._prepareStatusEffects()
		context.effects = await this._prepareActiveEffectCategories()
		return context
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "charactergeneral":
			case "skills":
			case "crtuicharactergeneral":
			case "crtuicharacterskills":
				context.tab = context.tabs[partId]
				break
			case "characterENgeneral":
				context.tab = context.tabs[partId]
				break
			case "notes":
				context.tab = context.tabs[partId]
				// Enrich biography info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedNotes = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.notes, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.actor.getRollData(),
					// Relative UUID resolution
					relativeTo: this.actor,
				})
				break
			case "inventory":
			case "crtuicharacterinventory":
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
		const enhanced = game.settings.get("alienrpg", "evolved")

		switch (enhanced) {
			case false:
				{
					if (!sheetType) {
						if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "charactergeneral"
					} else {
						if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "crtuicharactergeneral"
					}
				}
				break
			case true:
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "characterENgeneral"
				break
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
				case "header":
				case "characterENheader":
				case "crtuicharacterheader":
				case "tabs":
					return tabs
				case "notes":
					tab.id = "notes"
					tab.label += "Notes"
					break
				case "charactergeneral":
					tab.id = "charactergeneral"
					tab.label += "General"
					break
				case "characterENgeneral":
					tab.id = "characterENgeneral"
					tab.label += "General"
					break
				case "skills":
					tab.id = "skills"
					tab.label += "Skills"
					break
				case "inventory":
					tab.id = "inventory"
					tab.label += "Inventory"
					break
				case "crtuicharacterinventory":
					tab.id = "crtuicharacterinventory"
					tab.label += "Inventory"
					break
				case "crtuicharacterskills":
					tab.id = "crtuicharacterskills"
					tab.label += "Skills"
					break
				case "crtuicharactergeneral":
					tab.id = "crtuicharactergeneral"
					tab.label += "General"
					break
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
	_prepareItems(context) {
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

		const talents = []
		const agendas = []
		const specialities = []
		const critInj = []

		let totalWeight = 0

		// Iterate through items, allocating to containers
		for (const i of context.actor.items) {
			const item = i.system
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
					if (item.header.active !== "fLocker") {
						i.system.attributes.weight.value = i.system.attributes.weight.value || 0
						i.totalWeight = i.system.attributes.weight.value
						totalWeight += i.totalWeight
					}
					inventory[i.type].items.push(i)
					break

				case "weapon":
				{		
				if (item.header.active !== "fLocker") {
					let ammoweight = 0.25
									if (item.header.type.value === '1') {
// console.log(item.header.type.value, item.attributes.rounds.value)
									if (item.attributes.rounds.value > '1') {

									if (
										i.system.attributes.class.value === "RPG" ||
										i.name.includes(" RPG ") ||
										i.name.startsWith("RPG") ||
										i.name.endsWith("RPG")
									) {
										ammoweight = 0.5
									}
									i.system.attributes.weight.value = i.system.attributes.weight.value || 0
									i.totalWeight =
										(i.system.attributes.weight.value + (i.system.attributes.rounds.value -1) * ammoweight) * i.system.attributes.quantity.value
									totalWeight += i.totalWeight
								} else {
											i.system.attributes.weight.value = i.system.attributes.weight.value || 0
											i.totalWeight =
												(i.system.attributes.weight.value) * i.system.attributes.quantity.value
											totalWeight += i.totalWeight
										
										}

								} else {
											i.system.attributes.weight.value = i.system.attributes.weight.value || 0
											i.totalWeight =
												(i.system.attributes.weight.value) * i.system.attributes.quantity.value
											totalWeight += i.totalWeight
										
										}
						}
					inventory[i.type].items.push(i)
					break
				}

				default:
					// Its just an item
					if (item.header.active !== "fLocker") {
						i.system.attributes.weight.value = i.system.attributes.weight.value || 0
						i.totalWeight = i.system.attributes.weight.value * i.system.attributes.quantity.value
						totalWeight += i.totalWeight
					}
					inventory[i.type].items.push(i)
					break
			}
		}
		// Assign and return
		context.talents = talents
		context.agendas = agendas
		context.specialities = specialities
		context.critInj = critInj

		context.system.general.encumbrance = this._computeEncumbrance(totalWeight, context)
		context.inventory = Object.values(inventory)
	}

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

	_computeEncumbrance(totalWeight, actorData) {
		// Compute Encumbrance percentage
		let enc = {
			max: actorData.actor.system.attributes.str.value * 4,
			value: Math.round(totalWeight * 100) / 100,
			value: totalWeight,
		}
		for (const i of actorData.talents) {
			if (i.name.toUpperCase() === "PACK MULE") {
				enc = {
					max: actorData.actor.system.attributes.str.value * 8,
					value: Math.round(totalWeight * 100) / 100,
					value: totalWeight,
				}
			}
		}

		enc.pct = Math.min((enc.value * 100) / enc.max, 99)
		enc.encumbered = enc.pct > 50
		if (enc.encumbered) {
			this.actor.addCondition("encumbered")
		} else {
			this.actor.removeCondition("encumbered")
		}
		return enc
	}
	/**
	 * Prepare the data structure for status effects and whether they are active.
	 * @protected
	 */
	async _prepareStatusEffects() {
		/** @type {Record<string, StatusInfo>} */
		const statusInfo = {}
		for (const status of CONFIG.statusEffects) {
			// Only display if it would show in the token HUD *and* it has an assigned _id
			if (!status._id || !AlienRPGActiveEffect.validHud(status, this.actor)) continue
			statusInfo[status.id] = {
				_id: status._id,
				name: status.name,
				img: status.img,
				disabled: false,
				active: "",
				resp: status.resp,
				tableNumber: status.tableNumber,
			}

			if (status.rule) {
				const page = await fromUuid(status.rule)
				statusInfo[status.id].tooltip = await enrichHTML(page.text.content, {
					relativeTo: this.actor,
				})
			}
		}

		// If the actor has the status and it's not from the canonical statusEffect
		// Then we want to force more individual control rather than allow toggleStatusEffect
		for (const effect of this.actor.allApplicableEffects()) {
			for (const id of effect.statuses) {
				if (!(id in statusInfo)) continue
				statusInfo[id].active = "active"
				if (!Object.values(statusInfo).some((s) => s._id === effect._id)) statusInfo[id].disabled = true
			}
		}

		return statusInfo
	}

	/* -------------------------------------------------- */

	/**
	 * Prepare the data structure for Active Effects which are currently embedded in an Actor or Item.
	 * @return {Record<string, ActiveEffectCategory>} Data for rendering.
	 * @protected
	 */
	async _prepareActiveEffectCategories() {
		/** @type {Record<string, ActiveEffectCategory>} */
		const categories = {
			temporary: {
				type: "temporary",
				label: game.i18n.localize("ALIENRPG.ActiveEffect.Temporary"),
				effects: [],
			},
			passive: {
				type: "passive",
				label: game.i18n.localize("ALIENRPG.ActiveEffect.Passive"),
				effects: [],
			},
			inactive: {
				type: "inactive",
				label: game.i18n.localize("ALIENRPG.ActiveEffect.Inactive"),
				effects: [],
			},
		}

		// Iterate over active effects, classifying them into categories
		const applicableEffects = [...this.actor.allApplicableEffects()].sort((a, b) => a.sort - b.sort)
		for (const e of applicableEffects) {
			const effectContext = {
				id: e.id,
				uuid: e.uuid,
				name: e.name,
				img: e.img,
				parent: e.parent,
				sourceName: e.sourceName,
				duration: e.duration,
				disabled: e.disabled,
				expanded: false,
			}

			if (this._expandedDocumentDescriptions.has(e.id)) {
				effectContext.expanded = true
				effectContext.enrichedDescription = await e.system.toEmbed({})
			}

			if (!e.active) categories.inactive.effects.push(effectContext)
			else if (e.isTemporary) categories.temporary.effects.push(effectContext)
			else categories.passive.effects.push(effectContext)
		}

		// Sort each category
		for (const c of Object.values(categories)) {
			c.effects.sort((a, b) => (a.sort || 0) - (b.sort || 0))
		}
		return categories
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
		const inventory = document.getElementById("gear-list")
		inventory.addEventListener("change", (event) => {
			if (event.target.classList.contains("inline-edit")) {
				this._inlineedit(event)
			}
		})

		logger.debug("Actor Sheet derived data:", context)
	}

	/**************
	 *
	 *   ACTIONS
	 *
	 **************/
	/**
	 * Handle changing a Document's image.
	 *
	 * @this AlienRPGActorSheet
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
	 * @this AlienRPGActorSheet
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
	 * @this AlienRPGActorSheet
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
	 * @this AlienRPGActorSheet
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
	 * @this AlienRPGActorSheet
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
	//  * @this AlienRPGActorSheet
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


				if (!game.settings.get("alienrpg", "evolved")) {
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

	} else {
				chatData = game.i18n.localize("ALIENRPG.EvolvedStunts")

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
	async _onDropActor(event, data) {
		if (!this.actor.isOwner) return false
	}

	/* -------------------------------------------- */

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
	 * Handle the final creation of dropped Item data on the Actor.
	 * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
	 * @param {object[]|object} itemData      The item data requested for creation
	 * @param {DragEvent} event               The concluding DragEvent which provided the drop data
	 * @returns {Promise<Item[]>}
	 * @private
	 */
	async _onDropItemCreate(itemData, event) {
		itemData = itemData instanceof Array ? itemData : [itemData]
		return this.actor.createEmbeddedDocuments("Item", itemData)
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
