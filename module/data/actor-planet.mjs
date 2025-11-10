import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgPlanet extends alienrpgActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Actor.Colony"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgActorBase.defineSchema()

		// header
		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: false, blank: true }),
				label: new fields.StringField({ required: false, blank: true }),
			}),
			colonyname: new fields.StringField({ required: true, blank: true }),
		})

		schema.attributes = new fields.SchemaField({
			parentstar: new fields.StringField({ required: true, blank: true }),
			planetposition: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			gasgiants: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			rockyplanets: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			iceplanets: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			asteroidbelts: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),

			radiation: new fields.StringField({ required: true, blank: true }),
			planetsize: new fields.StringField({ required: true, blank: true }),
			atmosphere: new fields.StringField({ required: true, blank: true }),
			hydrosphere: new fields.StringField({ required: true, blank: true }),
			daylength: new fields.StringField({ required: true, blank: true }),
			axialtilt: new fields.StringField({ required: true, blank: true }),
			gravity: new fields.StringField({ required: true, blank: true }),
			climate: new fields.StringField({ required: true, blank: true }),
			globalfeature: new fields.StringField({ required: true, blank: true }),
			orbitalperiod: new fields.StringField({ required: true, blank: true }),
			personality: new fields.StringField({ required: true, blank: true }),
			northpole: new fields.StringField({ required: true, blank: true }),
			rpnorthpole: new fields.BooleanField({ initial: false }),
			equator: new fields.StringField({ required: true, blank: true }),
			rpequator: new fields.BooleanField({ initial: false }),
			southpole: new fields.StringField({ required: true, blank: true }),
			rpsouthpole: new fields.BooleanField({ initial: false }),
			nhwest: new fields.StringField({ required: true, blank: true }),
			rpnhwest: new fields.BooleanField({ initial: false }),
			nhsouth: new fields.StringField({ required: true, blank: true }),
			rpnhsouth: new fields.BooleanField({ initial: false }),
			nheast: new fields.StringField({ required: true, blank: true }),
			rpnheast: new fields.BooleanField({ initial: false }),
			sheast: new fields.StringField({ required: true, blank: true }),
			rpsheast: new fields.BooleanField({ initial: false }),
			shwest: new fields.StringField({ required: true, blank: true }),
			rpshwest: new fields.BooleanField({ initial: false }),
		})

		schema.general = new fields.SchemaField({
			misc: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
		})
		// schema.notes = new fields.StringField({ required: true, blank: true })

		return schema
	}

	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
	}

	getRollData() {
		const data = {}
		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		if (this.attributes) {
			for (const [k, v] of Object.entries(this.attributes)) {
				data[k] = foundry.utils.deepClone(v)
			}
		}

		return data
	}
}
