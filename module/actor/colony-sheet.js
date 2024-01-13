import { ALIENRPG } from '../config.js';
import { logger } from '../logger.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgColonySheet extends ActorSheet {
	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		this._filters = {
			policies: new Set(),
			installations: new Set(),
			projects: new Set(),
		};
	}

	/** @override */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['alienrpg', 'sheet', 'actor', 'colony-sheet'],
			// template: 'systems/alienrpg/templates/actor/actor-sheet.html',
			width: 1120,
			height: 900,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
		});
	}

	get template() {
		const path = 'systems/alienrpg/templates/actor/';
		// return `${path}actor-sheet.html`;
		// unique item sheet by type, like `weapon-sheet.html`.
		if (game.settings.get('alienrpg', 'aliencrt')) {
			return `systems/alienrpg/templates/actor/crt/${this.actor.type}-sheet.html`;
		} else {
			return `${path}${this.actor.type}-sheet.html`;
		}
	}

	/* -------------------------------------------- */
	async _enrichTextFields(data, fieldNameArr) {
		for (let t = 0; t < fieldNameArr.length; t++) {
			if (hasProperty(data, fieldNameArr[t])) {
				setProperty(data, fieldNameArr[t], await TextEditor.enrichHTML(getProperty(data, fieldNameArr[t]), { async: true }));
			}
		}
	}

	/** @override */
	async getData(options) {
		// Basic data

		const isOwner = this.document.isOwner;

		let data = {
			id: this.actor.id,
			actor: foundry.utils.deepClone(this.actor),
			system: foundry.utils.deepClone(this.actor.system),
			isGM: game.user.isGM,
			owner: this.object.isOwner,
			options: options,
			config: CONFIG.ALIENRPG,
		};
		data.system.items = this.actor.items.map((i) => {
			i.labels = i.labels;
			return i;
		});
		data.system.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		data.system.labels = this.actor.labels || {};
		data.system.filters = this._filters;

		let enrichedFields = ['system.notes'];
		await this._enrichTextFields(data, enrichedFields);

		await this._prepareItems(data);

		await this._initiativeMods(data);

		logger.debug('Actor Sheet derived data:', data);
		//Return data to the sheet
		return data;
	}

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		const itemContextMenu = [
			{
				name: game.i18n.localize('ALIENRPG.EditItemTitle'),
				icon: '<i class="fas fa-edit"></i>',
				callback: (element) => {
					const item = this.actor.items.get(element.data('item-id'));
					item.sheet.render(true);
				},
			},
			{
				name: game.i18n.localize('ALIENRPG.DeleteItem'),
				icon: '<i class="fas fa-trash"></i>',
				callback: (element) => {
					let itemDel = this.actor.items.get(element.data('item-id'));
					itemDel.delete();
				},
			},
		];

		// Add Inventory Item
		new ContextMenu(html, '.item-edit', itemContextMenu);

		html.find('.item-create').click(this._onItemCreate.bind(this));
		// Update Inventory Item
		html.find('.openItem').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});

		// Update Inventory Item
		html.find('.item-edit').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});

		html.find('.item-edit1').click((ev) => {
			const li = $(ev.currentTarget).parents('.item');
			const item = this.actor.items.get(li.data('itemId'));
			item.sheet.render(true);
		});

		html.find('.inline-edit').change(this._inlineedit.bind(this));

		// Drag events for macros.
		// if (this.actor.isOwner) {
		// 	let handler = (ev) => this._onDragStart(ev);
		// 	// Find all items on the character sheet.
		// 	html.find('li.item').each((i, li) => {
		// 		// Ignore for the header row.
		// 		if (li.classList.contains('item-header')) return;
		// 		// Add draggable attribute and dragstart listener.
		// 		li.setAttribute('draggable', true);
		// 		li.addEventListener('dragstart', handler, false);
		// 	});
	}

	/*
	 * Organize and classify Owned Items for Character sheets
	 * @private
	 */
	async _prepareItems(data) {
		// Initialize containers.
		// const inventory = {
		// 	policies: { section: 'Policies', label: game.i18n.localize('ALIENRPG.Policies'), items: [], dataset: { 'system.header.type': '1' } },
		// 	installations: {
		// 		section: 'Installations',
		// 		label: game.i18n.localize('ALIENRPG.Installations'),
		// 		items: [],
		// 		dataset: { 'system.header.type': '2' },
		// 	},
		// 	projects: { section: 'Projects', label: game.i18n.localize('ALIENRPG.Projects'), items: [], dataset: { 'system.header.type': '3' } },
		// };

		// Partition items by category
		let [items] = data.system.items.reduce(
			(arr, item) => {
				// Item details
				// Classify items into types
				if (item.system.header.type === '1') arr[0].push(item);
				else if (item.system.header.type === '2') arr[1].push(item);
				else if (item.system.header.type === '3') arr[2].push(item);
				return arr;
			},
			[[], [], []]
		);
		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);

		const policies = [];
		const installations = [];
		const projects = [];

		// Iterate through items, allocating to containers
		for (let i of data.actor.items) {
			let item = i.system;
			switch (item.header.type) {
				case '1':
					policies.push(i);
					break;

				case '2':
					installations.push(i);
					break;

				case '3':
					projects.push(i);
					break;

				default:
					break;
			}
		}
		// Assign and return
		data.policies = policies;
		data.installations = installations;
		data.projects = projects;

		// data.inventory = Object.values(inventory);
	}

	async _initiativeMods(actor) {
		const aData = actor.system;
		var attrMod = {
			economy: 0,
			potential: 0,
			productivity: 0,
			maintenance: 0,
			science: 0,
			spirit: 0,
		};

		for (let [skey, Attrib] of Object.entries(this.actor.items.contents)) {
			// debugger;
			if (Attrib.type === 'colony-initiative') {
				let base = Attrib.system.modifiers;
				for (let [bkey, aAttrib] of Object.entries(base)) {
					switch (bkey) {
						case 'economy':
							attrMod.economy = attrMod.economy += parseInt(aAttrib.value);
							break;
						case 'potential':
							attrMod.potential = attrMod.potential += parseInt(aAttrib.value);
							break;
						case 'productivity':
							attrMod.productivity = attrMod.productivity += parseInt(aAttrib.value);
							break;
						case 'maintenance':
							attrMod.maintenance = attrMod.maintenance += parseInt(aAttrib.value);
							break;
						case 'science':
							attrMod.science = attrMod.science += parseInt(aAttrib.value);
							break;
						case 'spirit':
							attrMod.spirit = attrMod.spirit += parseInt(aAttrib.value);
							break;

						default:
							break;
					}
				}
			}
		}

		await this.actor.update({
			'system.stats.economy.mod': (aData.stats.economy.mod = parseInt(attrMod.economy || 0)),
			'system.stats.potential.mod': (aData.stats.potential.mod = parseInt(attrMod.potential || 0)),
			'system.stats.productivity.mod': (aData.stats.productivity.mod = parseInt(attrMod.productivity || 0)),
			'system.stats.maintenance.mod': (aData.stats.maintenance.mod = parseInt(attrMod.maintenance || 0)),
			'system.stats.science.mod': (aData.stats.science.mod = parseInt(attrMod.science || 0)),
			'system.stats.spirit.mod': (aData.stats.spirit.mod = parseInt(attrMod.spirit || 0)),
			'system.stats.developmenttotal.value': (aData.stats.developmenttotal.value =
				aData.stats.economy.value +
				aData.stats.potential.value +
				aData.stats.productivity.value +
				aData.stats.maintenance.value +
				aData.stats.science.value +
				aData.stats.spirit.value),
			'system.stats.developmenttotal.mod': (aData.stats.developmenttotal.mod =
				parseInt(attrMod.economy || 0) +
				parseInt(attrMod.potential || 0) +
				parseInt(attrMod.productivity || 0) +
				parseInt(attrMod.maintenance || 0) +
				parseInt(attrMod.science || 0) +
				parseInt(attrMod.spirit || 0)),
			'system.stats.developmenttotal.total': (aData.stats.developmenttotal.total = aData.stats.developmenttotal.value + aData.stats.developmenttotal.mod),
		});
	}

	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const iName = `New ${type.capitalize()}`;
		// Prepare the item object.
		const itemData = {
			name: iName,
			type: type,
			system: system,
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system['type'];

		// Finally, create the item!
		// return this.actor.createOwnedItem(itemData);
		return await this.actor.createEmbeddedDocuments(itemData);
	}
	/** @override */
	async _onDropItemCreate(itemData) {
		const type = itemData.type;
		const alwaysAllowedItems = ALIENRPG.physicalItems;
		const allowedItems = {
			colony: ['colony-initiative'],
		};
		let allowed = true;

		if (!alwaysAllowedItems.includes(type)) {
			if (!allowedItems[this.actor.type].includes(type)) {
				allowed = false;
			}
		}

		if (!allowed) {
			const msg = game.i18n.format('ALIENRPG.NotifWrongItemType', {
				type: type,
				actor: this.actor.type,
			});
			console.warn(`Alien RPG | ${msg}`);
			ui.notifications.warn(msg);
			return false;
		}
		return super._onDropItemCreate(itemData);
	}

	async _inlineedit(event) {
		event.preventDefault();
		const dataset = event.currentTarget;
		// console.log('alienrpgActorSheet -> _inlineedit -> dataset', dataset);
		let itemId = dataset.parentElement.parentElement.dataset.itemId;
		let item = this.actor.items.get(itemId);
		let temp = dataset.dataset.mod;
		// let field = temp.slice(5);
		return await item.update({ [temp]: dataset.value }, {});
	}

	/**
	 * Determine whether an Owned Item will be shown based on the current set of filters
	 * @return {boolean}
	 * @private
	 */
	_filterItems(items, filters) {
		return items.filter((item) => {
			const data = item.system;
			return true;
		});
	}

	_findActiveList() {
		return this.element.find('.tab.active .directory-list');
	}
}
export default alienrpgColonySheet;
