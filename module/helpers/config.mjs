export const ALIENRPG = {}

/**
 * The set of Ability Scores used within the system.
 * @type {Object}
 */

ALIENRPG.attributes = {
	str: "ALIENRPG.AbilityStr",
	wit: "ALIENRPG.AbilityWit",
	agl: "ALIENRPG.AbilityAgl",
	emp: "ALIENRPG.AbilityEmp",
}
ALIENRPG.modifiers = {
	str: "ALIENRPG.AbilityStr",
	wit: "ALIENRPG.AbilityWit",
	agl: "ALIENRPG.AbilityAgl",
	emp: "ALIENRPG.AbilityEmp",
	health: "ALIENRPG.Health",
	stress: "ALIENRPG.Stress",
}
ALIENRPG.creatureattributes = {
	speed: "ALIENRPG.Speed",
	armorrating: "ALIENRPG.ArmorRating",
	armorvfire: "ALIENRPG.ArmorVsFire",
}
ALIENRPG.creaturedefence = {
	mobility: "ALIENRPG.Skillmobility",
	observation: "ALIENRPG.Skillobservation",
	acidSplash: "ALIENRPG.SkillAcidSplash",
	special: "ALIENRPG.Special",
}
ALIENRPG.vehicleattributes = {
	weight: "ALIENRPG.Weight",
	cost: "ALIENRPG.cost",
	armorrating: "ALIENRPG.ArmorRating",
	hull: "ALIENRPG.Hull",
	passengers: "ALIENRPG.PASSENGERS",
	speed: "ALIENRPG.Speed",
	manoeuvrability: "ALIENRPG.Manoeuvrability",
}
ALIENRPG.spacecraftattributes = {
	crew: "ALIENRPG.CREW",
	passengers: "ALIENRPG.PASSENGERS",
	ftlrating: "ALIENRPG.FTL-RATING",
	signature: "ALIENRPG.SIGNATURE",
	thrusters: "ALIENRPG.THRUSTERS",
	hull: "ALIENRPG.HULL",
	armor: "ALIENRPG.SHIP-ARMOR",
}
ALIENRPG.skills = {
	heavyMach: { name: "ALIENRPG.SkillheavyMach", attrib: "str" },
	closeCbt: { name: "ALIENRPG.SkillcloseCbt", attrib: "str" },
	stamina: { name: "ALIENRPG.Skillstamina", attrib: "str" },
	rangedCbt: { name: "ALIENRPG.SkillrangedCbt", attrib: "agl" },
	mobility: { name: "ALIENRPG.Skillmobility", attrib: "agl" },
	piloting: { name: "ALIENRPG.Skillpiloting", attrib: "agl" },
	command: { name: "ALIENRPG.Skillcommand", attrib: "emp" },
	manipulation: { name: "ALIENRPG.Skillmanipulation", attrib: "emp" },
	medicalAid: { name: "ALIENRPG.SkillmedicalAid", attrib: "emp" },
	observation: { name: "ALIENRPG.Skillobservation", attrib: "wit" },
	survival: { name: "ALIENRPG.Skillsurvival", attrib: "wit" },
	comtech: { name: "ALIENRPG.Skillcomtech", attrib: "wit" },
}
ALIENRPG.general = {
	career: "ALIENRPG.Career",
	appearance: "ALIENRPG.Apparance",
	sigItem: "ALIENRPG.SignatureItem",
}
ALIENRPG.physicalItems = []
// ALIENRPG.physicalItems = ['item', 'weapon', 'armor', 'talent', 'planet-system', 'agenda', 'specialty', 'critical-injury'];

