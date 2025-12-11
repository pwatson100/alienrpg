// import Tor2eCombatantConfig from "./Tor2eCombatantConfig.js";

export default class AlienRPGCTContext extends foundry.applications.sidebar.tabs.CombatTracker {
	_getEntryContextOptions() {
		const getCombatant = (li) => this.viewed.combatants.get(li.dataset.combatantId)
		return [
			{
				name: "COMBAT.CombatantUpdate",
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
				name: "COMBAT.CombatantClear",
				icon: '<i class="fa-solid fa-arrow-rotate-left"></i>',
				condition: (li) => game.user.isGM && Number.isFinite(getCombatant(li)?.initiative),
				callback: (li) => getCombatant(li)?.update({ initiative: null }),
			},
			{
				name: "ALIENRPG.CombatantReroll",
				icon: '<i class="fas fa-dice-d20"></i>',
				callback: (li) => this.viewed.rollInitiative(li.dataset.combatantId),
			},
			{
				name: "COMBAT.CombatantClearMovementHistory",
				icon: '<i class="fa-solid fa-shoe-prints"></i>',
				condition: (li) => game.user.isGM && getCombatant(li)?.token?.movementHistory.length > 0,
				callback: async (li) => {
					const combatant = getCombatant(li)
					if (!combatant) return
					await combatant.clearMovementHistory()
					ui.notifications.info("COMBAT.CombatantMovementHistoryCleared", { format: { name: combatant.token.name } })
				},
			},
			// {
			// 	name: "ALIENRPG.CombatantRemove",
			// 	icon: '<i class="fas fa-skull"></i>',
			// 	// callback: (li) => this.viewed.deleteCombatant(li.data('combatantId')),
			// 	callback: (li) => this.viewed.deleteEmbeddedDocuments("Combatant", [li.dataset.combatantId]),
			// },
			{
				name: "COMBAT.CombatantRemove",
				icon: '<i class="fa-solid fa-trash"></i>',
				condition: () => game.user.isGM,
				callback: (li) => getCombatant(li)?.delete(),
			},
			{
				name: "ALIENRPG.CloneActor",
				icon: '<i class="far fa-copy fa-fw"></i>',
				callback: async (li) => {
					const combatant = this.viewed.combatants.get(li.dataset.combatantId)
					await combatant.clone({}, { save: true })
				},
			},
			{
				name: "ALIENRPG.SwapInitiative",
				icon: '<i class="far fa-copy fa-fw"></i>',
				callback: async (li) => {
					const combatant = this.viewed.combatants.get(li.dataset.combatantId)
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
