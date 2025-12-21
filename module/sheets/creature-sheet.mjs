/** biome-ignore-all lint/complexity/noThisInStatic: <explanation> */
import AlienRPGActiveEffect from "../documents/active-effect.mjs"
import { logger } from "../helpers/logger.mjs"
import { alienrpgrTableGet } from "../helpers/rollTableData.mjs"
import { yze } from "../helpers/YZEDiceRoller.mjs"

const { api, sheets } = foundry.applications

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheetV2}
 */
export default class alienrpgCreatureSheet extends api.HandlebarsApplicationMixin(sheets.ActorSheetV2) {
	/** @override */
	static DEFAULT_OPTIONS = {
		classes: ["alienrpg", "actor", "ALIENRPG"],
		position: {
			width: 782,
			height: 880,
		},
		window: {
			resizable: true,
		},
		actions: {
			onEditImage: this._onEditImage,
			viewDoc: this._viewDoc,
			createDoc: this._createDoc,
			deleteDoc: this._deleteDoc,
			toggleEffect: this._toggleEffect,
			creatureAttackRoll: {
				handler: this._onRollCreatureAttack,
				buttons: [0, 2],
			},
			RollAbility: { handler: this._onRollAbility, buttons: [0, 2] },
			creatureAcidRoll: this._onCreatureAcidRoll,
			RollCrit: { handler: this._onRollCrit, buttons: [0, 2] },
		},
		// Custom property that's merged into `this.options`
		// dragDrop: [{ dragSelector: '.draggable', dropSelector: null }],
		form: {
			submitOnChange: true,
			submitOnClose: false,
			closeOnSubmit: false,
		},
	}

