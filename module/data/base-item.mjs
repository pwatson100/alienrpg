export default class alienrpgItemBase extends foundry.abstract.TypeDataModel {
	static LOCALIZATION_PREFIXES = ["ALIENRPG.Item.base"]

	static defineSchema() {
		const fields = foundry.data.fields
		const requiredInteger = { required: true, nullable: false, integer: true }
		const schema = {}
		schema.notes = new fields.SchemaField({
			notes: new fields.HTMLField(),
		})

		schema.modifiers = new fields.SchemaField({
			attributes: new fields.SchemaField(
				Object.keys(CONFIG.ALIENRPG.modifiers).reduce((obj, attribute) => {
					obj[attribute] = new fields.SchemaField({
						value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
						label: new fields.StringField({ required: true, blank: true }),
					})
					return obj
				}, {}),
			),
			skills: new fields.SchemaField(
				Object.keys(CONFIG.ALIENRPG.skills).reduce((obj, skill) => {
					obj[skill] = new fields.SchemaField({
						value: new fields.NumberField({ ...requiredInteger, initial: 0 }),
						label: new fields.StringField({ required: true, blank: true }),
						ability: new fields.StringField({ required: true, blank: true }),
					})
					return obj
				}, {}),
			),
		})

		return schema
	}
	prepareDerivedData() {
		// Loop through ability scores, and add their modifiers to our sheet output.
		for (const key in this.modifiers.attributes) {
			this.modifiers.attributes[key].label = game.i18n.localize(CONFIG.ALIENRPG.modifiers[key]) ?? key
		}
		for (const key in this.modifiers.skills) {
			this.modifiers.skills[key].label = game.i18n.localize(CONFIG.ALIENRPG.skills[key].name) ?? key
			this.modifiers.skills[key].ability = game.i18n.localize(CONFIG.ALIENRPG.skills[key].attrib) ?? key
		}
	}
}