ALIENRPG.conditionEffects = [
	{
		id: "starving",
		name: "ALIENRPG.Starving",
		label: "ALIENRPG.Starving",
		icon: "systems/alienrpg/images/starving.webp",
	},
	{
		id: "dehydrated",
		name: "ALIENRPG.Dehydrated",
		label: "ALIENRPG.Dehydrated",
		icon: "systems/alienrpg/images/water-flask.webp",
	},
	{
		id: "exhausted",
		name: "ALIENRPG.Exhausted",
		label: "ALIENRPG.Exhausted",
		icon: "systems/alienrpg/images/exhausted.webp",
	},
	{
		id: "freezing",
		name: "ALIENRPG.Freezing",
		label: "ALIENRPG.Freezing",
		icon: "systems/alienrpg/images/freezing.webp",
	},
	{
		id: "encumbered",
		name: "ALIENRPG.Encumbered",
		label: "ALIENRPG.Encumbered",
		icon: "systems/alienrpg/images/weight.webp",
	},
	{
		id: "panicked",
		name: "ALIENRPG.Panicked",
		label: "ALIENRPG.Panicked",
		icon: "systems/alienrpg/images/panic.webp",
	},
	{
		id: "overwatch",
		name: "ALIENRPG.Overwatch",
		label: "ALIENRPG.Overwatch",
		icon: "systems/alienrpg/images/overwatch.webp",
	},
	{
		id: "radiation",
		name: "ALIENRPG.Radiation",
		label: "ALIENRPG.Radiation",
		icon: "systems/alienrpg/images/radiation.webp",
	},
	{
		id: "hypoxia",
		name: "ALIENRPG.hypoxia",
		label: "ALIENRPG.hypoxia",
		icon: "systems/alienrpg/images/hypoxia.webp",
	},
	{
		id: "heatstroke",
		name: "ALIENRPG.heatstroke",
		label: "ALIENRPG.heatstroke",
		icon: "systems/alienrpg/images/heatstroke.webp",
	},
	{
		id: "gravitydyspraxia",
		name: "ALIENRPG.gravitydyspraxia",
		label: "ALIENRPG.gravitydyspraxia",
		icon: "systems/alienrpg/images/gravitydyspraxia.webp",
	},
	{
		id: "criticalinj",
		name: "ALIENRPG.CriticalInjuries",
		label: "ALIENRPG.CriticalInjuries",
		icon: "icons/skills/wounds/injury-pain-body-orange.webp",
	},
	{
		id: "shipminor",
		name: "ALIENRPG.MINOR-COMPONENT-DAMAGE",
		label: "ALIENRPG.MINOR-COMPONENT-DAMAGE",
		icon: "systems/alienrpg/images/lightning-spanner.webp",
	},
	{
		id: "shipmajor",
		name: "ALIENRPG.MAJOR-COMPONENT-DAMAGE",
		label: "ALIENRPG.MAJOR-COMPONENT-DAMAGE",
		icon: "systems/alienrpg/images/cogsplosion.webp",
	},
]

