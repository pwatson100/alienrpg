import { yze } from '../YZEDiceRoller.js';
import { toNumber } from '../utils.js';
import { ALIENRPG } from '../config.js';
import { alienrpgrTableGet } from './rollTableData.js';
import { logger } from '../logger.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {foundry.appv1.sheets.ActorSheet}
 */
export class alienrpgSpacecraftSheet extends foundry.appv1.sheets.ActorSheet {
	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		this._filters = {
			inventory: new Set(),
		};
	}

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['alienrpg', 'sheet', 'actor', 'spacecraft-sheet'],
			// template: 'systems/alienrpg/templates/actor/actor-sheet.html',
			width: 1120,
			height: 800,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
		});
	}

	get template() {
		const path = 'systems/alienrpg/templates/actor/';
		// return `${path}actor-sheet.html`;
		// unique item sheet by type, like `weapon-sheet.html`.
		// if (game.settings.get('alienrpg', 'aliencrt')) {
		// 	return `systems/alienrpg/templates/actor/crt/${this.actor.type}-sheet.html`;
		// } else {
		return `${path}${this.actor.type}-sheet.html`;
		// }
	}

	/* -------------------------------------------- */
	async _enrichTextFields(data, fieldNameArr) {
		for (let t = 0; t < fieldNameArr.length; t++) {
			if (foundry.utils.hasProperty(data, fieldNameArr[t])) {
				foundry.utils.setProperty(
					data,
					fieldNameArr[t],
					await foundry.applications.ux.TextEditor.implementation.enrichHTML(foundry.utils.getProperty(data, fieldNameArr[t]), { async: true })
				);
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
			isEnc: this.actor.type === 'character' || this.actor.type === 'synthetic',
			isGM: game.user.isGM,
			owner: this.object.isOwner,
			options: options,
			config: CONFIG.ALIENRPG,
		};
		data.system.items = this.actor.items.map((i) => {
			i.labels = i.labels;
			return i;
		});

		data.sensor_list = CONFIG.ALIENRPG.sensor_list;
		data.pilot_list = CONFIG.ALIENRPG.pilot_list;
		data.gunner_list = CONFIG.ALIENRPG.gunner_list;
		data.engineer_list = CONFIG.ALIENRPG.engineer_list;

		data.system.items.sort((a, b) => (a.sort || 0) - (b.sort || 0));
		data.system.labels = this.actor.labels || {};
		data.system.filters = this._filters;

		data.system.attributes.damage.max = data.system.attributes.hull.value;
		data.system.DAMmax = data.system.attributes.damage.max;
		data.system.DAMcurrent = data.system.attributes.damage.value;
		data.system.DAMlost = data.system.DAMmax - data.system.DAMcurrent;

		await this._prepareVehicleItems(data);
		await this._prepareCrew(data);
		let enrichedFields = ['actor.system.notes'];
		await this._enrichTextFields(data, enrichedFields);

		logger.debug('Actor Sheet derived data:', data);
		//Return data to the sheet
		return data;
	}

	_findActiveList() {
		return this.element.find('.tab.active .directory-list');
	}

	/*
	 * Organize and classify Owned Items for Character sheets
	 * @private
	 */
	async _prepareVehicleItems(data) {
		// Initialize containers.
		const inventory = {
			weapon: { section: 'Weapons', label: game.i18n.localize('ALIENRPG.InventoryWeaponsHeader'), items: [], dataset: { type: 'weapon' } },
			item: { section: 'Items', label: game.i18n.localize('ALIENRPG.InventoryItemsHeader'), items: [], dataset: { type: 'item' } },
			armor: { section: 'Armor', label: game.i18n.localize('ALIENRPG.InventoryArmorHeader'), items: [], dataset: { type: 'armor' } },
			spacecraftmods: { section: 'Spacecraft Mods', label: game.i18n.localize('ALIENRPG.MODULES-UPGRADES'), items: [], dataset: { type: 'spacecraftmods' } },
			spacecraftweapons: {
				section: 'Spacecraft Weapons',
				label: game.i18n.localize('ALIENRPG.SpacecraftWeapons'),
				items: [],
				dataset: { type: 'spacecraftweapons' },
			},
		};
		// Partition items by category
		let [items, Weapons, Armor, spacecraftmods, spacecraftweapons] = data.system.items.reduce(
			(arr, item) => {
				// Item details
				item.img = item.img || DEFAULT_TOKEN;
				item.isStack = item.system.quantity ? item.system.quantity > 1 : false;

				// Classify items into types
				if (item.type === 'Weapons') arr[1].push(item);
				else if (item.type === 'Armor') arr[2].push(item);
				else if (item.type === 'spacecraftmods') arr[3].push(item);
				else if (item.type === 'spacecraftweapons') arr[4].push(item);
				else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
				return arr;
			},
			[[], [], [], [], []]
		);

		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);
		const critMin = [];
		const critMaj = [];

		// Iterate through items, allocating to containers
		for (let i of data.system.items) {
			let item = i.system;
			switch (i.type) {
				case 'spacecraft-crit':
					switch (i.system.header.type.value) {
						case '0':
							critMin.push(i);
							break;
						case '1':
							critMaj.push(i);
							break;
					}
					break;
				case 'spacecraftmods':
					inventory[i.type].items.push(i);
					break;
				case 'spacecraftweapons':
					inventory[i.type].items.push(i);
					break;

				case 'armor':
					inventory[i.type].items.push(i);
					break;

				case 'weapon':
					if (item.header.active != 'fLocker') {
					}
					inventory[i.type].items.push(i);

					break;

				default:
					// Its just an item
					if (item.header.active != 'fLocker') {
					}
					inventory[i.type].items.push(i);
					break;
			}
		}

		data.inventory = Object.values(inventory);
		data.critMin = critMin;
		data.critMaj = critMaj;
		console.log(data.critMin.length, data.critMaj.length);
		await this.actor.update({
			'system.general.critMin': data.critMin.length,
			'system.general.critMaj': data.critMaj.length,
		});
	}

	async _prepareCrew(sheetData) {
		sheetData.crew = sheetData.actor.system.crew.occupants.reduce((arr, o) => {
			o.actor = game.actors.get(o.id);
			// Creates a fake actor if it doesn't exist anymore in the database.
			if (!o.actor) {
				o.actor = {
					name: '{MISSING_CREW}',
					system: { system: { health: { value: 0, max: 0 } } },
					isCrewDeleted: true,
				};
			}
			arr.push(o);
			return arr;
		}, []);
		sheetData.actor.system.crew.occupants.sort((o1, o2) => {
			const pos1 = ALIENRPG.spacecraft.crewPositionFlags.indexOf(o1.position);
			const pos2 = ALIENRPG.spacecraft.crewPositionFlags.indexOf(o2.position);
			if (pos1 < pos2) return -1;
			if (pos1 > pos2) return 1;
			// If they are at the same position, sort by their actor's names.
			if (o1.actor.name < o2.actor.name) return -1;
			if (o1.actor.name > o2.actor.name) return 1;
			return 0;
		});
		return sheetData;
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

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		const itemContextMenu = [
			{
				name: game.i18n.localize('ALIENRPG.addToFLocker'),
				icon: '<i class="fas fa-archive"></i>',
				callback: (element) => {
					let item = this.actor.items.get(element.data('item-id'));
					item.update({ 'system.header.active': 'fLocker' });
				},
			},
			{
				name: game.i18n.localize('ALIENRPG.moveFromFlocker'),
				icon: '<i class="fas fa-archive"></i>',
				callback: (element) => {
					let item = this.actor.items.get(element.data('item-id'));
					item.update({ 'system.header.active': false });
				},
			},
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
		new foundry.applications.ux.ContextMenu(html, '.item-edit', itemContextMenu);

		const itemContextMenu1 = [
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
					if (itemDel.type === 'spacecraft-crit') {
						switch (itemDel.system.header.type.value) {
							case '0':
								if (this.actor.system.general.critMin <= 1) {
									this.actor.removeCondition('shipminor');
								}
								break;
							case '1':
								if (this.actor.system.general.critMaj <= 1) {
									this.actor.removeCondition('shipmajor');
								}
								break;
							default:
								break;
						}
					}
					itemDel.delete();
				},
			},
		];

		// Add Inventory Item
		new foundry.applications.ux.ContextMenu(html, '.item-edit1', itemContextMenu1);

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

		if (game.settings.get('alienrpg', 'switchMouseKeys')) {
			// Right to Roll and left to mod
			// Rollable abilities.
			html.find('.rollable').contextmenu(this._onRoll.bind(this));

			html.find('.rollable').click(this._onRollMod.bind(this));

			html.find('.rollableVeh').contextmenu(this._onRoll.bind(this));

			html.find('.rollableVeh').click(this._onRollMod.bind(this));

			// Rollable Items.
			html.find('.rollItem').contextmenu(this._rollItem.bind(this));

			html.find('.rollItem').click(this._onRollItemMod.bind(this));

			html.find('.crewPanic').contextmenu(this._crewPanic.bind(this));

			html.find('.crewPanic').click(this._crewPanicMod.bind(this));
		} else {
			// Left to Roll and Right toMod
			// Rollable abilities.
			html.find('.rollable').click(this._onRoll.bind(this));

			html.find('.rollable').contextmenu(this._onRollMod.bind(this));

			html.find('.rollableVeh').click(this._onRoll.bind(this));

			html.find('.rollableVeh').contextmenu(this._onRollMod.bind(this));

			// Rollable Items.
			html.find('.rollItem').click(this._rollItem.bind(this));

			html.find('.rollItem').contextmenu(this._onRollItemMod.bind(this));

			html.find('.crewPanic').click(this._crewPanic.bind(this));

			html.find('.crewPanic').contextmenu(this._crewPanicMod.bind(this));
		}

		html.find('.currency').on('change', this._currencyField.bind(this));
		// minus from health and stress
		html.find('.minus-btn').click(this._plusMinusButton.bind(this));

		// plus tohealth and stress
		html.find('.plus-btn').click(this._plusMinusButton.bind(this));
		html.find('.click-damage-level').on('click contextmenu', this._onClickDamageLevel.bind(this)); // Toggle for radio buttons

		html.find('.inline-edit').change(this._inlineedit.bind(this));

		html.find('.rollMinorCD').click(this._rollMinorCD.bind(this));
		html.find('.rollMinorCD').contextmenu(this._rollMinorCDMan.bind(this));

		html.find('.rollMajorCD').click(this._rollMajorCD.bind(this));
		html.find('.rollMajorCD').contextmenu(this._rollMajorCDMan.bind(this));

		html.find('.activate').click(this._activate.bind(this));
		html.find('.activate').contextmenu(this._deactivate.bind(this));

		html.find('.sensorsubmit').click(this._shipPhase.bind(this));
		html.find('.pilotsubmit').click(this._shipPhase.bind(this));
		html.find('.gunnersubmit').click(this._shipPhase.bind(this));
		html.find('.engineersubmit').click(this._shipPhase.bind(this));

		// Drag events for macros.
		if (this.actor.isOwner) {
			let handler = (ev) => this._onDragStart(ev);
			// Find all items on the character sheet.
			html.find('li.item').each((i, li) => {
				// Ignore for the header row.
				if (li.classList.contains('item-header')) return;
				// Add draggable attribute and dragstart listener.
				li.setAttribute('draggable', true);
				li.addEventListener('dragstart', handler, false);
			});
		}

		html.find('.crew-edit').click(this._onCrewEdit.bind(this));
		html.find('.crew-remove').click(this._onCrewRemove.bind(this));
		html.find('.crew-position').change(this._onChangePosition.bind(this));
	}
	/** @override */
	async _onDropItemCreate(itemData) {
		const type = itemData.type;
		const alwaysAllowedItems = ALIENRPG.physicalItems;
		const allowedItems = {
			spacecraft: ['item', 'weapon', 'armor', 'spacecraft-crit', 'spacecraftmods', 'spacecraftweapons'],
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
	/* -------------------------------------------- */
	/**
	 * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
	 * @param {Event} event   The originating click event
	 * @private
	 */
	_onItemCreate(event) {
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
		return this.actor.createEmbeddedDocuments(itemData);
	}

	async _inlineedit(event) {
		event.preventDefault();
		const dataset = event.currentTarget;
		// console.log('alienrpgActorSheet -> _inlineedit -> dataset', dataset);
		let itemId = dataset.parentElement.dataset.itemId;
		let item = this.actor.items.get(itemId);
		let temp = dataset.dataset.mod;
		// let field = temp.slice(5);
		return await item.update({ [temp]: dataset.value }, {});
	}

	/**
	 * Handle clickable rolls.
	 * @param {Event} event   The originating click event
	 * @private
	 */

	_onRoll(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollAbility(this.actor, dataset);
	}

	_onRollMod(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		this.actor.rollAbilityMod(this.actor, dataset);
	}

	_onRollItemMod(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
		const item = this.actor.items.get(itemId);
		if (item.type === 'armor') {
			dataset.roll = this.actor.system.general.armor.value;
			dataset.mod = 0;
			dataset.spbutt = 'armor';
			this.actor.rollAbilityMod(this.actor, dataset);
		} else {
			this.actor.rollItemMod(item);
		}
	}
	_rollItem(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		const itemId = $(event.currentTarget).parents('.item').attr('data-item-id');
		const item = this.actor.items.get(itemId);
		if (item.type === 'armor') {
			dataset.roll = this.actor.system.general.armor.value;
			dataset.mod = 0;
			dataset.spbutt = 'armor';
			this.actor.rollAbility(this.actor, dataset);
		} else {
			this.actor.nowRollItem(item);
		}
	}
	_rollMinorCD(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollCrit(this.actor, this.actor.type, dataset);
	}
	_rollMinorCDMan(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollCritMan(this.actor, this.actor.type, dataset);
	}

	_rollMajorCD(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollCrit(this.actor, this.actor.type, dataset);
	}
	_rollMajorCDMan(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollCritMan(this.actor, this.actor.type, dataset);
	}

	_crewPanic(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const panicActor = game.actors.get(dataset.crewpanic);
		this.actor.rollAbility(panicActor, dataset);
	}
	_crewPanicMod(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const panicActor = game.actors.get(dataset.crewpanic);
		this.actor.rollAbilityMod(panicActor, dataset);
	}

	async _activate(event) {
		event.preventDefault();
		const dataset = event.currentTarget;
		let itemId = dataset.parentElement.dataset.itemId;
		let item = this.actor.items.get(itemId);
		await item.update({ 'system.header.active': true });
	}
	async _deactivate(event) {
		event.preventDefault();
		const dataset = event.currentTarget;
		let itemId = dataset.parentElement.dataset.itemId;
		let item = this.actor.items.get(itemId);
		await item.update({ 'system.header.active': false });
	}

	_plusMinusButton(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		this.actor.stressChange(this.actor, dataset);
	}

	async _onClickDamageLevel(event) {
		event.preventDefault();
		let damage = this.actor.system.attributes.damage;
		if (event.type == 'contextmenu') {
			// left click
			if (damage.value > 0) {
				if (damage.value === 0) {
					return;
				}
				return await this.actor.update({ ['system.attributes.damage.value']: damage.value - 1 });
			}
		} else {
			// right click
			if (damage.value < damage.max) {
				if (damage.value >= 20) {
					return;
				}
				return await this.actor.update({ ['system.attributes.damage.value']: damage.value + 1 });
			}
		}
	}

	_currencyField(event) {
		event.preventDefault();
		const element = event.currentTarget;
		// format initial value
		onBlur({ target: event.currentTarget });

		function localStringToNumber(s) {
			return Number(String(s).replace(/[^0-9.-]+/g, ''));
		}
		function onBlur(e) {
			let value = localStringToNumber(e.target.value);
			if (game.settings.get('alienrpg', 'dollar'))
				e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '$0.00';
			else
				e.target.value = value
					? Intl.NumberFormat('en-EN', { style: 'decimal', useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
					: '0.00';
		}
	}

	async _dropCrew(actorId) {
		const crew = game.actors.get(actorId);
		const actorData = this.actor;
		if (!crew) return;
		if (crew.type === 'vehicles' && crew.type === 'spacecraft') return ui.notifications.info('Vehicle inceptions are not allowed!');
		if (crew.type !== 'character' && crew.type !== 'synthetic') return;
		if (actorData.type === 'spacecraft') {
			if (actorData.system.crew.passengerQty >= actorData.system.attributes.crew.value) {
				return ui.notifications.warn(game.i18n.localize('ALIENRPG.fullCrew'));
			}
			return await actorData.addVehicleOccupant(actorId);
		}
	}
	async _onCrewEdit(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const crewId = elem.closest('.occupant').dataset.crewId;
		const actor = game.actors.get(crewId);
		return actor.sheet.render(true);
	}

	async _onCrewRemove(event) {
		event.preventDefault();
		const actorData = this.actor;
		const elem = event.currentTarget;
		const crewId = elem.closest('.occupant').dataset.crewId;
		const occupants = this.actor.removeVehicleOccupant(crewId);
		let crewNumber = actorData.system.crew.passengerQty;
		crewNumber--;
		await actorData.update({ 'system.crew.passengerQty': crewNumber });
		return await actorData.update({ 'system.crew.occupants': occupants });
	}

	async _onChangePosition(event) {
		event.preventDefault();
		const elem = event.currentTarget;
		const crewId = elem.closest('.occupant').dataset.crewId;
		const position = elem.value;
		return await this.actor.addVehicleOccupant(crewId, position);
	}

	async _shipPhase(event) {
		let htmlData = '';
		event.preventDefault();
		const dataset = event.currentTarget;
		const shipName = this.actor.name;
		const actorID = this.actor.id;
		const element = dataset.previousElementSibling.selectedOptions[0].label;
		const phase = game.i18n.localize(`ALIENRPG.${dataset.previousElementSibling.name}`);

		htmlData = {
			phaseName: `${phase}`,
			actorname: `${shipName}`,
			action: `${element}`,
		};

		// Now push the correct chat message
		const html = await renderTemplate(`systems/alienrpg/templates/chat/ship-combat.html`, htmlData);

		let chatData = {
			user: game.user.id,
			speaker: {
				actor: actorID,
			},
			content: html,
			other: game.users.contents.filter((u) => u.isGM).map((u) => u.id),
			sound: CONFIG.sounds.lock,
			type: CONST.CHAT_MESSAGE_TYPES.OTHER,
		};

		ChatMessage.applyRollMode(chatData, game.settings.get('core', 'rollMode'));
		return ChatMessage.create(chatData);
	}
}
export default alienrpgSpacecraftSheet;
