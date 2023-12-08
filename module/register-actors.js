import alienrpgActorSheet from './actor/actor-sheet.js';
import alienrpgSpacecraftSheet from './actor/spacecraft-sheet.js';
import alienrpgPlanetSheet from './actor/planet-sheet.js';
import alienrpgColonySheet from './actor/colony-sheet.js';

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

	Actors.registerSheet('alienrpg', alienrpgColonySheet, {
		types: ['colony'],
		makeDefault: true,
	}); // Register Colony Sheet
}

export default registerActors;
