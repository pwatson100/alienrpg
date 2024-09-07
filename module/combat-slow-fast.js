import { ALIENRPG } from './config.js';

export function addSlowAndFastActions() {
	// CONFIG.statusEffects.push(...ALIENRPG.CombatStatus.slowAndFastActions);

	CONFIG.statusEffects.push({
		id: ALIENRPG.Status_Effects.FAST_ACTION,
		label: 'ALIENRPG.FastAction',
		icon: `systems/alienrpg/images/icons/fast-action.webp`,
		statuses: ['fastAction'],
	});
	CONFIG.statusEffects.push({
		id: ALIENRPG.Status_Effects.SLOW_ACTION,
		label: 'ALIENRPG.SlowAction',
		icon: `systems/alienrpg/images/icons/slow-action.webp`,
		statuses: ['slowAction'],
	});
}