ALIENRPG.conditions = {
	jumpy: {
		name: "ALIENRPG.jumpy",
		resp: "stress",
		tableNumber: 1,
		img: "systems/alienrpg/images/icons/jumpy.webp",
		changes: [{ key: "system.general.addpanic.value", mode: 2, value: "1" }],
	},
	tunnelvision: {
		name: "ALIENRPG.tunnelvision",
		resp: "stress",
		tableNumber: 2,
		img: "systems/alienrpg/images/icons/tunnelvision.webp",
		changes: [
			{ key: "system.skills.comtech.value", mode: 2, value: "-2" },
			{ key: "system.skills.observation.value", mode: 2, value: "-2" },
			{ key: "system.skills.survival.value", mode: 2, value: "-2" },
		],
	},
	aggravated: {
		name: "ALIENRPG.aggravated",
		resp: "stress",
		tableNumber: 3,
		img: "systems/alienrpg/images/icons/aggravated.webp",
		changes: [
			{ key: "system.skills.command.value", mode: 2, value: "-2" },
			{ key: "system.skills.manipulation.value", mode: 2, value: "-2" },
			{ key: "system.skills.medicalAid.value", mode: 2, value: "-2" },
		],
	},
	shakes: {
		name: "ALIENRPG.shakes",
		resp: "stress",
		tableNumber: 4,
		img: "systems/alienrpg/images/icons/shakes.webp",
		changes: [
			{ key: "system.skills.mobility.value", mode: 2, value: "-2" },
			{ key: "system.skills.piloting.value", mode: 2, value: "-2" },
			{ key: "system.skills.rangedCbt.value", mode: 2, value: "-2" },
		],
	},
	frantic: {
		name: "ALIENRPG.frantic",
		resp: "stress",
		tableNumber: 5,
		img: "systems/alienrpg/images/icons/frantic.webp",
		changes: [
			{ key: "system.skills.closeCbt.value", mode: 2, value: "-2" },
			{ key: "system.skills.heavyMach.value", mode: 2, value: "-2" },
			{ key: "system.skills.stamina.value", mode: 2, value: "-2" },
		],
	},
	deflated: {
		name: "ALIENRPG.deflated",
		resp: "stress",
		tableNumber: 6,
		img: "systems/alienrpg/images/icons/deflated.webp",
	},
	messup: {
		name: "ALIENRPG.messup",
		resp: "stress",
		tableNumber: 7,
		img: "systems/alienrpg/images/icons/messup.webp",
	},
	fatigued: {
		name: "ALIENRPG.fatigued",
		resp: "",
		tableNumber: 0,
		img: "systems/alienrpg/images/icons/fatigued.webp",
	},
	keepingguard: {
		name: "ALIENRPG.keepingguard",
		resp: "stress",
		tableNumber: 0,
		img: "systems/alienrpg/images/overwatch.webp",
		changes: [{ key: "system.skills.observation.value", mode: 2, value: "2" }],
	},
	spooked: {
		name: "ALIENRPG.spooked",
		resp: "panic",
		tableNumber: 1,
		changes: [{ key: "system.general.stress.value", mode: 2, value: "1" }],
		img: "systems/alienrpg/images/icons/spooked.webp",
	},
	noisy: {
		name: "ALIENRPG.noisy",
		resp: "panic",
		tableNumber: 2,
		img: "systems/alienrpg/images/icons/noisy.webp",
	},
	twitchy: {
		name: "ALIENRPG.twitchy",
		resp: "panic",
		tableNumber: 3,
		img: "systems/alienrpg/images/icons/twitchy.webp",
	},
	loseitem: {
		name: "ALIENRPG.loseitem",
		resp: "panic",
		tableNumber: 4,
		img: "systems/alienrpg/images/icons/lose-item.webp",
	},
	paranoid: {
		name: "ALIENRPG.paranoid",
		resp: "panic",
		tableNumber: 5,
		img: "systems/alienrpg/images/icons/paranoid.webp",
	},
	hesitant: {
		name: "ALIENRPG.hesitant",
		resp: "panic",
		tableNumber: 6,
		img: "systems/alienrpg/images/icons/hesitant.webp",
	},
	freeze: {
		name: "ALIENRPG.freeze",
		resp: "panic",
		tableNumber: 7,
		img: "systems/alienrpg/images/icons/freeze.webp",
	},
	seekcover: {
		name: "ALIENRPG.seekcover",
		resp: "panic",
		tableNumber: 8,
		img: "systems/alienrpg/images/icons/seekcover.webp",
	},
	scream: {
		name: "ALIENRPG.scream",
		resp: "panic",
		tableNumber: 9,
		img: "systems/alienrpg/images/icons/scream.webp",
	},
	flee: {
		name: "ALIENRPG.flee",
		resp: "panic",
		tableNumber: 10,
		img: "systems/alienrpg/images/icons/flee.webp",
	},
	frenzy: {
		name: "ALIENRPG.frenzy",
		resp: "panic",
		tableNumber: 11,
		img: "systems/alienrpg/images/icons/frenzy.webp",
	},
	catatonic: {
		name: "ALIENRPG.catatonic",
		resp: "panic",
		tableNumber: 12,
		img: "systems/alienrpg/images/icons/catatonic.webp",
	},
}

ALIENRPG.vehicle = {
	crewPositionFlags: ["COMMANDER", "PILOT", "GUNNER", "PASSENGER"],
	crewPositionFlagsLocalized: {
		COMMANDER: "ALIENRPG.CrewCommander",
		PILOT: "ALIENRPG.CrewPilot",
		GUNNER: "ALIENRPG.CrewGunner",
		PASSENGER: "ALIENRPG.CrewPasanger",
	},
}
ALIENRPG.spacecraft = {
	crewPositionFlags: ["CAPTAIN", "SENSOR-OP", "PILOT", "GUNNER", "ENGINEER", "PASSENGER"],
	crewPositionFlagsLocalized: {
		CAPTAIN: "ALIENRPG.CAPTAIN",
		"SENSOR-OP": "ALIENRPG.SENSOR-OP",
		PILOT: "ALIENRPG.CrewPilot",
		GUNNER: "ALIENRPG.CrewGunner",
		ENGINEER: "ALIENRPG.ENGINEER",
		PASSENGER: "ALIENRPG.CrewPasanger",
	},
}

ALIENRPG.Icons = {
	buttons: {
		edit: '<i class="fas fa-edit"></i>',
		delete: '<i class="fas fa-trash"></i>',
		remove: '<i class="fas fa-times"></i>',
	},
}

ALIENRPG.career_list = {
	0: { id: 0, label: "ALIENRPG.GeneralTalent" },
	1: { id: 1, label: "ALIENRPG.ColonialMarine" },
	2: { id: 2, label: "ALIENRPG.ColonialMarshal" },
	3: { id: 3, label: "ALIENRPG.CompanyAgent" },
	4: { id: 4, label: "ALIENRPG.Kid" },
	5: { id: 5, label: "ALIENRPG.Medic" },
	6: { id: 6, label: "ALIENRPG.Mercenary" },
	7: { id: 7, label: "ALIENRPG.Officer" },
	8: { id: 8, label: "ALIENRPG.Pilot" },
	9: { id: 9, label: "ALIENRPG.Roughneck" },
	10: { id: 10, label: "ALIENRPG.Scientist" },
	13: { id: 13, label: "ALIENRPG.Wildcatter" },
	14: { id: 14, label: "ALIENRPG.Entertainer" },
	11: { id: 11, label: "ALIENRPG.Synthetic" },
	12: { id: 12, label: "ALIENRPG.Homebrew" },
}

