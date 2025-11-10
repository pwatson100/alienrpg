/** biome-ignore-all lint/complexity/noThisInStatic: <explanation> */
/** biome-ignore-all lint/style/useConst: <explanation> */
import { logger } from "../helpers/logger.mjs"

const { api, sheets } = foundry.applications

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export default class alienrpgTerritorySheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["alienrpg", "actor", "ALIENRPG"],
		position: {
			width: 846,
			height: 725,
		},
		window: {
			resizable: true,
		},
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewDoc,
			createDoc: this._createDoc,
			deleteDoc: this._deleteDoc,
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
		territoryheader: {
			template: "systems/alienrpg/templates/actor/simple-header.hbs",
		},

		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		territorygeneral: {
			template: "systems/alienrpg/templates/actor/territory-general.hbs",
			scrollable: [""],
		},
		territorysystems: {
			template: "systems/alienrpg/templates/actor/territory-systems.hbs",
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
		options.parts.push("territoryheader", "tabs", "territorygeneral", "territorysystems")
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
		await this._prepareTerritoryItems(context)

		logger.debug("Territory Sheet derived data:", context)

		return context
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "territorygeneral":
				// case "crtuicharacterinventory":
				context.tab = context.tabs[partId]
				// // Enrich biography info for display
				// // Enrichment turns text like `[[/r 1d20]]` into buttons
				// context.enrichedAdhocitems = await foundry.applications.ux.TextEditor.enrichHTML(this.actor.system.adhocitems, {
				// 	// Whether to show secret blocks in the finished html
				// 	secrets: this.document.isOwner,
				// 	// Data to fill in for inline rolls
				// 	rollData: this.actor.getRollData(),
				// 	// Relative UUID resolution
				// 	relativeTo: this.actor,
				// })
				break
			case "territorysystems":
				context.tab = context.tabs[partId]
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

		if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "territorygeneral"

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
				case "territoryheader":
				case "tabs":
					return tabs
				case "territorygeneral":
					tab.id = "territorygeneral"
					tab.label += "General"
					break

				case "territorysystems":
					tab.id = "territorysystems"
					tab.label += "Systems"
					break
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active"
			tabs[partId] = tab
			return tabs
		}, {})
	}

	async _prepareTerritoryItems(context) {
		const systems = []
		// Iterate through items, allocating to containers
		// let totalWeight = 0;
		for (let i of context.system.items) {
			let item = i.system
			// Append to gear.
			if (i.type === "planet-system") {
				systems.push(i)
			}
		}

		// Assign and return
		context.systems = systems
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

		// const currency = this.element.querySelectorAll(".currency")
		// for (const s of currency) {
		// 	s.addEventListener("change", (event) => {
		// 		this._currencyField(event)
		// 	})
		// }
		// const changeposition = this.element.querySelectorAll(".changeposition")
		// for (const c of changeposition) {
		// 	c.addEventListener("change", (event) => {
		// 		this._onChangePosition(event)
		// 	})
		// }
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
		if (actor.type === "character") {
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
