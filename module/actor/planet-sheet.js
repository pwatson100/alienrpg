import { ALIENRPG } from '../config.js';
import { logger } from '../logger.js';
/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class alienrpgPlanetSheet extends ActorSheet {
	constructor(...args) {
		super(...args);

		/**
		 * Track the set of item filters which are applied
		 * @type {Set}
		 */
		// this._filters = {
		//   inventory: new Set(),
		// };
	}

	/** @override */
	static get defaultOptions() {
		return foundry.utils.mergeObject(super.defaultOptions, {
			classes: ['alienrpg', 'sheet', 'actor', 'planet-sheet'],
			template: 'systems/alienrpg/templates/actor/planet-sheet.html',
			width: 1120,
			height: 900,
			tabs: [{ navSelector: '.sheet-tabs', contentSelector: '.sheet-body', initial: 'general' }],
		});
	}

	// get template() {
	// 	const path = 'systems/alienrpg/templates/actor/';
	// 	// return `${path}actor-sheet.html`;
	// 	// unique item sheet by type, like `weapon-sheet.html`.
	// 	// if (game.settings.get('alienrpg', 'aliencrt')) {
	// 	// 	return `systems/alienrpg/templates/actor/crt/${this.actor.type}-sheet.html`;
	// 	// } else {
	// 	return `${path}${this.actor.type}-sheet.html`;
	// 	// }
	// }

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

		let enrichedFields = ['system.notes'];
		await this._enrichTextFields(data, enrichedFields);

		logger.debug('Actor Sheet derived data:', data);
		//Return data to the sheet
		return data;
	}

	_findActiveList() {
		return this.element.find('.tab.active .directory-list');
	}
}
export default alienrpgPlanetSheet;
