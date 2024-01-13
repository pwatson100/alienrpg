export default class AlienRPGCTContext extends CombatTracker {
	/**
	 * Default folder context actions
	 * @param html {jQuery}
	 * @private
	 */
	/* -------------------------------------------- */

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

	/* -------------------------------------------- */
}
