import { logger } from '../logger.js';

/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class alienrpgItemSheet extends ItemSheet {
	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['alienrpg', 'sheet', 'item', 'item-sheet'],
			width: 675,
			// height: 489 + 'max-content',
			// height: 566 - 'max-content',
			height: 536,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
		});
	}

	/** @override */
	get template() {
		const path = 'systems/alienrpg/templates/item';
		// Return a single sheet for all item types.
		// return `${path}/item-sheet.html`;
		// Alternatively, you could use the following return statement to do a
		// unique item sheet by type, like `weapon-sheet.html`.
		return `${path}/${this.item.type}-sheet.html`;
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
	async getData() {
		const data = await super.getData();
		// const item = data.item.toJSON();
		const item = foundry.utils.deepClone(this.item);
		// console.log(data);
		switch (item.type) {
			case 'planet-system':
				this._prepareSystemData(item);
				break;
			case 'critical-injury':
				let enrichedFields1 = ['system.attributes.effects'];
				await this._enrichTextFields(item, enrichedFields1);
				item.crit_timelimit_list = CONFIG.ALIENRPG.crit_timelimit_list;
				break;
			case 'spacecraft-crit':
				await this._prepareShipCritData(item);
				break;
			case 'agenda':
				await this._prepareAgendaData(item);
				break;
			case 'specialty':
				await this._prepareSpecialtyData(item);
				break;
			case 'skill-stunts':
				let enrichedFields5 = ['system.description'];
				await this._enrichTextFields(item, enrichedFields5);
				item.skills_list = CONFIG.ALIENRPG.skills_list;

				break;
			case 'talent':
				await this._prepareTalentData(item);
				break;
			case 'colony-initiative':
				await this._prepareColonyInitiativeData(item);
				break;

			default:
				// item, weapon, armor
				let enrichedFieldsDef = ['system.notes.notes', 'system.general.comment.value', 'system.attributes.comment.value'];
				await this._enrichTextFields(item, enrichedFieldsDef);
				item.weapon_type_list = CONFIG.ALIENRPG.weapon_type_list;
				item.weapon_range_list = CONFIG.ALIENRPG.weapon_range_list;
				item.ship_weapon_type_list = CONFIG.ALIENRPG.ship_weapon_type_list;
				item.ship_weapon_range_list = CONFIG.ALIENRPG.ship_weapon_range_list;
				item.ship_hardpoint_list = CONFIG.ALIENRPG.ship_hardpoint_list;
				item.ship_attributes_list = CONFIG.ALIENRPG.ship_attributes_list;
				item.item_types_list = CONFIG.ALIENRPG.item_types_list;

				break;
		}
		logger.debug('Item Sheet derived data:', item);
		return item;
	}

	async _prepareSystemData(data) {
		this.item.update({ img: 'systems/alienrpg/images/icons/solar-system.webp' });
		let enrichedFields = ['system.misc.comment.value'];
		await this._enrichTextFields(data, enrichedFields);
	}

	async _prepareAgendaData(data) {
		let enrichedFields2 = ['system.general.comment.value'];
		await this._enrichTextFields(data, enrichedFields2);

		if (this.item.img == 'icons/svg/item-bag.svg' && this.item.img != this.img) {
			this.item.update({ img: 'systems/alienrpg/images/icons/personal-agenda.png' });
		}
	}

	async _prepareSpecialtyData(data) {
		let enrichedFields4 = ['system.general.comment.value'];
		await this._enrichTextFields(data, enrichedFields4);
		this.item.update({ img: 'systems/alienrpg/images/icons/cover-notext.png' });
	}

	async _prepareTalentData(data) {
		if (data.system.general.career.value === '1' || data.system.general.career.value === '') {
			this.item.update({ img: 'systems/alienrpg/images/icons/sprint.webp' });
		} else {
			this.item.update({ img: 'systems/alienrpg/images/icons/fire-dash.webp' });
		}

		let enrichedFields6 = ['system.notes.notes', 'system.general.comment.value'];
		await this._enrichTextFields(data, enrichedFields6);
		data.career_list = CONFIG.ALIENRPG.career_list;
	}

	async _prepareShipCritData(data) {
		if (data.system.header.type.value === '1') {
			this.item.update({ img: 'systems/alienrpg/images/icons/auto-repair.webp' });
		} else if (data.system.header.type.value === '0') {
			this.item.update({ img: 'systems/alienrpg/images/icons/spanner.webp' });
		}

		let enrichedFields6 = ['system.header.effects'];
		await this._enrichTextFields(data, enrichedFields6);
		data.crit_list = CONFIG.ALIENRPG.crit_list;
	}

	async _prepareColonyInitiativeData(item) {
		switch (item.system.header.type) {
			case '1':
				item.update({ img: 'systems/alienrpg/images/icons/full-folder.webp' });
				break;
			case '2':
				item.update({ img: 'systems/alienrpg/images/icons/habitat-dome.webp' });
				break;
			case '3':
				item.update({ img: 'systems/alienrpg/images/icons/diagram.webp' });
				break;

			default:
				break;
		}
		let enrichedFields6 = ['system.notes', 'system.header.comment'];
		await this._enrichTextFields(item, enrichedFields6);
		item.colony_policy_list = CONFIG.ALIENRPG.colony_policy_list;
	}

	/* -------------------------------------------- */

	/** @override */
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
		if (game.settings.get('alienrpg', 'switchMouseKeys')) {
			// Right to Roll and left to mod
			// Rollable abilities.
			html.find('.rollcomputer').contextmenu(this._onRollComputer.bind(this));

			html.find('.rollcomputer').click(this._onRollComputerMod.bind(this));
		} else {
			// Left to Roll and Right toMod
			// Rollable abilities.
			html.find('.rollcomputer').click(this._onRollComputer.bind(this));

			html.find('.rollcomputer').contextmenu(this._onRollComputerMod.bind(this));
		}
		// Roll handlers, click handlers, etc. would go here.
		html.find('.currency').on('change', this._currencyField.bind(this));
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
			let value = e.target.value;
			if (game.settings.get('alienrpg', 'dollar'))
				e.target.value = value ? Intl.NumberFormat('en-EN', { style: 'currency', currency: 'USD' }).format(value) : '$0.00';
			else
				e.target.value = value
					? Intl.NumberFormat('en-EN', { style: 'decimal', useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
					: '0.00';
			// console.warn(e.target.value);
		}
	}
	_onRoll(event) {
		event.preventDefault();
		const dataset = event.currentTarget.dataset;
		this.item.roll(this.item, dataset);
	}
	_onRollComputer(event) {
		event.preventDefault();
		const dataset = event.currentTarget;
		this.item.rollComputer(this.item, dataset);
	}

	_onRollComputerMod(event) {
		event.preventDefault();
		const element = event.currentTarget;
		const dataset = element.dataset;
		this.item.rollComputerMod(this.item, dataset);
	}
}
