import { ALIENRPG } from './config.js';

export default class AlienRPGCTContext extends CombatTracker {
	/**
  /** @override */
	async getData(options) {
		const data = await super.getData(options);
		const turns = data.turns.map((turn) => ({
			...turn,
			...AlienRPGCTContext.#setTurnProperties(data, turn),
		}));
		const buttons = await this.#getButtonConfig();
		return {
			...data,
			turns,
			buttons,
			config: YZEC,
		};
	}

	async #getButtonConfig() {
		const { buttons } = await AlienRPGCTContext.#getConfig();

		const sortedButtons = buttons.reduce(
			(acc, button) => {
				const { visibility, ...buttonConfig } = button;

				// Create getters for the button properties.
				if (!CONFIG.Combatant.documentClass.prototype.hasOwnProperty(buttonConfig.property)) {
					Object.defineProperty(CONFIG.Combatant.documentClass.prototype, buttonConfig.property, {
						get() {
							return this.getFlag(alienrpg, buttonConfig.property);
						},
					});
				}

				if (visibility === 'gm') {
					acc.gmButtons.push(buttonConfig);
				} else if (visibility === 'owner') {
					acc.ownerButtons.push(buttonConfig);
				} else {
					acc.commonButtons.push(buttonConfig);
				}
				return acc;
			},
			{
				commonButtons: [],
				gmButtons: [],
				ownerButtons: [],
			}
		);
		return sortedButtons;
	}

	static async #getConfig() {
		const { config } = CONFIG.YZE_COMBAT.CombatTracker;
		if (typeof config === 'object') return config;
		else {
			try {
				const { src } = CONFIG.YZE_COMBAT.CombatTracker;
				const cfg = await foundry.utils.fetchJsonWithTimeout(src);

				if (!cfg.buttons) cfg.buttons = [];
				if (!cfg.controls) cfg.controls = [];

				if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SLOW_AND_FAST_ACTIONS)) {
					cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.slowAndFastActions);
				} else if (game.settings.get(MODULE_ID, SETTINGS_KEYS.SINGLE_ACTION)) {
					cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.singleAction);
				}

				if (game.settings.get(MODULE_ID, SETTINGS_KEYS.RESET_EACH_ROUND)) {
					cfg.buttons.unshift(...YZEC.CombatTracker.DefaultCombatantControls.lockInitiative);
				}

				CONFIG.YZE_COMBAT.CombatTracker.config = cfg;
				return cfg;
			} catch (error) {
				console.error(error);
				throw new Error(`alienrpg: Failed to get combat tracker config`);
			}
		}
	}
	static #setTurnProperties(data, turn) {
		const { id } = turn;
		const combatant = data.combat.combatants.get(id);
		const flags = combatant.flags.alienrpg;
		// FIXME: Figure out why these turn up as flags.
		delete flags.fastAction;
		delete flags.slowAction;
		delete flags.action;
		const statuses =
			combatant.actor?.statuses.reduce((acc, s) => {
				acc[s] = true;
				return acc;
			}, flags) || flags;
		return {
			...statuses,
		};
	}
	/**
	 * Get the sidebar directory entry context options
	 * @return {Object}   The sidebar entry context options
	 * @private
	 */
	static getEntryContextOptions() {
		return [
			{
				name: 'ALIENRPG.CombatantUpdate',
				icon: '<i class="fas fa-edit"></i>',
				callback: this._onConfigureCombatant.bind(this),
			},
			{
				name: 'ALIENRPG.CombatantReroll',
				icon: '<i class="fas fa-dice-d20"></i>',
				callback: (li) => this.viewed.rollInitiative(li.data('combatant-id')),
			},
			{
				name: 'ALIENRPG.CombatantRemove',
				icon: '<i class="fas fa-skull"></i>',
				// callback: (li) => this.viewed.deleteCombatant(li.data('combatant-id')),
				callback: (li) => this.viewed.deleteEmbeddedDocuments('Combatant', [li.data('combatant-id')]),
			},
			{
				name: 'ALIENRPG.CloneActor',
				icon: '<i class="far fa-copy fa-fw"></i>',
				callback: async (li) => {
					const combatant = this.viewed.combatants.get(li.data('combatant-id'));
					await combatant.clone({}, { save: true });
				},
			},
			{
				name: 'ALIENRPG.SwapInitiative',
				icon: '<i class="far fa-copy fa-fw"></i>',
				callback: async (li) => {
					const combatant = this.viewed.combatants.get(li.data('combatant-id'));
					const donerInit = combatant.initiative;
					const combatants = game.combat.combatants;
					const template = `systems/alienrpg/templates/dialog/switch-initiative.html`;
					await _swapInitiative(combatant, donerInit, combatants, template);
				},
			},
		];

		async function _swapInitiative(combatant, donerInit, combatants, template) {
			let confirmed = false;
			let myTitle = game.i18n.localize('ALIENRPG.SwapInitiative') + ' ' + game.i18n.localize('ALIENRPG.ROLLFOR') + ' ' + `${combatant.name}`;
			const content = await renderTemplate(template, {
				combatants: combatants
					.filter((c) => c.initiative && c.id !== combatant.id && (c.actor.type === 'character' || c.actor.type === 'synthetic') && !c.actor.system.header.npc)
					.sort((a, b) => {
						return a.initiative - b.initiative;
					}),
			}).then((dlg) => {
				new Dialog({
					title: myTitle,
					content: dlg,
					buttons: {
						one: {
							icon: '<i class="fas fa-check"></i>',
							label: 'OK',
							callback: () => (confirmed = true),
						},
						four: {
							icon: '<i class="fas fa-times"></i>',
							label: game.i18n.localize('ALIENRPG.DialCancel'),
							callback: () => (confirmed = false),
						},
					},
					close: (html) => {
						if (confirmed) {
							let targetId = html.find('#initiative-swap')[0]?.value;
							const targetActor = combatants.get(targetId);
							const targetInit = targetActor.initiative;
							const updates = [
								{
									_id: combatant.id,
									initiative: targetInit,
								},
								{
									_id: targetId,
									initiative: donerInit,
								},
							];
							return game.combat.updateEmbeddedDocuments('Combatant', updates);
						}
					},
				}).render(true);
			});
		}
	}

	/* ------------------------------------------ */

	// Calls the CombatTracker hook with the given event data.
	static #callHook(data) {
		data.emit = (options) =>
			game.socket.emit(`system.alienrpg`, {
				data,
				options,
			});
		Hooks.call(`alienrpg.${data.event}`, data);
	}

	// /* ------------------------------------------ */

	// /* -------------------------------------------- */
	// /** @override */
	async _onCombatantControl(event) {
		await super._onCombatantControl(event);
		const btn = event.currentTarget;
		const li = btn.closest('.combatant');
		const combat = this.viewed;
		const combatant = combat.combatants.get(li.dataset.combatantId);
		const eventName = btn.dataset.event;
		const property = btn.dataset.property;
		const eventData = {
			combat,
			combatant,
			property,
			event: eventName,
			origin: btn,
		};
		if (property === 'slowAction' || property === 'fastAction') {
			const effect = CONFIG.statusEffects.find((e) => e.id === property);
			const active = !combatant[property];
			if (!active) await combatant.unsetFlag(alienrpg, property);
			await combatant.token.toggleActiveEffect({ ...effect }, { active });
		} else if (property) {
			await combatant.setFlag(alienrpg, property, !combatant.getFlag(alienrpg, property));
		}

		{
			CombatTracker.#callHook(eventData);
		}
	}
}
