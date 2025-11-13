/** biome-ignore-all lint/complexity/noThisInStatic: <explanation> */
/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
/** biome-ignore-all lint/correctness/useParseIntRadix: <explanation> */
/** biome-ignore-all lint/style/useNumberNamespace: <explanation> */
import { logger } from "../helpers/logger.mjs"

const { api, sheets } = foundry.applications

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export default class alienrpgPlanetSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["alienrpg", "actor", "ALIENRPG"],
		position: {
			width: 1153,
			height: 900,
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
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		planetgeneral: {
			template: "systems/alienrpg/templates/actor/planet-general.hbs",
			scrollable: [""],
		},

		notes: {
			template: "systems/alienrpg/templates/actor/notes.hbs",
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
		options.parts.push("tabs", "planetgeneral", "notes")
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
			// isEnc: this.actor.type === "character" || this.actor.type === "synthetic",
			// isNPC: this.actor.system.header.npc || false,
			// isSynthetic: this.actor.type === "synthetic",
			// isVehicles: this.actor.type === "vehicles",
			// isCreature: this.actor.type === "creature",
			// isCharacter: this.actor.type === "character",
			isGM: game.user.isGM,
		}
		//  * Track the set of item filters which are applied
		// 		 * @type {Set}
		//
		this._filters = {
			policies: new Set(),
			installations: new Set(),
			projects: new Set(),
		}

		return context
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "planetgeneral":
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
		// const sheetType = game.settings.get("alienrpg", "aliencrt")
		// const enhanced = game.settings.get("alienrpg", "evolved")

		if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "planetgeneral"

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
				case "tabs":
					return tabs
				case "notes":
					tab.id = "notes"
					tab.label += "Description"
					break
				case "planetgeneral":
					tab.id = "planetgeneral"
					tab.label += "General"
					break
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active"
			tabs[partId] = tab
			return tabs
		}, {})
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

		logger.debug("Colony Sheet derived data:", context)
	}

	// async _currencyField(event) {
	// 	event.preventDefault()
	// 	// const element = event.currentTarget
	// 	// format initial value
	// 	onBlur({ target: event.currentTarget })

	// 	function localStringToNumber(s) {
	// 		return Number(String(s).replace(/[^0-9.-]+/g, ""))
	// 	}
	// 	function onBlur(e) {
	// 		const value = localStringToNumber(e.target.value)
	// 		if (game.settings.get("alienrpg", "dollar"))
	// 			e.target.value = value
	// 				? Intl.NumberFormat("en-EN", {
	// 						style: "currency",
	// 						currency: "USD",
	// 					}).format(value)
	// 				: "$0.00"
	// 		else
	// 			e.target.value = value
	// 				? Intl.NumberFormat("en-EN", {
	// 						style: "decimal",
	// 						useGrouping: false,
	// 						minimumFractionDigits: 2,
	// 						maximumFractionDigits: 2,
	// 					}).format(value)
	// 				: "0.00"
	// 	}
	// }

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
