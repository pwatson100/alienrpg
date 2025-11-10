import alienrpgActorBase from "./base-actor.mjs"

export default class alienrpgColony extends alienrpgActorBase {
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
			location: new fields.StringField({ required: true, blank: true }),
			mission: new fields.StringField({ required: true, blank: true }),
			established: new fields.StringField({ required: true, blank: true }),
			cycles: new fields.StringField({ required: true, blank: true }),
			sponsor: new fields.StringField({ required: true, blank: true }),
			population: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			commander: new fields.StringField({ required: true, blank: true }),
			economydirector: new fields.StringField({ required: true, blank: true }),
			potentialname: new fields.StringField({ required: true, blank: true }),
			productivityname: new fields.StringField({ required: true, blank: true }),
			maintenancename: new fields.StringField({ required: true, blank: true }),
			sciencename: new fields.StringField({ required: true, blank: true }),
			spiritname: new fields.StringField({ required: true, blank: true }),
		})
		schema.stats = new fields.SchemaField({
			economy: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			potential: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			productivity: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			maintenance: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			science: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			spirit: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			developmenttotal: new fields.SchemaField({
				value: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				mod: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
				total: new fields.NumberField({ ...requiredInteger, initial: 0, min: 0 }),
			}),
			notes: new fields.StringField({ required: true, blank: true }),
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
		// for (const key in this.attributes) {
		// 	this.attributes[key].label = game.i18n.localize(CONFIG.ALIENRPG.vehicleattributes[key]) ?? key
		// }
		// this.attributes.damage.max = this.attributes.hull.value
		// this.DAMmax = this.attributes.damage.max
		// this.DAMcurrent = this.attributes.damage.value
		// this.DAMlost = this.DAMmax - this.DAMcurrent
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
