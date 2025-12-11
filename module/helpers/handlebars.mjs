/** biome-ignore-all lint/complexity/useArrowFunction: <explanation> */
export const initializeHandlebars = () => {
	registerHandlebarsHelpers()
}

function registerHandlebarsHelpers() {
	/* -------------------------------------------- */
	/*  Handlebars Helpers                          */
	/* -------------------------------------------- */

	// biome-ignore lint/complexity/useArrowFunction: <explanation>
	Handlebars.registerHelper("alienConcat", function () {
		let outStr = ""
		for (var arg in arguments) {
			if (typeof arguments[arg] !== "object") {
				outStr += arguments[arg]
			}
		}
		return outStr
	})

	// If you need to add Handlebars helpers, here is a useful example:
	Handlebars.registerHelper("toLowerCase", function (str) {
		return str.toLowerCase()
	})
	Handlebars.registerHelper("toUpperCase", (str) => str.toUpperCase())

	Handlebars.registerHelper("capitalise", (str) => str.charAt(0).toUpperCase() + str.slice(1))

	Handlebars.registerHelper("keepMarkup", (text) => new Handlebars.SafeString(text))

	Handlebars.registerHelper("removeMarkup", (text) => {
		const markup = /<(.*?)>/gi
		return new Handlebars.SafeString(text.replace(markup, ""))
	})

	Handlebars.registerHelper("ifSetting", function (v1, options) {
		if (game.settings.get("ALIENRPG", v1)) return options.fn(this)
		return options.inverse(this)
	})

	Handlebars.registerHelper("addstats", function (v1, v2) {
		return v1 + v2
	})

	Handlebars.registerHelper("if_isWeapons", function (sectionlabel, options) {
		// console.warn('helper triggered', sectionlabel);
		if (sectionlabel === "Weapons") {
			// console.warn('true');
			return options.fn(this)
		}
	})

	//  Now Using the Foundry versions
	// {{#if (eq v1 v2)}}
	// <!-- Returns v1 === 2 -->
	// (eq v1 v2)
	// <!-- Returns v1 !== 2 -->
	// (ne v1 v2)
	// <!-- Returns v1 < 2 -->
	// (lt v1 v2)
	// <!-- Returns v1 > 2 -->
	// (gt v1 v2)
	// <!-- Returns v1 <= 2 -->
	// (lte v1 v2)
	// <!-- Returns v1 >= 2 -->
	// (gte v1 v2)
	// <!-- Returns !pred -->
	// (not pred)
	// <!-- Returns true if every argument is truthy  -->
	// (and arg1 arg2 arg3 ...)
	// <!-- Returns true if any argument is truthy -->
	// (or arg1 arg2 arg3 ...)

	// // Ifis not equal
	// Handlebars.registerHelper('ifne', function (v1, v2, options) {
	// 	if (v1 !== v2) return options.fn(this);
	// 	else return options.inverse(this);
	// });

	// // if equal
	// Handlebars.registerHelper('ife', function (v1, v2, options) {
	// 	if (v1 === v2) return options.fn(this);
	// 	else return options.inverse(this);
	// });
	// // if Greater than
	// Handlebars.registerHelper('ifgt', function (v1, v2, options) {
	// 	if (v1 > v2) return options.fn(this);
	// 	else return options.inverse(this);
	// });
	// // if Less than
	// Handlebars.registerHelper('iflt', function (v1, v2, options) {
	// 	if (v1 < v2) return options.fn(this);
	// 	else return options.inverse(this);
	// });

	Handlebars.registerHelper("gRng", function (value, options) {
		let g = ""
		switch (value) {
			case "1":
				g = game.i18n.localize("ALIENRPG.Engaged")
				return g
			case "2":
				g = game.i18n.localize("ALIENRPG.Short")
				return g
			case "3":
				g = game.i18n.localize("ALIENRPG.Medium")
				return g
			case "4":
				g = game.i18n.localize("ALIENRPG.Long")
				return g
			case "5":
				g = game.i18n.localize("ALIENRPG.Extreme")
				return g
			case "6":
				g = game.i18n.localize("ALIENRPG.Contact")
				return g
			case "7":
				g = game.i18n.localize("ALIENRPG.Surface")
				return g
		}
	})

	Handlebars.registerHelper("striptags", function (txt) {
		// console.log(txt);
		// exit now if text is undefined
		if (typeof txt == "undefined") return
		// the regular expresion
		var regexp = /<[/\w]+>/g
		// replacing the text
		return txt.replace(regexp, "")
	})

	/*
	 * Repeat given markup with n times
	 */
	Handlebars.registerHelper("times", function (n, block) {
		var result = ""
		for (let i = 0; i < n; ++i) {
			result += block.fn(i)
		}
		return result
	})
}
