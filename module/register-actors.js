import alienrpgActorSheet from './actor/actor-sheet.js';
// import alienrpgSynthActorSheet from './actor/actor-sheet.js';
// import alienrpgSynthActorSheet from './actor/synth-sheet.js';
// import ActorSheetAlienRPGVehicle from './actor/actor-sheet.js';
// import ActorSheetAlienRPGCreat from './actor/actor-sheet.js';
// import ActorSheetAlienRPGTerritory from './actor/actor-sheet.js';
import alienrpgSpacecraftSheet from './actor/spacecraft-sheet.js';

function registerActors() {
  Actors.unregisterSheet('core', ActorSheet); // Register Character Sheet

  Actors.registerSheet('alienrpg', alienrpgActorSheet, {
    types: ['character', 'creature', 'synthetic', 'territory', 'vehicles'],
    makeDefault: true,
  });

  //   Actors.registerSheet('alienrpg', alienrpgActorSheet, {
  //     types: ['character'],
  //     makeDefault: true,
  //   });

  //   Actors.registerSheet('alienrpg', alienrpgSynthActorSheet, {
  //     types: ['synthetic'],
  //     makeDefault: true,
  //   });

  // Actors.registerSheet('alienrpg', ActorSheetAlienRPGVehicle, {
  //   types: ['vehicles'],
  //   makeDefault: true,
  // }); // Register vehicle Sheet

  Actors.registerSheet('alienrpg', alienrpgSpacecraftSheet, {
    types: ['spacecraft'],
    makeDefault: true,
  }); // Register Spacecraft Sheet

  // console.warn('Reg: Got here');

  // Actors.registerSheet('alienrpg', ActorSheetAlienRPGCreat, {
  //   types: ['creature'],
  //   makeDefault: true,
  // }); // Register vehicle Sheet

  // Actors.registerSheet('alienrpg', ActorSheetAlienRPGTerritory, {
  //   types: ['territory'],
  //   makeDefault: true,
  // }); // Register Territory Sheet
}

export default registerActors;
