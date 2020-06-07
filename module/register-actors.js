import alienrpgActorSheet from './actor/actor-sheet.js';
import ActorSheetAlienRPGVehicle from './actor/vehicles.js';

function registerActors() {
  Actors.unregisterSheet('core', ActorSheet); // Register Character Sheet

  Actors.registerSheet('alienrpg', alienrpgActorSheet, {
    types: ['character'],
    makeDefault: false,
  });

  Actors.registerSheet('alienrpg', ActorSheetAlienRPGVehicle, {
    types: ['vehicles'],
    makeDefault: false,
  }); // Register vehicle Sheet
}

export default registerActors;