	/** @override */
	static PARTS = {
		header: {
			template: "systems/alienrpg/templates/actor/creature-header.hbs",
		},
		tabs: {
			// Foundry-provided generic template
			template: "templates/generic/tab-navigation.hbs",
		},
		notes: {
			template: "systems/alienrpg/templates/actor/notes.hbs",
			scrollable: [""],
		},
		creature: {
			template: "systems/alienrpg/templates/actor/creature-general.hbs",
			scrollable: [""],
		},
		crtuicreatureheader: {
			template: "systems/alienrpg/templates/actor/crt/crtui-creature-header.hbs",
		},
		crtuicreaturegeneral: {
			template: "systems/alienrpg/templates/actor/crt/crtui-creature-general.hbs",
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
		switch (this.document.type) {
			case "creature":
				if (game.settings.get("alienrpg", "aliencrt")) {
					options.parts.push("crtuicreatureheader", "tabs", "crtuicreaturegeneral", "notes")
				} else {
					options.parts.push("header", "tabs", "creature", "notes")
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
			// isNPC: this.actor.system.header.npc || false,
			isSynthetic: this.actor.type === "synthetic",
			isVehicles: this.actor.type === "vehicles",
			isCreature: this.actor.type === "creature",
			isCharacter: this.actor.type === "character",
			isGM: game.user.isGM,
		}

		context.statuses = await this._prepareStatusEffects()
		context.effects = await this._prepareActiveEffectCategories()

		context.rTables = alienrpgrTableGet.rTableget()
		context.cTables = alienrpgrTableGet.cTableget()

		this._prepareCreatureItems(context) // Return data to the sheet

		return context
	}

	/** @override */
	async _preparePartContext(partId, context) {
		switch (partId) {
			case "creature":
			case "crtuicreaturegeneral":
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
		const sheetType = game.settings.get("alienrpg", "aliencrt")

		switch (sheetType) {
			case false:
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "creature"
				break
			case true:
				if (!this.tabGroups[tabGroup]) this.tabGroups[tabGroup] = "crtuicreaturegeneral"
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
				case "crtuicreatureheader":
				case "tabs":
					return tabs
				case "notes":
					tab.id = "notes"
					tab.label += "Notes"
					break
				case "creature":
					tab.id = "creature"
					tab.label += "Creature"
					break
				case "crtuicreaturegeneral":
					tab.id = "crtuicreaturegeneral"
					tab.label += "Creature"
					break
			}
			if (this.tabGroups[tabGroup] === tab.id) tab.cssClass = "active"
			tabs[partId] = tab
			return tabs
		}, {})
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
	 * Organize and classify Items for Actor sheets.
	 *
	 * @param {object} context The context object to mutate
	 */
	_prepareItems(context) {
		// Initialize containers.
		// You can just use `this.document.itemTypes` instead
		// if you don't need to subdivide a given type like
		// this sheet does with spells
	}

	async _prepareCreatureItems(context) {
		const critInj = []

		// Iterate through items, allocating to containers
		for (const i of context.actor.items) {
			critInj.push(i)
		}
		context.critInj = critInj
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
		logger.debug("Creature Sheet derived context:", context)
	}

	/**************
	 *
	 *   ACTIONS
	 *
	 **************/

	/**
	 * Handle changing a Document's image.
	 *
	 * @this this
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
	 * @this this
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
	 * @this this
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
	 * @this this
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

	/**
	 * Determines effect parent to pass to helper
	 *
	 * @this AlienEnhancedActorSheet
	 * @param {PointerEvent} event   The originating click event
	 * @param {HTMLElement} target   The capturing HTML element which defined a [data-action]
	 * @private
	 */
	static async _toggleEffect(event, target) {
		const effect = this._getEmbeddedDocument(target)
		await effect.update({ disabled: !effect.disabled })
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

	static async _onRollCreatureAttack(event, target) {
		event.preventDefault() // Don't open context menu
		event.stopPropagation() // Don't trigger other events
		if (event.detail > 1) return // Ignore repeated clicks

		const dataset = target.dataset
		if (event.button === 2) {
			this._creatureManAttackRoll(this.actor, dataset)
		} else {
			this._creatureAutoAttackRoll(this.actor, dataset)
		}
	}

	async _creatureAutoAttackRoll(actor, dataset, manCrit) {
		let chatMessage = ""
		let customResults = ""
		let roll = ""
		const targetTable = dataset.atttype
		if (targetTable === "None") {
			logger.warn(game.i18n.localize("ALIENRPG.NoCharCrit"))
			return
		}
		const table = game.tables.contents.find((b) => b.name === targetTable)

		roll = await new Roll("1d6").evaluate()

		if (!manCrit) {
			customResults = await table.roll({ roll })
		} else {
			const formula = manCrit
			roll = await new Roll(formula).evaluate()
			customResults = await table.roll({ roll })
		}
		chatMessage += "<h2>" + game.i18n.localize("ALIENRPG.AttackRoll") + "</h2>"
		chatMessage += `<h4><i>${table.name}</i></h4>`
		chatMessage += `${customResults.results[0].description}`
		const chatData = {
			user: game.user.id,
			speaker: ChatMessage.getSpeaker({
				actor: actor.id,
			}),
			rolls: [customResults.roll],
			rollMode: game.settings.get("core", "rollMode"),
			content: chatMessage,
			sound: CONFIG.sounds.dice,
		}
		if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
			chatData.whisper = ChatMessage.getWhisperRecipients("GM")
		} else if (chatData.rollMode === "selfroll") {
			chatData.whisper = [game.user]
		}
		ChatMessage.create(chatData)
		return
	}

	async _creatureManAttackRoll(actor, dataset) {
		let content = ""
		let response = ""
		content = await foundry.applications.handlebars.renderTemplate(
			"systems/alienrpg/templates/dialog/roll-manual-creature-attack-dialog.hbs",
			actor,
			dataset,
		)
		response = await foundry.applications.api.DialogV2.wait({
			window: { title: "ALIENRPG.rollManCreatureAttack" },
			content,
			rejectClose: false,
			buttons: [
				{
					label: "ALIENRPG.DialRoll",
					callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
				},
				{
					label: "ALIENRPG.DialCancel",
					action: "cancel",
				},
			],
		})

		if (!response || response === "cancel") return "cancelled"
		if (!response.manCrit.match(/^[1-6]$/gm)) {
			ui.notifications.warn(game.i18n.localize("ALIENRPG.rollManCreAttMax"))
			return
		}
		await this._creatureAutoAttackRoll(actor, dataset, response.manCrit)
	}

	static async _onCreatureAcidRoll(actor, dataset) {
		let label = dataset.dataset.label
		let r1Data = Number(dataset.dataset.roll || 0)
		let r2Data = 0
		const reRoll = true
		const hostile = "creature"
		if (dataset.dataset.roll !== 0) {
			if (dataset.dataset.spbutt === "armor" && r1Data < 1) {
				return
			}
			if (dataset.dataset.spbutt === "armor") {
				// label = 'Armor';
				label = game.i18n.localize("ALIENRPG.Armor")
				r2Data = 0
			}

			let content = ""
			let response = ""
			const title =
				game.i18n.localize("ALIENRPG.DialTitle1") + " " + label + " " + game.i18n.localize("ALIENRPG.DialTitle2")
			content = await foundry.applications.handlebars.renderTemplate(
				"systems/alienrpg/templates/dialog/roll-base-xeno-dialog.hbs",
				actor,
				dataset.dataset,
			)
			response = await foundry.applications.api.DialogV2.wait({
				window: { title: title },
				content,
				rejectClose: false,
				buttons: [
					{
						label: "ALIENRPG.DialRoll",
						callback: (event, button) => new foundry.applications.ux.FormDataExtended(button.form).object,
					},
					{
						label: "ALIENRPG.DialCancel",
						action: "cancel",
					},
				],
			})

			if (!response || response === "cancel") return "cancelled"

			const modifier = Number(response.damage)
			r1Data = r1Data + modifier
			yze.yzeRoll(hostile, false, reRoll, label, r1Data, "Black", r2Data, "Stress", actor.id)
		} else {
			// Roll against the panic table and push the roll to the chat log.
			let chatMessage = ""
			chatMessage += "<h2>" + game.i18n.localize("ALIENRPG.AcidAttack") + "</h2>"
			chatMessage += "<h4><i>" + game.i18n.localize("ALIENRPG.AcidBlood") + "</i></h4>"
			const chatData = {
				user: game.user.id,
				speaker: ChatMessage.getSpeaker({
					actor: actor.id,
				}),
				rollMode: game.settings.get("core", "rollMode"),
				content: chatMessage,
			}
			if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
				chatData.whisper = ChatMessage.getWhisperRecipients("GM")
			} else if (chatData.rollMode === "selfroll") {
				chatData.whisper = [game.user]
			}
			ChatMessage.create(chatData)
		}
	}

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
	// /**
	//  * Fetches the embedded document representing the containing HTML element
	//  *
	//  * @param {HTMLElement} target    The element subject to search
	//  * @returns {Item | ActiveEffect} The embedded Item or ActiveEffect
	//  */
	// _getEmbeddedDocument(target) {
	// 	const docRow = target.closest('li[data-document-class]');
	// 	if (docRow.dataset.documentClass === 'Item') {
	// 		return this.actor.items.get(docRow.dataset.itemId);
	// 	} else if (docRow.dataset.documentClass === 'ActiveEffect') {
	// 		const parent = docRow.dataset.parentId === this.actor.id ? this.actor : this.actor.items.get(docRow?.dataset.parentId);
	// 		return parent.effects.get(docRow?.dataset.effectId);
	// 	} else return console.warn('Could not find document class');
	// }

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
}
