import { ALIENRPG } from './config.js';

export function addSlowAndFastActions() {
	CONFIG.statusEffects.push(...ALIENRPG.StatusEffects.slowAndFastActions);
}
