import alienrpgItemBase from "./base-item.mjs"

export default class alienrpgSpacecraftCrit extends alienrpgItemBase {
	static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "ALIENRPG.Item"]
	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = alienrpgItemBase.defineSchema()

		schema.header = new fields.SchemaField({
			type: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			damage: new fields.SchemaField({
				value: new fields.StringField({ required: true, blank: true }),
			}),
			repairroll: new fields.HTMLField({ initial: "-" }),
			effects: new fields.HTMLField(),
		})
		return schema
	}
	prepareDerivedData() {}

	getRollData() {
		const data = {}

		return data
	}
}
