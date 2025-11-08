import { ALIENRPG } from "./helpers/config.js"

export default class AlienRPGCTContext extends foundry.applications.sidebar.tabs.CombatTracker {
	/**
	 * Get the sidebar directory entry context options
	 * @return {Object}   The sidebar entry context options
	 * @private
	 */
	static getEntryContextOptions() {
		const getCombatant = (li) => AlienRPGCTContext.viewed.combatants.get(li.dataset.combatantId)
		return [
			{
				name: "ALIENRPG.CombatantUpdate",
				icon: '<i class="fa-solid fa-pen-to-square"></i>',
				condition: () => game.user.isGM,
				callback: (li) =>
					getCombatant(li)?.sheet.render({
						force: true,
						position: {
							top: Math.min(li.offsetTop, window.innerHeight - 350),
							left: window.innerWidth - 720,
						},
					}),
			},
			{
				name: "ALIENRPG.CombatantReroll",
				icon: '<i class="fas fa-dice-d20"></i>',
				callback: (li) => AlienRPGCTContext.viewed.rollInitiative(li.dataset.combatantId),
			},
			{
				name: "ALIENRPG.CombatantRemove",
				icon: '<i class="fas fa-skull"></i>',
				// callback: (li) => this.viewed.deleteCombatant(li.data('combatantId')),
				callback: (li) => AlienRPGCTContext.viewed.deleteEmbeddedDocuments("Combatant", [li.dataset.combatantId]),
			},
			{
				name: "ALIENRPG.CloneActor",
				icon: '<i class="far fa-copy fa-fw"></i>',
				callback: async (li) => {
					const combatant = AlienRPGCTContext.viewed.combatants.get(li.dataset.combatantId)
					await combatant.clone({}, { save: true })
				},
			},
			{
				name: "ALIENRPG.SwapInitiative",
				icon: '<i class="far fa-copy fa-fw"></i>',
				callback: async (li) => {
					const combatant = AlienRPGCTContext.viewed.combatants.get(li.dataset.combatantId)
					const donerInit = combatant.initiative
					const combatants = game.combat.combatants
					const template = "systems/alienrpg/templates/dialog/switch-initiative.html"
					await _swapInitiative(combatant, donerInit, combatants, template)
				},
			},
		]

		async function _swapInitiative(combatant, donerInit, combatants, template) {
			let confirmed = false
			const myTitle =
				game.i18n.localize("ALIENRPG.SwapInitiative") +
				" " +
				game.i18n.localize("ALIENRPG.ROLLFOR") +
				" " +
				`${combatant.name}`
			const content = await foundry.applications.handlebars
				.renderTemplate(template, {
					combatants: combatants
						.filter(
							(c) =>
								c.initiative &&
								c.id !== combatant.id &&
								(c.actor.type === "character" || c.actor.type === "synthetic") &&
								!c.actor.system.header.npc,
						)
						.sort((a, b) => {
							return a.initiative - b.initiative
						}),
				})
				.then((dlg) => {
					new Dialog({
						title: myTitle,
						content: dlg,
						buttons: {
							one: {
								icon: '<i class="fas fa-check"></i>',
								label: "OK",
								callback: () => (confirmed = true),
							},
							four: {
								icon: '<i class="fas fa-times"></i>',
								label: game.i18n.localize("ALIENRPG.DialCancel"),
								callback: () => (confirmed = false),
							},
						},
						close: (html) => {
							if (confirmed) {
								const targetId = html.find("#initiative-swap")[0]?.value
								const targetActor = combatants.get(targetId)
								const targetInit = targetActor.initiative
								const updates = [
									{
										_id: combatant.id,
										initiative: targetInit,
									},
									{
										_id: targetId,
										initiative: donerInit,
									},
								]
								return game.combat.updateEmbeddedDocuments("Combatant", updates)
							}
						},
					}).render(true)
				})
		}
	}
}
