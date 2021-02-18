export default class AlienRPGCTContext extends CombatTracker {
  /**
   * Default folder context actions
   * @param html {jQuery}
   * @private
   */
  // _contextMenu(html) {
  //   const entryOptions = this._getEntryContextOptions();
  //   Hooks.call(`get${this.constructor.name}EntryContext`, html, entryOptions);
  //   if (entryOptions) new ContextMenu(html, ".directory-item", entryOptions);
  // }

  /* -------------------------------------------- */


  /**
   * Get the sidebar directory entry context options
   * @return {Object}   The sidebar entry context options
   * @private
   */
   static getEntryContextOptions() {
    return [
      {
        name: "ALIENRPG.CombatantUpdate",
        icon: '<i class="fas fa-edit"></i>',
        callback: this._onConfigureCombatant.bind(this)
      },
      {
        name: "ALIENRPG.CombatantReroll",
        icon: '<i class="fas fa-dice-d20"></i>',
        callback: li => this.combat.rollInitiative(li.data('combatant-id'))
      },
      {
        name: "ALIENRPG.CombatantRemove",
        icon: '<i class="fas fa-skull"></i>',
        callback: li => this.combat.deleteCombatant(li.data('combatant-id'))
      },
      {
        name: 'ALIENRPG.CloneActor',
        icon: '<i class="far fa-copy fa-fw"></i>',
        callback: async (li) => {
          const combatant = this.combat.getCombatant(li.data('combatant-id'));
          await this.combat.createCombatant(combatant);
        },
      },
    ];
  }

  /* -------------------------------------------- */
}