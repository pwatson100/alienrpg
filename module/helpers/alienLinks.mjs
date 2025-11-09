export class AlienLinks extends foundry.applications.ux.TextEditor {
	/**
	 * Get the sidebar directory entry context options
	 * @return {Object}   The sidebar entry context options
	 * @private
	 */
	/**
	 * OVERRIDE
	 * Helper method to create an anchor element.
	 * @param {Partial<EnrichmentAnchorOptions>} [options]  Options to configure the anchor's construction.
	 * @returns {HTMLAnchorElement}
	 */
	static createAnchor({ attrs = {}, dataset = {}, classes = [], name, icon = "" } = {}) {
		name ??= game.i18n.localize("Unknown")
		const a = document.createElement("a")
		a.classList.add(...classes)
		for (const [k, v] of Object.entries(attrs)) {
			if (v !== null && v !== undefined) a.setAttribute(k, v)
		}
		for (const [k, v] of Object.entries(dataset)) {
			if (v !== null && v !== undefined) a.dataset[k] = v
		}
		if (icon) {
			const i = document.createElement("i")
			i.className = icon
			i.inert = true
			a.append(i)
		}
		a.append(name)
		return a
	}
}
