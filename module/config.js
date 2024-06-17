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
		icon: 'systems/alienrpg/images/freezing.webp',
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
		icon: 'systems/alienrpg/images/panic.webp',
	},
	{
		id: 'overwatch',
		name: 'ALIENRPG.Overwatch',
		label: 'ALIENRPG.Overwatch',
		icon: 'systems/alienrpg/images/overwatch.webp',
	},
	{
		id: 'radiation',
		name: 'ALIENRPG.Radiation',
		label: 'ALIENRPG.Radiation',
		icon: 'systems/alienrpg/images/radiation.webp',
	},
	{
		id: 'hypoxia',
		name: 'ALIENRPG.hypoxia',
		label: 'ALIENRPG.hypoxia',
		icon: 'systems/alienrpg/images/hypoxia.webp',
	},
	{
		id: 'heatstroke',
		name: 'ALIENRPG.heatstroke',
		label: 'ALIENRPG.heatstroke',
		icon: 'systems/alienrpg/images/heatstroke.webp',
	},
	{
		id: 'gravitydyspraxia',
		name: 'ALIENRPG.gravitydyspraxia',
		label: 'ALIENRPG.gravitydyspraxia',
		icon: 'systems/alienrpg/images/gravitydyspraxia.webp',
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
	crewPositionFlags: ['CAPTAIN', 'SENSOROP', 'PILOT', 'GUNNER', 'ENGINEER', 'PASSENGER'],
	crewPositionFlagsLocalized: {
		CAPTAIN: 'ALIENRPG.CAPTAIN',
		SENSOROP: 'ALIENRPG.SENSOR-OP',
		PILOT: 'ALIENRPG.CrewPilot',
		GUNNER: 'ALIENRPG.CrewGunner',
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

ALIENRPG.career_list = {
	1: { id: 1, label: 'ALIENRPG.ColonialMarine' },
	2: { id: 2, label: 'ALIENRPG.ColonialMarshal' },
	3: { id: 3, label: 'ALIENRPG.CompanyAgent' },
	4: { id: 4, label: 'ALIENRPG.Kid' },
	5: { id: 5, label: 'ALIENRPG.Medic' },
	6: { id: 6, label: 'ALIENRPG.Mercenary' },
	7: { id: 7, label: 'ALIENRPG.Officer' },
	8: { id: 8, label: 'ALIENRPG.Pilot' },
	9: { id: 9, label: 'ALIENRPG.Roughneck' },
	10: { id: 10, label: 'ALIENRPG.Scientist' },
	13: { id: 13, label: 'ALIENRPG.Wildcatter' },
	14: { id: 14, label: 'ALIENRPG.Entertainer' },
	11: { id: 11, label: 'ALIENRPG.Synthetic' },
	12: { id: 12, label: 'ALIENRPG.Homebrew' },
};

ALIENRPG.sensor_list = {
	1: { key: 'ALIENRPG.targetLock', label: 'ALIENRPG.targetLock' },
	2: { key: 'ALIENRPG.goDark', label: 'ALIENRPG.goDark' },
	3: { key: 'ALIENRPG.powerUpSensors', label: 'ALIENRPG.powerUpSensors' },
};

ALIENRPG.pilot_list = {
	1: { key: 'ALIENRPG.accelerate', label: 'ALIENRPG.accelerate' },
	2: { key: 'ALIENRPG.decelerate', label: 'ALIENRPG.decelerate' },
	3: { key: 'ALIENRPG.maneuver', label: 'ALIENRPG.maneuver' },
	4: { key: 'ALIENRPG.ram', label: 'ALIENRPG.ram' },
	5: { key: 'ALIENRPG.dock', label: 'ALIENRPG.dock' },
};

ALIENRPG.gunner_list = {
	1: { key: 'ALIENRPG.fireWeapon', label: 'ALIENRPG.fireWeapon' },
	2: { key: 'ALIENRPG.launchCounter', label: 'ALIENRPG.launchCounter' },
};

ALIENRPG.engineer_list = {
	1: { key: 'ALIENRPG.emergencyRepairs', label: 'ALIENRPG.emergencyRepairs' },
	2: { key: 'ALIENRPG.powerUpEngine', label: 'ALIENRPG.powerUpEngine' },
	3: { key: 'ALIENRPG.openAirlock', label: 'ALIENRPG.openAirlock' },
	4: { key: 'ALIENRPG.reactorOverload', label: 'ALIENRPG.reactorOverload' },
};

ALIENRPG.weapon_range_list = {
	1: { id: 1, label: 'ALIENRPG.Engaged' },
	2: { id: 2, label: 'ALIENRPG.Short' },
	3: { id: 3, label: 'ALIENRPG.Medium' },
	4: { id: 4, label: 'ALIENRPG.Long' },
	5: { id: 5, label: 'ALIENRPG.Extreme' },
};

ALIENRPG.weapon_type_list = {
	// 0: { id: 0, label: 'ALIENRPG.None' },
	1: { id: 1, label: 'ALIENRPG.WepTypeRanged' },
	2: { id: 2, label: 'ALIENRPG.WepTypeMelee' },
};

ALIENRPG.skills_list = {
	1: { key: 'Heavy Machinery', label: 'ALIENRPG.SkillheavyMach' },
	2: { key: 'Close Combat', label: 'ALIENRPG.SkillcloseCbt' },
	3: { key: 'Stamina', label: 'ALIENRPG.Skillstamina' },
	4: { key: 'Ranged Combat', label: 'ALIENRPG.SkillrangedCbt' },
	5: { key: 'Mobility', label: 'ALIENRPG.Skillmobility' },
	6: { key: 'Piloting', label: 'ALIENRPG.Skillpiloting' },
	7: { key: 'Command', label: 'ALIENRPG.Skillcommand' },
	8: { key: 'Manipulation', label: 'ALIENRPG.Skillmanipulation' },
	9: { key: 'Medical Aid', label: 'ALIENRPG.SkillmedicalAid' },
	10: { key: 'Observation', label: 'ALIENRPG.Skillobservation' },
	11: { key: 'Survival', label: 'ALIENRPG.Skillsurvival' },
	12: { key: 'Comtech', label: 'ALIENRPG.Skillcomtech' },
};

ALIENRPG.ship_weapon_type_list = {
	1: { id: 1, label: 'ALIENRPG.Offensive' },
	2: { id: 2, label: 'ALIENRPG.Defensive' },
};
ALIENRPG.ship_weapon_range_list = {
	6: { key: 6, label: 'ALIENRPG.Contact' },
	2: { key: 2, label: 'ALIENRPG.Short' },
	3: { key: 3, label: 'ALIENRPG.Medium' },
	4: { key: 4, label: 'ALIENRPG.Long' },
	5: { key: 5, label: 'ALIENRPG.Extreme' },
	7: { key: 7, label: 'ALIENRPG.Surface' },
};

ALIENRPG.ship_hardpoint_list = {
	1: { key: 'I', label: 'ALIENRPG.Size1' },
	2: { key: 'II', label: 'ALIENRPG.Size2' },
	3: { key: 'III', label: 'ALIENRPG.Size3' },
};

ALIENRPG.ship_attributes_list = {
	1: { key: 'I', label: 'I' },
	2: { key: 'II', label: 'II' },
	3: { key: 'III', label: 'III' },
	4: { key: 'IV', label: 'IV' },
	5: { key: 'V', label: 'V' },
	6: { key: 'ALIENRPG.upgrade', label: 'ALIENRPG.upgrade' },
};

ALIENRPG.crit_list = {
	0: { id: 0, label: 'ALIENRPG.MINOR-COMPONENT-DAMAGE' },
	1: { id: 1, label: 'ALIENRPG.MAJOR-COMPONENT-DAMAGE' },
};

ALIENRPG.item_types_list = {
	1: { id: 1, label: 'ALIENRPG.DataStorage' },
	2: { id: 2, label: 'ALIENRPG.DiagnosticsDisplay' },
	3: { id: 3, label: 'ALIENRPG.VisionDevices' },
	4: { id: 4, label: 'ALIENRPG.Tools' },
	5: { id: 5, label: 'ALIENRPG.MedicalSupplies' },
	6: { id: 6, label: 'ALIENRPG.Pharmaceuticals' },
	7: { id: 7, label: 'ALIENRPG.FoodDrink' },
	8: { id: 8, label: 'ALIENRPG.Power' },
	9: { id: 9, label: 'ALIENRPG.ComputerMainframes' },
	10: { id: 10, label: 'ALIENRPG.Consumables' },
	11: { id: 11, label: 'ALIENRPG.Clothing' },
};

ALIENRPG.crit_timelimit_list = {
	0: { id: 0, label: 'ALIENRPG.None' },
	1: { id: 1, label: 'ALIENRPG.OneRound' },
	2: { id: 2, label: 'ALIENRPG.OneTurn' },
	3: { id: 3, label: 'ALIENRPG.OneShift' },
	4: { id: 4, label: 'ALIENRPG.OneDay' },
};

ALIENRPG.colony_policy_list = {
	1: { id: 1, label: 'ALIENRPG.Policies' },
	2: { id: 2, label: 'ALIENRPG.Installations' },
	3: { id: 3, label: 'ALIENRPG.Projects' },
};
