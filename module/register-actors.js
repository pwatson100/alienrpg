import alienrpgActorSheet from './actor/actor-sheet.js';
import alienrpgSynthActorSheet from './actor/synth-sheet.js';
import ActorSheetAlienRPGVehicle from './actor/vehicles.js';
import ActorSheetAlienRPGCreat from './actor/creature.js';

function registerActors() {
  Actors.unregisterSheet('core', ActorSheet); // Register Character Sheet

  Actors.registerSheet('alienrpg', alienrpgActorSheet, {
    types: ['character'],
    makeDefault: false,
  });

  Actors.registerSheet('alienrpg', alienrpgSynthActorSheet, {
    types: ['synthetic'],
    makeDefault: false,
  });

  Actors.registerSheet('alienrpg', ActorSheetAlienRPGVehicle, {
    types: ['vehicles'],
    makeDefault: false,
  }); // Register vehicle Sheet

  // console.warn('Reg: Got here');

  Actors.registerSheet('alienrpg', ActorSheetAlienRPGCreat, {
    types: ['creature'],
    makeDefault: false,
  }); // Register vehicle Sheet
}

export default registerActors;
