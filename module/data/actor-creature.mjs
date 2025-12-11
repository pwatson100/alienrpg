import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgCreature extends alienrpgActorBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Actor.Creature"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgActorBase.defineSchema()

		// header
		schema.header = new fields.SchemaField({
			health: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 1 }),
				max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				label: new fields.StringField({
					required: true,
					blank: true,
					initial: "ALIENRPG.creature.Health",
				}),
			}),
		})

		// attributes
		schema.attributes = new fields.SchemaField(
			Object.keys(CONFIG.ALIENRPG.creatureattributes).reduce((obj, attribute) => {
				obj[attribute] = new fields.SchemaField({
					value: new fields.NumberField({
						...requiredInteger,
						initial: 0,
						min: 0,
						max: 5,
					}),
					// mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					// max: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
					label: new fields.StringField({ required: true, blank: true }),
				})
				return obj
			}, {}),
		)

		// // general
		schema.general = new fields.SchemaField({
			comment: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			critInj: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			special: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
				label: new fields.StringField({ required: true, blank: true }),
			}),

			mobility: new fields.SchemaField({
				value: new fields.StringField({ required: true, initial: "-" }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
			observation: new fields.SchemaField({
				value: new fields.StringField({ required: true, initial: "-" }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
			acidSplash: new fields.SchemaField({
				value: new fields.StringField({ required: true, initial: "-" }),
				label: new fields.StringField({ required: true, blank: true }),
			}),
		})

		schema.rTables = new fields.StringField({ required: true, initial: "" })
		schema.cTables = new fields.StringField({ required: true, initial: "" })

		return schema
	}

	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
		for (const key in this.attributes) {
			this.attributes[key].label = game.i18n.localize(CONFIG.ALIENRPG.creatureattributes[key]) ?? key
		}

		this.general.mobility.label = game.i18n.localize(CONFIG.ALIENRPG.creaturedefence.mobility)
		this.general.observation.label = game.i18n.localize(CONFIG.ALIENRPG.creaturedefence.observation)
		this.general.acidSplash.label = game.i18n.localize(CONFIG.ALIENRPG.creaturedefence.acidSplash)
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
		if (this.general) {
			for (const [k, v] of Object.entries(this.general)) {
				data[k] = foundry.utils.deepClone(v)
			}
		}

		return data
	}
}
