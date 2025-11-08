import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgCritInj extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Item"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			active: new fields.StringField({ required: true, initial: "false" }),
			completed: new fields.BooleanField({ initial: false }),
		})

		schema.attributes = new fields.SchemaField({
			healingtime: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			timelimit: new fields.SchemaField({
				value: new fields.NumberField({
					...requiredInteger,
					initial: 0,
					min: 0,
				}),
			}),
			effects: new fields.HTMLField(),
			fatal: new fields.BooleanField({ initial: false }),
		})
		return schema
	}
	prepareDerivedData() {}

	getRollData() {
		const data = {}

		return data
	}
}
