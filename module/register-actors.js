import alienrpgActorSheet from './actor/actor-sheet.js';
import alienrpgSpacecraftSheet from './actor/spacecraft-sheet.js';
import alienrpgPlanetSheet from './actor/planet-sheet.js';

function registerActors() {
	Actors.unregisterSheet('core', ActorSheet); // Register Character Sheet

	Actors.registerSheet('alienrpg', alienrpgActorSheet, {
		types: ['character', 'creature', 'synthetic', 'territory', 'vehicles'],
		makeDefault: true,
	});

	Actors.registerSheet('alienrpg', alienrpgSpacecraftSheet, {
		types: ['spacecraft'],
		makeDefault: true,
	}); // Register Spacecraft Sheet

	Actors.registerSheet('alienrpg', alienrpgPlanetSheet, {
		types: ['planet'],
		makeDefault: true,
	}); // Register Planet Sheet
}

export default registerActors;
