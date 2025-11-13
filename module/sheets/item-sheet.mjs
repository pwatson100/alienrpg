/** biome-ignore-all lint/complexity/noThisInStatic: <explanation> */
import { prepareActiveEffectCategories } from "../helpers/effects.mjs"
import { logger } from "../helpers/logger.mjs"

const { api, sheets } = foundry.applications
const DragDrop = foundry.applications.ux.DragDrop

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheetV2}
 */
export default class alienrpgItemSheet extends api.HandlebarsApplicationMixin(sheets.ItemSheetV2) {
	constructor(options = {}) {
		super(options)
	}

	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["alienrpg", "item", "item-sheet", "ALIENRPG"],
		position: {
			width: 675,
			// height: 536,
		},
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewEffect,
			createDoc: this._createEffect,
			deleteDoc: this._deleteEffect,
			toggleEffect: this._toggleEffect,
		},
		form: {
			submitOnChange: true,
			submitOnClose: false,
			closeOnSubmit: false,
		},
		// Custom property that's merged into `this.options`
		dragDrop: [{ dragSelector: ".draggable", dropSelector: null }],
	}
	/* -----
	--------------------------------------- */

	/** @override */
	static PARTS = {
		header: {
			template: "systems/alienrpg/templates/item/item-header.hbs",
		},
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		notes: {
			template: "systems/alienrpg/templates/item/item-notes.hbs",
		},
		modifiers: {
			template: "systems/alienrpg/templates/item/item-modifiers.hbs",
		},
		general: {
			template: "systems/alienrpg/templates/item/item-sheet.hbs",
		},
		weapon: {
			template: "systems/alienrpg/templates/item/item-weapon.hbs",
		},
		"skill-stunts": {
			template: "systems/alienrpg/templates/item/item-skill-stunts.hbs",
		},
		"critical-injury": {
			template: "systems/alienrpg/templates/item/item-crit-inj.hbs",
		},
		talent: {
			template: "systems/alienrpg/templates/item/item-talent.hbs",
		},
		agenda: {
			template: "systems/alienrpg/templates/item/item-agenda.hbs",
		},
		armor: {
			template: "systems/alienrpg/templates/item/item-armor.hbs",
		},
		specialty: {
			template: "systems/alienrpg/templates/item/item-specialty.hbs",
		},
		spacecraftweapons: {
			template: "systems/alienrpg/templates/item/item-spacecraftweapons.hbs",
		},
		spacecraftmods: {
			template: "systems/alienrpg/templates/item/item-spacecraftmods.hbs",
		},
		"spacecraft-crit": {
			template: "systems/alienrpg/templates/item/item-spacecraft-crit.hbs",
		},
		"planet-system": {
			template: "systems/alienrpg/templates/item/item-planet-system.hbs",
		},
		"planet-description": {
			template: "systems/alienrpg/templates/item/item-planet-description.hbs",
		},
		"colony-initiative": {
			template: "systems/alienrpg/templates/item/item-colony-initiative.hbs",
		},
	}

	/** @override */
	_configureRenderOptions(options) {
		super._configureRenderOptions(options)
		// Not all parts always render
		// options.parts = ['header', 'tabs', 'notes'];
		// Don't show the other tabs if only limited view
		if (this.document.limited) return
		// Control which parts show based on document subtype
		switch (this.document.type) {
			case "item":
				options.parts = ["header", "tabs", "general", "notes", "modifiers"]
				break
			case "weapon":
				options.parts = ["header", "tabs", "weapon", "notes", "modifiers"]
				break
			case "skill-stunts":
				options.parts = ["header", "skill-stunts"]
				break
			case "talent":
				options.parts = ["header", "tabs", "talent", "notes", "modifiers"]
				break
			case "critical-injury":
				options.parts = ["header", "tabs", "critical-injury", "modifiers"]
				break
			case "agenda":
				options.parts = ["header", "tabs", "agenda"]
				break
			case "armor":
				options.parts = ["header", "tabs", "armor", "modifiers"]
				break
			case "specialty":
				options.parts = ["header", "tabs", "specialty"]
				break
			case "spacecraftweapons":
				options.parts = ["header", "tabs", "spacecraftweapons", "notes"]
				break
			case "spacecraftmods":
				options.parts = ["header", "tabs", "spacecraftmods", "notes"]
				break
			case "spacecraft-crit":
				options.parts = ["header", "tabs", "spacecraft-crit"]
				break
			case "planet-system":
				options.parts = ["header", "tabs", "planet-system", "planet-description"]
				break
			case "colony-initiative":
				options.parts = ["header", "tabs", "colony-initiative", "notes"]
				break
		}
	}

	/* -------------------------------------------- */

	/** @override */
	async _prepareContext(options) {
		const context = {
			// Validates both permissions and compendium status
			editable: this.isEditable,
			owner: this.document.isOwner,
			limited: this.document.limited,
			// Add the item document.
			item: this.item,
			// Adding system and flags for easier access
			system: this.item.system,
			flags: this.item.flags,
			isEvolved: game.settings.get("alienrpg", "evolved"),

			// Adding a pointer to CONFIG.ALIENRPG
			config: CONFIG.ALIENRPG,
			// You can factor out context construction to helper functions
			tabs: this._getTabs(options.parts),
			// Necessary for formInput and formFields helpers
			fields: this.document.schema.fields,
			systemFields: this.document.system.schema.fields,
		}

		switch (context.item.type) {
			case "planet-system":
				this._prepareSystemData(context.item)
				break
			case "spacecraft-crit":
				await this._prepareShipCritData(context.item)
				break
			case "agenda":
				await this._prepareAgendaData(context.item)
				break
			case "specialty":
				await this._prepareSpecialtyData(context.item)
				break
			case "talent":
				await this._prepareTalentData(context.item)
				break
			case "colony-initiative":
				await this._prepareColonyInitiativeData(context.item)
				break
			default:
				break
		}

		return context
	}

	async _prepareSystemData(data) {
		this.item.update({ img: "systems/alienrpg/images/icons/solar-system.webp" })
	}
	async _prepareAgendaData(data) {
		if (this.item.img === "icons/svg/item-bag.svg" && this.item.img !== this.img) {
			this.item.update({ img: "systems/alienrpg/images/icons/personal-agenda.png" })
		}
	}

	async _prepareSpecialtyData(data) {
		this.item.update({ img: "systems/alienrpg/images/icons/cover-notext.png" })
	}

	async _prepareTalentData(data) {
		if (data.system.general.career.value === "1" || data.system.general.career.value === "") {
			this.item.update({ img: "systems/alienrpg/images/icons/sprint.webp" })
		} else {
			this.item.update({ img: "systems/alienrpg/images/icons/fire-dash.webp" })
		}
	}

	async _prepareShipCritData(data) {
		if (data.system.header.type.value === "1") {
			this.item.update({ img: "systems/alienrpg/images/icons/auto-repair.webp" })
		} else if (data.system.header.type.value === "0") {
			this.item.update({ img: "systems/alienrpg/images/icons/spanner.webp" })
		}
	}

	async _prepareColonyInitiativeData(item) {
		switch (item.system.header.type) {
			case "1":
				item.update({ img: "systems/alienrpg/images/icons/full-folder.webp" })
				break
			case "2":
				item.update({ img: "systems/alienrpg/images/icons/habitat-dome.webp" })
				break
			case "3":
				item.update({ img: "systems/alienrpg/images/icons/diagram.webp" })
				break

			default:
				break
		}
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "planet-system":
				context.tab = context.tabs[partId]
				break
			case "general":
			case "weapon":
				context.tab = context.tabs[partId]
				// Enrich description info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.attributes.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break

			case "skill-stunts":
				context.tab = context.tabs[partId]
				context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.description,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "talent":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.general.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "critical-injury":
				context.tab = context.tabs[partId]
				context.enrichedEffect = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.attributes.effects,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "agenda":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.general.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "armor":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.attributes.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "specialty":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.general.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "spacecraftweapons":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.attributes.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "spacecraftmods":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.attributes.comment.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "spacecraft-crit":
				context.tab = context.tabs[partId]
				context.enrichedEffect = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.header.effects, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.item.getRollData(),
					// Relative UUID resolution
					relativeTo: this.item,
				})
				break
			case "planet-description":
				context.tab = context.tabs[partId]
				context.enrichedDescription = await foundry.applications.ux.TextEditor.enrichHTML(
					this.item.system.misc.description.value,
					{
						// Whether to show secret blocks in the finished html
						secrets: this.document.isOwner,
						// Data to fill in for inline rolls
						rollData: this.item.getRollData(),
						// Relative UUID resolution
						relativeTo: this.item,
					},
				)
				break
			case "colony-initiative":
				context.tab = context.tabs[partId]
				context.enrichedComment = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.header.comment, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.item.getRollData(),
					// Relative UUID resolution
					relativeTo: this.item,
				})
				break
			case "modifiers":
				// Necessary for preserving active tab on re-render
				context.tab = context.tabs[partId]
				break
			case "notes":
				context.tab = context.tabs[partId]
				// Enrich biography info for display
				// Enrichment turns text like `[[/r 1d20]]` into buttons
				context.enrichedNotes = await foundry.applications.ux.TextEditor.enrichHTML(this.item.system.notes, {
					// Whether to show secret blocks in the finished html
					secrets: this.document.isOwner,
					// Data to fill in for inline rolls
					rollData: this.item.getRollData(),
					// Relative UUID resolution
					relativeTo: this.item,
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
		// if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = this.item.type;

		switch (this.item.type) {
			case "item":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "general"
				break
			case "weapon":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "weapon"
				break
			case "skill-stunts":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "skill-stunts"
				break
			case "talent":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "talent"
				break
			case "critical-injury":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "critical-injury"
				break
			case "agenda":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "agenda"
				break
			case "armor":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "armor"
				break
			case "specialty":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "specialty"
				break
			case "spacecraftweapons":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "spacecraftweapons"
				break
			case "spacecraftmods":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "spacecraftmods"
				break
			case "spacecraft-crit":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "spacecraft-crit"
				break
			case "planet-system":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "planet-system"
				break
			case "colony-initiative":
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "colony-initiative"
				break
			default:
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
				label: "ALIENRPG.Item.Tabs.",
			}
			switch (partId) {
				case "header":
				case "tabs":
					return tabs
				case "notes":
					tab.id = "notes"
					tab.label += "Notes"
					break
				case "general":
					tab.id = "general"
					tab.label += "General"
					break
				case "weapon":
					tab.id = "weapon"
					tab.label += "General"
					break
				case "skill-stunts":
					tab.id = "skill-stunts"
					tab.label += "General"
					break
				case "talent":
					tab.id = "talent"
					tab.label += "General"
					break
				case "critical-injury":
					tab.id = "critical-injury"
					tab.label += "General"
					break
				case "agenda":
					tab.id = "agenda"
					tab.label += "General"
					break
				case "armor":
					tab.id = "armor"
					tab.label += "General"
					break
				case "specialty":
					tab.id = "specialty"
					tab.label += "General"
					break
				case "spacecraftweapons":
					tab.id = "spacecraftweapons"
					tab.label += "General"
					break
				case "spacecraftmods":
					tab.id = "spacecraftmods"
					tab.label += "General"
					break
				case "spacecraft-crit":
					tab.id = "spacecraft-crit"
					tab.label += "General"
					break
				case "planet-system":
					tab.id = "planet-system"
					tab.label += "General"
					break
				case "colony-initiative":
					tab.id = "colony-initiative"
					tab.label += "General"
					break
				case "planet-description":
					tab.id = "planet-description"
					tab.label += "Description"
					break
				case "modifiers":
					tab.id = "modifiers"
					tab.label += "Modifiers"
					break
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active"
			tabs[partId] = tab
			return tabs
		}, {})
	}

	/**
	 * Actions performed after any render of the Application.
	 * Post-render steps are not awaited by the render process.
	 * @param {ApplicationRenderContext} context      Prepared context data
	 * @param {RenderOptions} options                 Provided render options
	 * @protected
	 */
	async _onRender(context, options) {
		await super._onRender(context, options)
		const currency = this.element.querySelectorAll(".currency")
		for (const s of currency) {
			s.addEventListener("change", (event) => {
				this._currencyField(event)
			})
		}

		new DragDrop.implementation({
			dragSelector: ".draggable",
			dropSelector: null,
			permissions: {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			},
			callbacks: {
				dragstart: this._onDragStart.bind(this),
				dragover: this._onDragOver.bind(this),
				drop: this._onDrop.bind(this),
			},
		}).bind(this.element)
		// You may want to add other special handling here
		// Foundry comes with a large number of utility classes, e.g. SearchFilter
		// That you may want to implement yourself.

		logger.debug("Item Sheet derived data:", context)
	}

	/**************
	 *
	 *   ACTIONS
	 *
	 **************/

	/**
	 * Handle changing a Document's image.
	 *
	 * @this AlienEvolvedItemSheet
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
	 * @this AlienEvolvedItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _viewEffect(event, target) {
		const effect = this._getEffect(target)
		effect.sheet.render(true)
	}

	/**
	 * Handles item deletion
	 *
	 * @this AlienEvolvedItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @protected
	 */
	static async _deleteEffect(event, target) {
		const effect = this._getEffect(target)
		await effect.delete()
	}

	/**
	 * Handle creating a new Owned Item or ActiveEffect for the actor using initial data defined in the HTML dataset
	 *
	 * @this AlienEvolvedItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _createEffect(event, target) {
		// Retrieve the configured document class for ActiveEffect
		const aeCls = getDocumentClass("ActiveEffect")
		// Prepare the document creation data by initializing it a default name.
		// As of v12, you can define custom Active Effect subtypes just like Item subtypes if you want
		const effectData = {
			name: aeCls.defaultName({
				// defaultName handles an undefined type gracefully
				type: target.dataset.type,
				parent: this.item,
			}),
		}
		// Loop through the dataset and add it to our effectData
		for (const [dataKey, value] of Object.entries(target.dataset)) {
			// These data attributes are reserved for the action handling
			if (["action", "documentClass"].includes(dataKey)) continue
			// Nested properties require dot notation in the HTML, e.g. anything with `system`
			// An example exists in spells.hbs, with `data-system.spell-level`
			// which turns into the dataKey 'system.spellLevel'
			foundry.utils.setProperty(effectData, dataKey, value)
		}

		// Finally, create the embedded document!
		await aeCls.create(effectData, { parent: AlienEvolvedItemSheet.item })
	}

	/**
	 * Determines effect parent to pass to helper
	 *
	 * @this AlienEvolvedItemSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _toggleEffect(event, target) {
		const effect = AlienEvolvedItemSheet._getEffect(target)
		await effect.update({ disabled: !effect.disabled })
	}

	/** Helper Functions */

	/**
	 * Fetches the row with the data for the rendered embedded document
	 *
	 * @param {HTMLElement} target  The element with the action
	 * @returns {HTMLLIElement} The document's row
	 */
	_getEffect(target) {
		const li = target.closest(".effect")
		return this.item.effects.get(li?.dataset?.effectId)
	}

	/**
	 *
	 * DragDrop
	 *
	 */

	/**
	 * Define whether a user is able to begin a dragstart workflow for a given drag selector
	 * @param {string} selector       The candidate HTML selector for dragging
	 * @returns {boolean}             Can the current user drag this selector?
	 * @protected
	 */
	_canDragStart(selector) {
		// game.user fetches the current user
		return this.isEditable
	}

	/**
	 * Define whether a user is able to conclude a drag-and-drop workflow for a given drop selector
	 * @param {string} selector       The candidate HTML selector for the drop target
	 * @returns {boolean}             Can the current user drop on this selector?
	 * @protected
	 */
	_canDragDrop(selector) {
		// game.user fetches the current user
		return this.isEditable
	}

	/**
	 * Callback actions which occur at the beginning of a drag start workflow.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	_onDragStart(event) {
		const li = event.currentTarget
		if ("link" in event.target.dataset) return

		let dragData = null

		// Active Effect
		if (li.dataset.effectId) {
			const effect = this.item.effects.get(li.dataset.effectId)
			dragData = effect.toDragData()
		}

		if (!dragData) return

		// Set data transfer
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData))
	}

	/**
	 * Callback actions which occur when a dragged element is over a drop target.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	_onDragOver(event) {}

	/**
	 * Callback actions which occur when a dragged element is dropped on a target.
	 * @param {DragEvent} event       The originating DragEvent
	 * @protected
	 */
	async _onDrop(event) {
		const data = foundry.applications.ux.TextEditor.getDragEventData(event)
		const item = this.item
		const allowed = Hooks.call("dropItemSheetData", item, this, data)
		if (allowed === false) return

		// Although you will find implmentations to all doc types here, it is important to keep
		// in mind that only Active Effects are "valid" for items.
		// Actors have items, but items do not have actors.
		// Items in items is not implemented on Foudry per default. If you need an implementation with that,
		// try to search how other systems do. Basically they will use the drag and drop, but they will store
		// the UUID of the item.
		// Folders can only contain Actors or Items. So, fall on the cases above.
		// We left them here so you can have an idea of how that would work, if you want to do some kind of
		// implementation for that.
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

	/* -------------------------------------------- */

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
		if (!this.item.isOwner || !effect) return false

		if (this.item.uuid === effect.parent?.uuid) return this._onEffectSort(event, effect)
		return aeCls.create(effect, { parent: this.item })
	}

	/**
	 * Sorts an Active Effect based on its surrounding attributes
	 *
	 * @param {DragEvent} event
	 * @param {ActiveEffect} effect
	 */
	_onEffectSort(event, effect) {
		const effects = this.item.effects
		const dropTarget = event.target.closest("[data-effect-id]")
		if (!dropTarget) return
		const target = effects.get(dropTarget.dataset.effectId)

		// Don't sort on yourself
		if (effect.id === target.id) return

		// Identify sibling items based on adjacent HTML elements
		const siblings = []
		for (const el of dropTarget.parentElement.children) {
			const siblingId = el.dataset.effectId
			if (siblingId && siblingId !== effect.id) siblings.push(effects.get(el.dataset.effectId))
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(effect, {
			target,
			siblings,
		})
		const updateData = sortUpdates.map((u) => {
			const update = u.update
			update._id = u.target._id
			return update
		})

		// Perform the update
		return this.item.updateEmbeddedDocuments("ActiveEffect", updateData)
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of an Actor data onto another Actor sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<object|boolean>}  A data object which describes the result of the drop, or false if the drop was
	 *                                     not permitted.
	 * @protected
	 */
	async _onDropActor(event, data) {
		if (!this.item.isOwner) return false
	}

	/* -------------------------------------------- */

	/**
	 * Handle dropping of an item reference or item data onto an Actor Sheet
	 * @param {DragEvent} event            The concluding DragEvent which contains drop data
	 * @param {object} data                The data transfer extracted from the event
	 * @returns {Promise<Item[]|boolean>}  The created or updated Item instances, or false if the drop was not permitted.
	 * @protected
	 */
	async _onDropItem(event, data) {
		if (!this.item.isOwner) return false
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
		if (!this.item.isOwner) return []
	}

	async _currencyField(event) {
		event.preventDefault()
		const element = event.currentTarget
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
}
