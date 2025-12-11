import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgColonyInitiative extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Item"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

		schema.header = new fields.SchemaField({
			active: new fields.BooleanField({ initial: false }),
			completed: new fields.BooleanField({ initial: false }),
			comment: new fields.HTMLField({ required: true, blank: true }),
			type: new fields.HTMLField({ required: true, blank: true }),
		})
		schema.modifiers = new fields.SchemaField({
			economy: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			potential: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			productivity: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			maintenance: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			science: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			spirit: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
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