ALIENRPG.sensor_list = {
	1: { key: "ALIENRPG.targetLock", label: "ALIENRPG.targetLock" },
	2: { key: "ALIENRPG.goDark", label: "ALIENRPG.goDark" },
	3: {
		key: "ALIENRPG.powerUpSensors",
		label: "ALIENRPG.powerUpSensors",
	},
}

ALIENRPG.pilot_list = {
	1: { key: "ALIENRPG.accelerate", label: "ALIENRPG.accelerate" },
	2: { key: "ALIENRPG.decelerate", label: "ALIENRPG.decelerate" },
	3: { key: "ALIENRPG.maneuver", label: "ALIENRPG.maneuver" },
	4: { key: "ALIENRPG.ram", label: "ALIENRPG.ram" },
	5: { key: "ALIENRPG.dock", label: "ALIENRPG.dock" },
}

ALIENRPG.gunner_list = {
	1: { key: "ALIENRPG.fireWeapon", label: "ALIENRPG.fireWeapon" },
	2: {
		key: "ALIENRPG.launchCounter",
		label: "ALIENRPG.launchCounter",
	},
}

ALIENRPG.engineer_list = {
	1: {
		key: "ALIENRPG.emergencyRepairs",
		label: "ALIENRPG.emergencyRepairs",
	},
	2: {
		key: "ALIENRPG.powerUpEngine",
		label: "ALIENRPG.powerUpEngine",
	},
	3: { key: "ALIENRPG.openAirlock", label: "ALIENRPG.openAirlock" },
	4: {
		key: "ALIENRPG.reactorOverload",
		label: "ALIENRPG.reactorOverload",
	},
}

ALIENRPG.weapon_range_list = {
	1: { id: 1, label: "ALIENRPG.Engaged" },
	2: { id: 2, label: "ALIENRPG.Short" },
	3: { id: 3, label: "ALIENRPG.Medium" },
	4: { id: 4, label: "ALIENRPG.Long" },
	5: { id: 5, label: "ALIENRPG.Extreme" },
}
ALIENRPG.vehicle_weapon_range_list = {
	1: { id: 1, label: "ALIENRPG.Contact", value: "2" },
	2: { id: 2, label: "ALIENRPG.Short", value: "1" },
	3: { id: 3, label: "ALIENRPG.Medium", value: "0" },
	4: { id: 4, label: "ALIENRPG.Long", value: "-1" },
	5: { id: 5, label: "ALIENRPG.Extreme", value: "-2" },
}

ALIENRPG.target_cover = {
	none: { id: "none", label: "ALIENRPG.nocover", value: "0" },
	partialcover: { id: "partialcover", label: "ALIENRPG.partialcover", value: "-2" },
	goodcover: { id: "fullcover", label: "ALIENRPG.fullcover", value: "-3" },
}

ALIENRPG.size_modifiers = {
	normal: { id: "normal", label: "ALIENRPG.normal", value: "0" },
	large: { id: "large", label: "ALIENRPG.large", value: "2" },
	small: { id: "small", label: "ALIENRPG.small", value: "-2" },
}
ALIENRPG.weapon_type_list = {
	// 0: { id: 0, label: 'ALIENRPG.None' },
	1: { id: 1, label: "ALIENRPG.WepTypeRanged" },
	2: { id: 2, label: "ALIENRPG.WepTypeMelee" },
}

ALIENRPG.skills_list = {
	1: { key: "Heavy Machinery", label: "ALIENRPG.SkillheavyMach" },
	2: { key: "Close Combat", label: "ALIENRPG.SkillcloseCbt" },
	3: { key: "Stamina", label: "ALIENRPG.Skillstamina" },
	4: { key: "Ranged Combat", label: "ALIENRPG.SkillrangedCbt" },
	5: { key: "Mobility", label: "ALIENRPG.Skillmobility" },
	6: { key: "Piloting", label: "ALIENRPG.Skillpiloting" },
	7: { key: "Command", label: "ALIENRPG.Skillcommand" },
	8: { key: "Manipulation", label: "ALIENRPG.Skillmanipulation" },
	9: { key: "Medical Aid", label: "ALIENRPG.SkillmedicalAid" },
	10: { key: "Observation", label: "ALIENRPG.Skillobservation" },
	11: { key: "Survival", label: "ALIENRPG.Skillsurvival" },
	12: { key: "Comtech", label: "ALIENRPG.Skillcomtech" },
}

