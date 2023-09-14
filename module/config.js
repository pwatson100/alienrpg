// Namespace Alien Configuration Values
export const ALIENRPG = {};

/**
 * The set of ability scores used with the system
 * @type {Object}
 */
ALIENRPG.attributes = {
  str: 'ALIENRPG.AbilityStr',
  wit: 'ALIENRPG.AbilityWit',
  agl: 'ALIENRPG.AbilityAgl',
  emp: 'ALIENRPG.AbilityEmp',
};
ALIENRPG.creatureattributes = {
  speed: 'ALIENRPG.Speed',
  mobility: 'ALIENRPG.Skillmobility',
  observation: 'ALIENRPG.Skillobservation',
};
ALIENRPG.creaturedefence = {
  armorrating: 'ALIENRPG.ArmorRating',
  armorvfire: 'ALIENRPG.ArmorVsFire',
  acidSplash: 'ALIENRPG.SkillAcidSplash',
};
ALIENRPG.vehicleattributes = {
  hull: 'ALIENRPG.Hull',
  speed: 'ALIENRPG.Speed',
  armorrating: 'ALIENRPG.ArmorRating',
  manoeuvrability: 'ALIENRPG.Manoeuvrability',
};
ALIENRPG.spacecraftattributes = {
  crew: 'ALIENRPG.CREW',
  passengers: 'ALIENRPG.PASSENGERS',
  ftlrating: 'ALIENRPG.FTL-RATING',
  signature: 'ALIENRPG.SIGNATURE',
  thrusters: 'ALIENRPG.THRUSTERS',
  hull: 'ALIENRPG.HULL',
  armor: 'ALIENRPG.SHIP-ARMOR',
};
ALIENRPG.skills = {
  heavyMach: 'ALIENRPG.SkillheavyMach',
  closeCbt: 'ALIENRPG.SkillcloseCbt',
  stamina: 'ALIENRPG.Skillstamina',
  rangedCbt: 'ALIENRPG.SkillrangedCbt',
  mobility: 'ALIENRPG.Skillmobility',
  piloting: 'ALIENRPG.Skillpiloting',
  command: 'ALIENRPG.Skillcommand',
  manipulation: 'ALIENRPG.Skillmanipulation',
  medicalAid: 'ALIENRPG.SkillmedicalAid',
  observation: 'ALIENRPG.Skillobservation',
  survival: 'ALIENRPG.Skillsurvival',
  comtech: 'ALIENRPG.Skillcomtech',
};
ALIENRPG.general = {
  career: 'ALIENRPG.Career',
  appearance: 'ALIENRPG.Apparance',
  sigItem: 'ALIENRPG.SignatureItem',
};
ALIENRPG.physicalItems = [];
// ALIENRPG.physicalItems = ['item', 'weapon', 'armor', 'talent', 'planet-system', 'agenda', 'specialty', 'critical-injury'];

ALIENRPG.conditionEffects = [
  {
    id: 'starving',
    name: 'ALIENRPG.Starving',
    label: 'ALIENRPG.Starving',
    icon: 'systems/alienrpg/images/starving.webp',
  },
  {
    id: 'dehydrated',
    name: 'ALIENRPG.Dehydrated',
    label: 'ALIENRPG.Dehydrated',
    icon: 'systems/alienrpg/images/water-flask.webp',
  },
  {
    id: 'exhausted',
    name: 'ALIENRPG.Exhausted',
    label: 'ALIENRPG.Exhausted',
    icon: 'systems/alienrpg/images/exhausted.webp',
  },
  {
    id: 'freezing',
    name: 'ALIENRPG.Freezing',
    label: 'ALIENRPG.Freezing',
    icon: 'systems/alienrpg/images/frozen.webp',
  },
  {
    id: 'encumbered',
    name: 'ALIENRPG.Encumbered',
    label: 'ALIENRPG.Encumbered',
    icon: 'systems/alienrpg/images/weight.webp',
  },
  {
    id: 'panicked',
    name: 'ALIENRPG.Panicked',
    label: 'ALIENRPG.Panicked',
    icon: 'icons/svg/terror.svg',
  },
  {
    id: 'overwatch',
    name: 'ALIENRPG.Overwatch',
    label: 'ALIENRPG.Overwatch',
    icon: 'systems/alienrpg/images/eye-target.webp',
  },
  {
    id: 'radiation',
    name: 'ALIENRPG.Radiation',
    label: 'ALIENRPG.Radiation',
    icon: 'icons/svg/radiation.svg',
  },
  {
    id: 'criticalinj',
    name: 'ALIENRPG.CriticalInjuries',
    label: 'ALIENRPG.CriticalInjuries',
    icon: 'icons/skills/wounds/injury-pain-body-orange.webp',
  },
  {
    id: 'shipminor',
    name: 'ALIENRPG.MINOR-COMPONENT-DAMAGE',
    label: 'ALIENRPG.MINOR-COMPONENT-DAMAGE',
    icon: 'systems/alienrpg/images/lightning-spanner.webp',
  },
  {
    id: 'shipmajor',
    name: 'ALIENRPG.MAJOR-COMPONENT-DAMAGE',
    label: 'ALIENRPG.MAJOR-COMPONENT-DAMAGE',
    icon: 'systems/alienrpg/images/cogsplosion.webp',
  },
];

ALIENRPG.vehicle = {
  crewPositionFlags: ['COMMANDER', 'PILOT', 'GUNNER', 'PASSENGER'],
  crewPositionFlagsLocalized: {
    COMMANDER: 'ALIENRPG.CrewCommander',
    PILOT: 'ALIENRPG.CrewPilot',
    GUNNER: 'ALIENRPG.CrewGunner',
    PASSENGER: 'ALIENRPG.CrewPasanger',
  },
};
ALIENRPG.spacecraft = {
  crewPositionFlags: ['CAPTAIN', 'PILOT', 'GUNNER', 'ENGINEER', 'SENSOROP', 'PASSENGER'],
  crewPositionFlagsLocalized: {
    CAPTAIN: 'ALIENRPG.CAPTAIN',
    PILOT: 'ALIENRPG.CrewPilot',
    GUNNER: 'ALIENRPG.CrewGunner',
    SENSOROP: 'ALIENRPG.SENSOR-OP',
    ENGINEER: 'ALIENRPG.ENGINEER',
    PASSENGER: 'ALIENRPG.CrewPasanger',
  },
};

ALIENRPG.Icons = {
  buttons: {
    edit: '<i class="fas fa-edit"></i>',
    delete: '<i class="fas fa-trash"></i>',
    remove: '<i class="fas fa-times"></i>',
  },
};

