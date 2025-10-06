/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadHandlebarsTemplates = async function () {
	// Define template paths to load
	const templatePaths = [
		// Actor Sheet Partials
		'systems/alienrpg/templates/actor/tabs/actor-inventory.html',
		'systems/alienrpg/templates/actor/crt/tabs/actor-inventory.html',
		'systems/alienrpg/templates/actor/tabs/vehicle-inventory.html',
		'systems/alienrpg/templates/actor/crt/tabs/vehicle-inventory.html',
		'systems/alienrpg/templates/actor/tabs/spacecraft-armaments.html',
		'systems/alienrpg/templates/actor/tabs/spacecraft-inventory.hbs',
		'systems/alienrpg/templates/actor/tabs/spacecraft-crew.html',
		'systems/alienrpg/templates/actor/tabs/actor-systems.html',
		'systems/alienrpg/templates/actor/crt/tabs/actor-systems.html',
		'systems/alienrpg/templates/actor/tabs/critical-inj.html',
		'systems/alienrpg/templates/actor/tabs/sCraft-minor-crit.html',
		'systems/alienrpg/templates/actor/crt/tabs/sCraft-minor-crit.html',
		'systems/alienrpg/templates/actor/tabs/sCraft-major-crit.html',
		'systems/alienrpg/templates/actor/crt/tabs/sCraft-major-crit.html',
		'systems/alienrpg/templates/actor/tabs/spacecraft-combat-phases.html',
		'systems/alienrpg/templates/actor/tabs/colony-policies.html',
		'systems/alienrpg/templates/actor/tabs/colony-projects.html',
		'systems/alienrpg/templates/actor/tabs/colony-installations.html',
	];

	// Load the template parts
	return foundry.applications.handlebars.loadTemplates(templatePaths);
};
