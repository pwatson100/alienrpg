import { yze } from '../YZEDiceRoller.js';
import { toNumber } from '../utils.js';
import { ALIENRPG } from '../config.js';
import { alienrpgrTableGet } from './rollTableData.js';
import { logger } from '../logger.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgActorSheet extends ActorSheet {
	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		this._filters = {
			inventory: new Set(),
			planetsystem: new Set(),
		};
	}

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['alienrpg', 'sheet', 'actor', 'actor-sheet'],
			width: 800,
			// height: 900 - 'min-content',
			height: 950 - 'min-content',
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
			if (foundry.utils.hasProperty(data, fieldNameArr[t])) {
				foundry.utils.setProperty(data, fieldNameArr[t], await TextEditor.enrichHTML(foundry.utils.getProperty(data, fieldNameArr[t]), { async: true }));
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
			isNPC: this.actor.system.header.npc || false,
			isSynthetic: this.actor.type === 'synthetic',
			isVehicles: this.actor.type === 'vehicles',
			isCreature: this.actor.type === 'creature',
			isCharacter: this.actor.type === 'character',
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

		switch (this.actor.type) {
			case 'character':
				await this._characterData(data);
				await this.actor._checkOverwatch(data);
				await this._prepareItems(data);
				let enrichedFields = ['system.notes', 'system.adhocitems'];
				await this._enrichTextFields(data, enrichedFields);
				data.career_list = CONFIG.ALIENRPG.career_list;

				data.system.RADmax = data.system.general.radiation.max;
				data.system.RADcurrent = data.system.general.radiation.value;
				data.system.RADfill = data.system?.RADmax - data.system.general.radiation?.calculatedMax || 0;
				data.system.RADlost = data.system.RADmax - data.system.RADcurrent - data.system?.RADfill || 0;
				//
				data.system.XPmax = data.system.general.xp.max;
				data.system.XPcurrent = data.system.general.xp.value;
				data.system.XPlost = data.system.XPmax - data.system.XPcurrent;
				data.system.XPfill = data.system.XPmax < 20 ? 20 - data.system.XPmax : 0;
				//
				data.system.SPmax = data.system.general.sp.max;
				data.system.SPcurrent = data.system.general.sp.value;
				data.system.SPlost = data.system.SPmax - data.system.SPcurrent;
				data.system.SPfill = data.system.SPmax < 3 ? 3 - data.system.SPmax : 0;
				break;

			case 'creature':
				data.rTables = alienrpgrTableGet.rTableget();
				data.cTables = alienrpgrTableGet.cTableget();
				await this._prepareCreatureItems(data); // Return data to the sheet
				let enrichedFields2 = ['actor.system.notes'];
				await this._enrichTextFields(data, enrichedFields2);

				break;

			case 'synthetic':
				await this._characterData(data);
				await this.actor._checkOverwatch(data);
				await this._prepareItems(data);
				let enrichedFields3 = ['actor.system.notes', 'actor.system.adhocitems'];
				await this._enrichTextFields(data, enrichedFields3);
				data.career_list = CONFIG.ALIENRPG.career_list;
				data.system.RADmax = data.system.general.radiation.max;
				data.system.RADcurrent = data.system.general.radiation.value;
				data.system.RADfill = data.system?.RADmax - data.system.general.radiation?.calculatedMax || 0;
				data.system.RADlost = data.system.RADmax - data.system.RADcurrent - data.system?.RADfill || 0;

				data.system.XPmax = data.system.general.xp.max;
				data.system.XPcurrent = data.system.general.xp.value;
				data.system.XPlost = data.system.XPmax - data.system.XPcurrent;
				data.system.XPfill = data.system.XPmax < 20 ? 20 - data.system.XPmax : 0;
				//
				data.system.SPmax = data.system.general.sp.max;
				data.system.SPcurrent = data.system.general.sp.value;
				data.system.SPlost = data.system.SPmax - data.system.SPcurrent;
				data.system.SPfill = data.system.SPmax < 3 ? 3 - data.system.SPmax : 0;

				break;
			case 'territory':
				await this._prepareTerritoryItems(data);
				break;

			case 'vehicles':
				await this._prepareVehicleItems(data);
				await this._prepareCrew(data);
				break;

			default:
				break;
		}
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
		new ContextMenu(html, '.item-edit', itemContextMenu);

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
					if (itemDel.type === 'critical-injury' && this.actor.system.general.critInj.value <= 1) {
						this.actor.removeCondition('criticalinj');
					}
					itemDel.delete();
				},
			},
		];

		// Add Inventory Item
		new ContextMenu(html, '.item-edit1', itemContextMenu1);

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

			html.find('.rollVehicleWeapon').contextmenu(this._rollItem.bind(this));

			html.find('.crewPanic').contextmenu(this._crewPanic.bind(this));

			html.find('.crewPanic').click(this._crewPanicMod.bind(this));

			html.find('.rollCrit').contextmenu(this._rollCrit.bind(this));
			html.find('.rollCrit').click(this._rollCritMan.bind(this));

			html.find('.activate').contextmenu(this._activate.bind(this));
			html.find('.activate').click(this._deactivate.bind(this));

			html.find('.supply-btn').click(this._supplyRollMod.bind(this));

			html.find('.supply-btn').contextmenu(this._supplyRoll.bind(this));
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

			html.find('.rollVehicleWeapon').click(this._rollItem.bind(this));

			html.find('.crewPanic').click(this._crewPanic.bind(this));

			html.find('.crewPanic').contextmenu(this._crewPanicMod.bind(this));

			html.find('.rollCrit').click(this._rollCrit.bind(this));
			html.find('.rollCrit').contextmenu(this._rollCritMan.bind(this));

			html.find('.activate').click(this._activate.bind(this));
			html.find('.activate').contextmenu(this._deactivate.bind(this));

			html.find('.supply-btn').click(this._supplyRoll.bind(this));

			html.find('.supply-btn').contextmenu(this._supplyRollMod.bind(this));
		}

		html.find('.currency').on('change', this._currencyField.bind(this));
		// minus from health and stress
		html.find('.minus-btn').click(this._plusMinusButton.bind(this));

		// plus tohealth and stress
		html.find('.plus-btn').click(this._plusMinusButton.bind(this));

		html.find('.click-xp-stat-level').on('click contextmenu', this._onClickXPStatLevel.bind(this)); // Toggle for radio buttons
		html.find('.click-sp-stat-level').on('click contextmenu', this._onClickSPStatLevel.bind(this)); // Toggle for radio buttons
		html.find('.click-stat-level-con').on('click contextmenu', this._onRadPointClick.bind(this));

		// html.find('.click-stat-level-con').on('click contextmenu', this._onClickStatLevelCon.bind(this)); // Toggle for radio buttons

		html.find('.pwr-btn').click(this._supplyRoll.bind(this));

		html.find('.stunt-btn').click(this._stuntBtn.bind(this));

		html.find('.talent-btn').click(this._talentBtn.bind(this));

		html.find('.inline-edit').change(this._inlineedit.bind(this));

		html.find('.overwatch-toggle').on('click contextmenu', this._onOverwatchToggle.bind(this));

		// Creature sheet
		html.find('.creature-attack-roll').click(this._creatureAttackRoll.bind(this));
		html.find('.creature-attack-roll').contextmenu(this._creatureManAttackRoll.bind(this));

		html.find('.creature-acid-roll').click(this._creatureAcidRoll.bind(this));

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

	async _characterData(actor) {
		const aData = actor.system;
		var attrMod = {
			str: 0,
			agl: 0,
			emp: 0,
			wit: 0,
			health: 0,
			stress: 0,
		};

		var sklMod = {
			heavyMach: 0,
			closeCbt: 0,
			stamina: 0,
			rangedCbt: 0,
			mobility: 0,
			piloting: 0,
			command: 0,
			manipulation: 0,
			medicalAid: 0,
			observation: 0,
			survival: 0,
			comtech: 0,
		};
		let totalAc = 0;
		let totalWat = 0;
		let totalFood = 0;
		let totalAir = 0;
		let totalPower = 0;
		let myCrit = 0;

		for (let [skey, Attrib] of Object.entries(this.actor.items.contents)) {
			if (Attrib.system.attributes?.armorrating?.value && Attrib.system.header.active === true) {
				Attrib.system.attributes.armorrating.value = Attrib.system.attributes.armorrating.value || 0;
				Attrib.totalAc = parseInt(Attrib.system.attributes.armorrating.value, 10);
				totalAc += Attrib.totalAc;
			}
			if (Attrib.system.attributes?.water?.value && Attrib.system.header.active === true) {
				Attrib.system.attributes.water.value = Attrib.system.attributes.water.value || 0;
				Attrib.totalWat = parseInt(Attrib.system.attributes.water.value, 10);
				totalWat += Attrib.totalWat;
			}
			if (Attrib.system.attributes?.food?.value && Attrib.system.header.active === true) {
				Attrib.system.attributes.food.value = Attrib.system.attributes.food.value || 0;
				Attrib.totalFood = parseInt(Attrib.system.attributes.food.value, 10);
				totalFood += Attrib.totalFood;
			}
			if (Attrib.system.attributes?.airsupply?.value && Attrib.system.header.active === true) {
				Attrib.system.attributes.airsupply.value = Attrib.system.attributes.airsupply.value || 0;
				Attrib.totalAir = parseInt(Attrib.system.attributes.airsupply.value, 10);
				totalAir += Attrib.totalAir;
			}
			if (Attrib.system.attributes?.power?.value && Attrib.system.header.active === true) {
				Attrib.system.attributes.power.value = Attrib.system.attributes.power.value || 0;
				Attrib.totalPower = parseInt(Attrib.system.attributes.power.value, 10);
				totalPower += Attrib.totalPower;
			}

			if (Attrib.type === 'item' || Attrib.type === 'critical-injury' || Attrib.type === 'armor') {
				if (Attrib.system.header.active === true) {
					let base = Attrib.system.modifiers.attributes;

					for (let [bkey, aAttrib] of Object.entries(base)) {
						switch (bkey) {
							case 'str':
								attrMod.str = attrMod.str += parseInt(aAttrib.value);
								break;
							case 'agl':
								attrMod.agl = attrMod.agl += parseInt(aAttrib.value);
								break;
							case 'emp':
								attrMod.emp = attrMod.emp += parseInt(aAttrib.value);
								break;
							case 'wit':
								attrMod.wit = attrMod.wit += parseInt(aAttrib.value);
								break;
							case 'health':
								attrMod.health = attrMod.health += parseInt(aAttrib.value);
								break;
							case 'stress':
								attrMod.stress = attrMod.stress += parseInt(aAttrib.value);
								break;

							default:
								break;
						}
					}

					let skillBase = Attrib.system.modifiers.skills;
					for (let [skkey, sAttrib] of Object.entries(skillBase)) {
						switch (skkey) {
							case 'heavyMach':
								sklMod.heavyMach = sklMod.heavyMach += parseInt(sAttrib.value);
								break;
							case 'closeCbt':
								sklMod.closeCbt = sklMod.closeCbt += parseInt(sAttrib.value);
								break;
							case 'stamina':
								sklMod.stamina = sklMod.stamina += parseInt(sAttrib.value);
								break;
							case 'rangedCbt':
								sklMod.rangedCbt = sklMod.rangedCbt += parseInt(sAttrib.value);
								break;
							case 'mobility':
								sklMod.mobility = sklMod.mobility += parseInt(sAttrib.value);
								break;
							case 'piloting':
								sklMod.piloting = sklMod.piloting += parseInt(sAttrib.value);
								break;
							case 'command':
								sklMod.command = sklMod.command += parseInt(sAttrib.value);
								break;
							case 'manipulation':
								sklMod.manipulation = sklMod.manipulation += parseInt(sAttrib.value);
								break;
							case 'medicalAid':
								sklMod.medicalAid = sklMod.medicalAid += parseInt(sAttrib.value);
								break;
							case 'observation':
								sklMod.observation = sklMod.observation += parseInt(sAttrib.value);
								break;
							case 'survival':
								sklMod.survival = sklMod.survival += parseInt(sAttrib.value);
								break;
							case 'comtech':
								sklMod.comtech = sklMod.comtech += parseInt(sAttrib.value);
								break;

							default:
								break;
						}
					}
				}
				if (Attrib.type === 'critical-injury') {
					myCrit++;
					console.log(myCrit);
				}
			}

			if (Attrib.type === 'talent' && Attrib.name.toUpperCase() === 'NERVES OF STEEL') {
				attrMod.stress = attrMod.stress += -2;
			}

			if (Attrib.type === 'talent' && Attrib.name.toUpperCase() === 'TAKE CONTROL' && aData.attributes.wit.value > aData.attributes.emp.value) {
				aData.skills.manipulation.ability = 'wit';
			}

			if (Attrib.type === 'talent' && Attrib.name.toUpperCase() === 'TOUGH') {
				attrMod.health = attrMod.health += 2;
			}

			if (Attrib.type === 'talent' && Attrib.name.toUpperCase() === 'STOIC' && aData.attributes.wit.value > aData.attributes.str.value) {
				aData.skills.stamina.ability = 'wit';
			}
		}

		for (let [a, abl] of Object.entries(aData.attributes)) {
			let target = `system.attributes.${a}.mod`;
			let field = `aData.attributes[${a}].mod`;
			let upData = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
			await this.actor.update({ [target]: (field = upData) });
			abl.mod = parseInt(abl.value || 0) + parseInt(attrMod[a] || 0);
			abl.label = CONFIG.ALIENRPG.attributes[a];
		}

		for (let [s, skl] of Object.entries(aData.skills)) {
			const conSkl = skl.ability;
			let target = `system.skills.${s}.mod`;
			let field = `aData.skills[${s}].mod`;
			let upData = parseInt(skl.value || 0) + parseInt(aData.attributes[conSkl].mod || 0) + parseInt(sklMod[s] || 0);
			await this.actor.update({ [target]: (field = upData) });
			skl.mod = parseInt(skl.value || 0) + parseInt(sklMod[s] || 0) + parseInt(aData.attributes[conSkl].mod || 0);
			skl.label = CONFIG.ALIENRPG.skills[s];
		}

		await this.actor.update({
			'system.general.radiation.permanent': aData.general.radiation.permanent ?? 0,
			'system.consumables.water.value': (aData.consumables.water.value = parseInt(totalWat || 0)),
			'system.consumables.food.value': (aData.consumables.food.value = parseInt(totalFood || 0)),
			'system.consumables.air.value': (aData.consumables.air.value = parseInt(totalAir || 0)),
			'system.consumables.power.value': (aData.consumables.power.value = parseInt(totalPower || 0)),
			'system.general.armor.value': (aData.general.armor.value = parseInt(totalAc || 0)),
			'system.general.radiation.calculatedMax': (aData.general.radiation.calculatedMax =
				parseInt(aData.general.radiation.max - (aData.general.radiation.permanent ?? 0)) || 0),
			'system.general.xp.calculatedMax': (aData.general.xp.calculatedMax = aData.general.xp.max),
			'system.header.health.max': aData.attributes.str.value + aData.header.health.mod,
			'system.header.health.mod': (aData.header.health.mod = parseInt(attrMod.health || 0)),
			'system.header.health.calculatedMax': (aData.header.health.calculatedMax = aData.attributes.str.value + aData.header.health.mod),
		});

		if (actor.actor.type === 'character') {
			await this.actor.update({
				'system.header.stress.mod': (aData.header.stress.mod = parseInt(attrMod.stress || 0)),
				'system.general.critInj.value': myCrit,
			});
		}
	}

	_findActiveList() {
		return this.element.find('.tab.active .directory-list');
	}

	async _prepareTerritoryItems(data) {
		const systems = [];
		// Iterate through items, allocating to containers
		// let totalWeight = 0;
		for (let i of data.system.items) {
			let item = i.system;
			// Append to gear.
			if (i.type === 'planet-system') {
				systems.push(i);
			}
		}

		// Assign and return
		data.systems = systems;
	}

	/*
	 * Organize and classify Owned Items for Character sheets
	 * @private
	 */
	async _prepareItems(data) {
		// Initialize containers.
		const inventory = {
			weapon: { section: 'Weapons', label: game.i18n.localize('ALIENRPG.InventoryWeaponsHeader'), items: [], dataset: { type: 'weapon' } },
			item: { section: 'Items', label: game.i18n.localize('ALIENRPG.InventoryItemsHeader'), items: [], dataset: { type: 'item' } },
			armor: { section: 'Armor', label: game.i18n.localize('ALIENRPG.InventoryArmorHeader'), items: [], dataset: { type: 'armor' } },
		};
		// Partition items by category
		let [items, Weapons, Armor] = data.system.items.reduce(
			(arr, item) => {
				// Item details
				item.img = item.img || DEFAULT_TOKEN;
				item.isStack = item.system.quantity ? item.system.quantity > 1 : false;

				// Classify items into types
				if (item.type === 'Weapons') arr[1].push(item);
				else if (item.type === 'Armor') arr[2].push(item);
				else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
				return arr;
			},
			[[], [], []]
		);

		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);

		const talents = [];
		const agendas = [];
		const specialities = [];
		const critInj = [];

		let totalWeight = 0;

		// Iterate through items, allocating to containers
		for (let i of data.actor.items) {
			let item = i.system;
			switch (i.type) {
				case 'talent':
					talents.push(i);
					break;

				case 'agenda':
					agendas.push(i);
					break;

				case 'specialty':
					if (specialities.length > 1) {
						break;
					} else {
						specialities.push(i);
						break;
					}
				case 'critical-injury':
					critInj.push(i);
					break;

				case 'armor':
					if (item.header.active != 'fLocker') {
						i.system.attributes.weight.value = i.system.attributes.weight.value || 0;
						i.totalWeight = i.system.attributes.weight.value;
						totalWeight += i.totalWeight;
					}
					inventory[i.type].items.push(i);
					break;

				case 'weapon':
					if (item.header.active != 'fLocker') {
						let ammoweight = 0.25;
						if (i.system.attributes.class.value == 'RPG' || i.name.includes(' RPG ') || i.name.startsWith('RPG') || i.name.endsWith('RPG')) {
							ammoweight = 0.5;
						}
						i.system.attributes.weight.value = i.system.attributes.weight.value || 0;
						i.totalWeight = (i.system.attributes.weight.value + i.system.attributes.rounds.value * ammoweight) * i.system.attributes.quantity.value;
						totalWeight += i.totalWeight;
					}
					inventory[i.type].items.push(i);

					break;

				default:
					// Its just an item
					if (item.header.active != 'fLocker') {
						i.system.attributes.weight.value = i.system.attributes.weight.value || 0;
						i.totalWeight = i.system.attributes.weight.value * i.system.attributes.quantity.value;
						totalWeight += i.totalWeight;
					}
					inventory[i.type].items.push(i);
					break;
			}
		}
		// Assign and return
		data.talents = talents;
		data.agendas = agendas;
		data.specialities = specialities;
		data.critInj = critInj;

		data.system.general.encumbrance = this._computeEncumbrance(totalWeight, data);
		data.inventory = Object.values(inventory);
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
		};
		// Partition items by category
		let [items, Weapons, Armor] = data.system.items.reduce(
			(arr, item) => {
				// Item details
				item.img = item.img || DEFAULT_TOKEN;
				item.isStack = item.system.quantity ? item.system.quantity > 1 : false;

				// Classify items into types
				if (item.type === 'Weapons') arr[1].push(item);
				else if (item.type === 'Armor') arr[2].push(item);
				else if (Object.keys(inventory).includes(item.type)) arr[0].push(item);
				return arr;
			},
			[[], [], []]
		);

		// Apply active item filters
		items = this._filterItems(items, this._filters.inventory);
		const talents = [];
		const agendas = [];
		const specialities = [];
		const critInj = [];

		// Iterate through items, allocating to containers
		for (let i of data.system.items) {
			let item = i.system;
			switch (i.type) {
				case 'talent':
					talents.push(i);
					break;

				case 'agenda':
					agendas.push(i);
					break;

				case 'specialty':
					if (specialities.length > 1) {
						break;
					} else {
						specialities.push(i);
						break;
					}
				case 'critical-injury':
					critInj.push(i);
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
	}

	async _prepareCreatureItems(sheetData) {
		const critInj = [];

		// Iterate through items, allocating to containers
		for (let i of sheetData.system.items) {
			critInj.push(i);
		}
		sheetData.critInj = critInj;
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
			const pos1 = ALIENRPG.vehicle.crewPositionFlags.indexOf(o1.position);
			const pos2 = ALIENRPG.vehicle.crewPositionFlags.indexOf(o2.position);
			if (pos1 < pos2) return -1;
			if (pos1 > pos2) return 1;
			// If they are at the same position, sort by their actor's names.
			if (o1.actor.name < o2.actor.name) return -1;
			if (o1.actor.name > o2.actor.name) return 1;
			return 0;
		});
		return sheetData;
	}

	/*
	 * Compute the level and percentage of encumbrance for an Actor.
	 *
	 * Optionally include the weight of carried currency across all denominations by applying the standard rule
	 * from the PHB pg. 143
	 *
	 * @param {Number} totalWeight    The cumulative item weight from inventory items
	 * @param {Object} actorData      The data object for the Actor being rendered
	 * @return {Object}               An object describing the character's encumbrance level
	 * @private
	 */
	_computeEncumbrance(totalWeight, actorData) {
		// Compute Encumbrance percentage
		let enc = {
			max: actorData.actor.system.attributes.str.value * 4,
			value: Math.round(totalWeight * 100) / 100,
			value: totalWeight,
		};
		for (let i of actorData.talents) {
			if (i.name.toUpperCase() === 'PACK MULE') {
				enc = {
					max: actorData.actor.system.attributes.str.value * 8,
					value: Math.round(totalWeight * 100) / 100,
					value: totalWeight,
				};
			}
		}

		enc.pct = Math.min((enc.value * 100) / enc.max, 99);
		enc.encumbered = enc.pct > 50;
		let aTokens = '';
		if (enc.encumbered) {
			this.actor.addCondition('encumbered');
		} else {
			this.actor.removeCondition('encumbered');
		}
		return enc;
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
	async _onDropItemCreate(itemData) {
		const type = itemData.type;
		const alwaysAllowedItems = ALIENRPG.physicalItems;
		const allowedItems = {
			character: ['item', 'weapon', 'armor', 'talent', 'agenda', 'specialty', 'critical-injury'],
			synthetic: ['item', 'weapon', 'armor', 'talent', 'agenda', 'specialty', 'critical-injury'],
			creature: ['critical-injury'],
			vehicles: ['item', 'weapon', 'armor'],
			territory: ['planet-system'],
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
	_rollCrit(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollCrit(this.actor, this.actor.type, dataset);
	}
	_rollCritMan(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.actor.rollCritMan(this.actor, this.actor.type, dataset);
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

	_stuntBtn(event) {
		event.preventDefault();
		let li = $(event.currentTarget).parents('.grid-container');
		let li2 = li.children('#panel');
		let item = '';
		let str = '';
		let chatData = '';
		let temp2 = '';
		let temp3 = '';
		const dataset = event.currentTarget.dataset;
		let langItem = dataset.pmbut;
		let langStr = langItem;

		var newLangStr = langStr.replace(/\s+/g, '');
		let langTemp = 'ALIENRPG.' + [newLangStr];
		temp3 = game.i18n.localize(langTemp);

		try {
			item = game.items.getName(dataset.pmbut);
			str = item.name;
			temp2 = item.system.description;
			if (temp2 != null || temp2.length) {
				chatData = item.system.description;
			}
			if (temp3.startsWith('<ol>') && chatData.startsWith('<h2>No Stunts Entered</h2>')) {
				chatData = temp3;
			}
		} catch {
			if (temp3.startsWith('<ol>')) {
				chatData = temp3;
			} else {
				chatData = '<h2>No Stunts Entered</h2>';
			}
		}

		let div = $(`<div class="panel Col3">${chatData}</div>`);
		// Toggle summary
		if (li2.hasClass('expanded')) {
			let summary = li2.children('.panel');
			summary.slideUp(200, () => summary.remove());
		} else {
			li2.append(div.hide());
			div.slideDown(200);
		}
		li2.toggleClass('expanded');
	}

	_talentBtn(event) {
		event.preventDefault();
		let li = $(event.currentTarget).parents('.grid-container');
		let li2 = li.children('#panel');
		let item = '';
		let str = '';
		let temp1 = '';
		let temp2 = '';
		let temp3 = '';
		let chatData = '';
		const dataset = event.currentTarget.dataset;

		item = this.actor.items.get(dataset.pmbut);
		str = item.name;
		temp2 = item.system.general.comment.value;
		if (temp2 != null && temp2.length > 0) {
			chatData = item.system.general.comment.value;
		} else {
			// item = dataset.pmbut;
			// str = item;
			var newStr = str.replace(/\s+/g, '');
			temp1 = 'ALIENRPG.' + [newStr];
			temp3 = game.i18n.localize(temp1);
			if (temp3.startsWith('<p>')) {
				chatData = temp3;
			} else {
				chatData = '<p style="font-size: xx-large;">👾</p>';
			}
		}

		let div = $(`<div class="panel Col3">${chatData}</div>`);

		// Toggle summary
		if (li2.hasClass('expanded')) {
			let summary = li2.children('.panel');
			summary.slideUp(200, () => summary.remove());
		} else {
			li2.append(div.hide());
			div.slideDown(200);
		}
		li2.toggleClass('expanded');
	}

	async _onClickXPStatLevel(event) {
		event.preventDefault();
		let xp = this.actor.system.general.xp;
		if (event.type == 'contextmenu') {
			// left click
			if (xp.value > 0) {
				if (xp.value === 0) {
					return;
				}
				return await this.actor.update({ ['system.general.xp.value']: xp.value - 1 });
			}
		} else {
			// right click
			if (xp.value < xp.max) {
				if (xp.value >= 20) {
					return;
				}
				return await this.actor.update({ ['system.general.xp.value']: xp.value + 1 });
			}
		}
	}
	async _onClickSPStatLevel(event) {
		event.preventDefault();
		let sp = this.actor.system.general.sp;
		if (event.type == 'contextmenu') {
			// left click
			if (sp.value > 0) {
				if (sp.value === 0) {
					return;
				}
				return await this.actor.update({ ['system.general.sp.value']: sp.value - 1 });
			}
		} else {
			// right click
			if (sp.value < sp.max) {
				if (sp.value >= 3) {
					return;
				}
				return await this.actor.update({ ['system.general.sp.value']: sp.value + 1 });
			}
		}
	}

	async _onRadPointClick(event) {
		event.preventDefault();
		let actorID = this.actor.id;
		let chatMessage = `<div class="chatBG" + ${actorID} ">`;
		let addRad =
			`<span class="warnblink alienchatred"; style="font-weight: bold; font-size: larger">` +
			game.i18n.localize('ALIENRPG.PermanentRadiationAdded') +
			`</span></div>`;
		let takeRad =
			`<span class="warnblink alienchatlightgreen"; style="font-weight: bold; font-size: larger">` +
			game.i18n.localize('ALIENRPG.PermanentRadiationRemoved') +
			`</span></div>`;

		let rad = this.actor.system.general.radiation;
		switch (event.ctrlKey) {
			case false:
				switch (event.type) {
					case 'contextmenu':
						if (rad.value > 0) {
							switch (rad.value - 1 === 0) {
								case true:
									await this.actor.reduceRadiation(this.actor, event.currentTarget.dataset);
									if (this.actor.system.general.radiation.permanent === 0) {
										await this.actor.removeCondition('radiation');
									}
									break;
								case false:
									await this.actor.reduceRadiation(this.actor, event.currentTarget.dataset);
									break;
							}
						}
						break;
					case 'click':
						if (rad.value < rad.calculatedMax) {
							await this.actor.rollAbility(this.actor, event.currentTarget.dataset);
							await this.actor.update({ ['system.general.radiation.value']: rad.value + 1 });
							if (rad.value <= 1) {
								await this.actor.addCondition('radiation');
							}
						}
						break;
				}
				break;
			case true:
				switch (event.type) {
					case 'contextmenu':
						if (rad.permanent > 0) {
							switch (rad.permanent - 1 === 0 && rad.value === 0) {
								case true: {
									await this.actor.update({ ['system.general.radiation.permanent']: rad.permanent - 1 });
									await this.actor.removeCondition('radiation');
									this.actor.createChatMessage((chatMessage += takeRad), actorID);
									return;
								}
								case false: {
									await this.actor.update({ ['system.general.radiation.permanent']: rad.permanent - 1 });
									this.actor.createChatMessage((chatMessage += takeRad), actorID);
									return;
								}
							}
						}
						break;
					case 'click':
						if (rad.permanent < 10) {
							await this.actor.update({ ['system.general.radiation.permanent']: rad.permanent + 1 });
							if (rad.permanent <= 0) {
								await this.actor.addCondition('radiation');
							}
							this.actor.createChatMessage((chatMessage += addRad), actorID);
							return;
						}
				}
		}
	}

	_supplyRoll(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;

		// If it's a power roll it will have an item number so test if it's zero
		if (dataset.item === '0') return;
		const lTemp = 'ALIENRPG.' + dataset.spbutt;
		// If this is a power roll get the exact id of the item to process
		const tItem = dataset.id || 0;
		const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');
		const consUme = dataset.spbutt.toLowerCase();
		this.actor.consumablesCheck(this.actor, consUme, label, tItem);
	}

	_supplyRollMod(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		// If it's a power roll it will have an item number so test if it's zero
		if (dataset.item === '0') return;
		const lTemp = 'ALIENRPG.' + dataset.spbutt;
		// If this is a power roll get the exact id of the item to process
		const tItem = dataset.id || 0;
		const label = game.i18n.localize(lTemp) + ' ' + game.i18n.localize('ALIENRPG.Supply');
		const consUme = dataset.spbutt.toLowerCase();
		this.actor.consumablesCheckMod(this.actor, consUme, label, tItem);
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
	async _onOverwatchToggle(event) {
		let key = $(event.currentTarget).parents('.condition').attr('data-key');
		if (key === 'overwatch') {
			if (await this.actor.hasCondition(key)) await this.actor.removeCondition(key);
			else await this.actor.addCondition(key);
		} else {
			if (event.type === 'click') {
				if (!(await this.actor.hasCondition(key))) await this.actor.addCondition(key);
			} else {
				if (key === 'panicked') {
					if (await this.actor.hasCondition(key)) await this.actor.checkAndEndPanic(this.actor);
				} else {
					if (await this.actor.hasCondition(key)) await this.actor.removeCondition(key);
				}
			}
		}
	}

	// async checkAndEndPanic(actor) {
	//     if (this.actor.type != 'character') return;

	//     if (this.actor.system.general.panic.lastRoll > 0) {
	//         await this.actor.update({
	//             'system.general.panic.value': 0,
	//         });
	//         await this.actor.update({
	//             'system.general.panic.lastRoll': 0,
	//         });

	//         await this.actor.removeCondition('panicked');
	//         ChatMessage.create({ speaker: { actor: actor.id }, content: 'Panic is over', type: CONST.CHAT_MESSAGE_TYPES.OTHER });
	//     } else {
	//         await this.actor.removeCondition('panicked');
	//         ChatMessage.create({ speaker: { actor: actor.id }, content: 'Panic is over', type: CONST.CHAT_MESSAGE_TYPES.OTHER });
	//     }
	// }

	_creatureAcidRoll(event) {
		event.preventDefault();
		// const element = event.currentTarget;
		const dataset = event.currentTarget.dataset;
		this.actor.creatureAcidRoll(this.actor, dataset);
	}

	_creatureAttackRoll(event) {
		event.preventDefault();
		// const element = event.currentTarget;
		const dataset = event.currentTarget.dataset;
		this.actor.creatureAttackRoll(this.actor, dataset);
	}

	_creatureManAttackRoll(event) {
		event.preventDefault();
		// const element = event.currentTarget;
		const dataset = event.currentTarget.dataset;
		this.actor.creatureManAttackRoll(this.actor, dataset);
	}

	async _dropCrew(actorId) {
		const crew = game.actors.get(actorId);
		const actorData = this.actor;
		if (!crew) return;
		if (crew.type === 'vehicles' && crew.type === 'spacecraft') return ui.notifications.info('Vehicle inceptions are not allowed!');
		if (crew.type !== 'character' && crew.type !== 'synthetic') return;
		if (actorData.type === 'vehicles') {
			if (actorData.system.crew.passengerQty >= actorData.system.attributes.passengers.value) {
				return ui.notifications.warn(game.i18n.localize('ALIENRPG.fullCrew'));
			}
			return await actorData.addVehicleOccupant(actorId);
		} else if (actorData.type === 'spacecraft') {
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

	async _crewPanic(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const panicActor = game.actors.get(dataset.crewpanic);
		return await this.actor.rollAbility(panicActor, dataset);
	}

	async _crewPanicMod(event) {
		console.log('Crew Panic Mod');
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		const panicActor = game.actors.get(dataset.crewpanic);
		return await this.actor.rollAbilityMod(panicActor, dataset);
	}
}

export default alienrpgActorSheet;
