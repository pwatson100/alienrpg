import alienrpgActorSheet from './actor/actor-sheet.js';
import alienrpgSpacecraftSheet from './actor/spacecraft-sheet.js';
import alienrpgPlanetSheet from './actor/planet-sheet.js';
import alienrpgColonySheet from './actor/colony-sheet.js';

function registerActors() {
	foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet); // Register Character Sheet

	foundry.documents.collections.Actors.registerSheet('alienrpg', alienrpgActorSheet, {
		types: ['character', 'creature', 'synthetic', 'territory', 'vehicles'],
		makeDefault: true,
	});

	foundry.documents.collections.Actors.registerSheet('alienrpg', alienrpgSpacecraftSheet, {
		types: ['spacecraft'],
		makeDefault: true,
	}); // Register Spacecraft Sheet

	foundry.documents.collections.Actors.registerSheet('alienrpg', alienrpgPlanetSheet, {
		types: ['planet'],
		makeDefault: true,
	}); // Register Planet Sheet

	foundry.documents.collections.Actors.registerSheet('alienrpg', alienrpgColonySheet, {
		types: ['colony'],
		makeDefault: true,
	}); // Register Colony Sheet
}

export default registerActors;