ALIENRPG.ship_weapon_type_list = {
	1: { id: 1, label: "ALIENRPG.Offensive" },
	2: { id: 2, label: "ALIENRPG.Defensive" },
}
ALIENRPG.ship_weapon_range_list = {
	6: { key: 6, label: "ALIENRPG.Contact" },
	2: { key: 2, label: "ALIENRPG.Short" },
	3: { key: 3, label: "ALIENRPG.Medium" },
	4: { key: 4, label: "ALIENRPG.Long" },
	5: { key: 5, label: "ALIENRPG.Extreme" },
	7: { key: 7, label: "ALIENRPG.Surface" },
}

ALIENRPG.ship_weapon_targetmod_list = {
	1: { id: 1, label: "ALIENRPG.None", value: "0" },
	2: { id: 2, label: "ALIENRPG.MalfunctioningSensors", value: "-2" },
	3: { id: 3, label: "ALIENRPG.TargetShipSensorsOffline", value: "-1" },
	4: { id: 4, label: "ALIENRPG.TargetShipEnginesOffline", value: "-2" },
	5: { id: 5, label: "ALIENRPG.TargetShipEnginesSensorsOffline", value: "-3" },
}

ALIENRPG.ship_hardpoint_list = {
	1: { key: "I", label: "ALIENRPG.Size1" },
	2: { key: "II", label: "ALIENRPG.Size2" },
	3: { key: "III", label: "ALIENRPG.Size3" },
}

ALIENRPG.ship_attributes_list = {
	1: { key: "I", label: "I" },
	2: { key: "II", label: "II" },
	3: { key: "III", label: "III" },
	4: { key: "IV", label: "IV" },
	5: { key: "V", label: "V" },
	6: { key: "ALIENRPG.upgrade", label: "ALIENRPG.upgrade" },
}

ALIENRPG.crit_list = {
	0: { id: 0, label: "ALIENRPG.MINOR-COMPONENT-DAMAGE" },
	1: { id: 1, label: "ALIENRPG.MAJOR-COMPONENT-DAMAGE" },
}

ALIENRPG.item_types_list = {
	1: { id: 1, label: "ALIENRPG.DataStorage" },
	2: { id: 2, label: "ALIENRPG.DiagnosticsDisplay" },
	3: { id: 3, label: "ALIENRPG.VisionDevices" },
	4: { id: 4, label: "ALIENRPG.Tools" },
	5: { id: 5, label: "ALIENRPG.MedicalSupplies" },
	6: { id: 6, label: "ALIENRPG.Pharmaceuticals" },
	7: { id: 7, label: "ALIENRPG.FoodDrink" },
	8: { id: 8, label: "ALIENRPG.Power" },
	9: { id: 9, label: "ALIENRPG.ComputerMainframes" },
	10: { id: 10, label: "ALIENRPG.Consumables" },
	11: { id: 11, label: "ALIENRPG.Clothing" },
}

ALIENRPG.crit_timelimit_list = {
	0: { id: 0, label: "ALIENRPG.None" },
	1: { id: 1, label: "ALIENRPG.OneRound" },
	2: { id: 2, label: "ALIENRPG.OneTurn" },
	3: { id: 3, label: "ALIENRPG.OneShift" },
	4: { id: 4, label: "ALIENRPG.OneDay" },
}

ALIENRPG.colony_policy_list = {
	1: { id: 1, label: "ALIENRPG.Policies" },
	2: { id: 2, label: "ALIENRPG.Installations" },
	3: { id: 3, label: "ALIENRPG.Projects" },
}

ALIENRPG.STATUS_EFFECTS = {
	FAST_ACTION: "fastAction",
	SLOW_ACTION: "slowAction",
}

ALIENRPG.StatusEffects = {
	slowAndFastActions: [
		{
			id: ALIENRPG.STATUS_EFFECTS.FAST_ACTION,
			name: "ALIENRPG.FastAction",
			label: "ALIENRPG.FastAction",
			icon: "systems/alienrpg/images/icons/fast-action.webp",
			statuses: ["fastAction"],
		},
		{
			id: ALIENRPG.STATUS_EFFECTS.SLOW_ACTION,
			name: "ALIENRPG.SlowAction",
			label: "ALIENRPG.SlowAction",
			icon: "systems/alienrpg/images/icons/slow-action.webp",
			statuses: ["slowAction"],
		},
	],
}
