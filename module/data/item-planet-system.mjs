import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgPlanetSystem extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Item"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

		schema.header = new fields.SchemaField({
			commonName: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			system: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			sector: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			location: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
		})

		schema.details = new fields.SchemaField({
			affiliation: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			classification: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			climate: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			meanTemperature: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			terrain: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			colonies: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			population: new fields.SchemaField({
				value: new fields.StringField({
					required: true,
					blank: true,
					initial: "0",
				}),
			}),
			keyResources: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
		})
		schema.misc = new fields.SchemaField({
				description: new fields.SchemaField({
				value: new fields.HTMLField(),
			}),
		})

		return schema
	}
	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
	}

	getRollData() {
		const data = {}

		// Copy the ability scores to the top level, so that rolls can use
		// formulas like `@str.mod + 4`.
		// if (this.attributes) {
		// 	for (let [k, v] of Object.entries(this.attributes)) {
		// 		data[k] = foundry.utils.deepClone(v);
		// 	}
		// }

		return data
	}
}
