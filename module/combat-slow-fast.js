import { ALIENRPG } from "./helpers/config.js"

export function addSlowAndFastActions() {
	CONFIG.statusEffects.push(...ALIENRPG.StatusEffects.slowAndFastActions)
}
