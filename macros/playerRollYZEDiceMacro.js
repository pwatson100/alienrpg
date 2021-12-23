(async () => {
  let hostile = false;
  try {
    let label = `${game.i18n.localize('ALIENRPG.ROLLFOR')}` + ' ' + actor.name;
  } catch {
    ui.notifications.error(`${game.i18n.localize('ALIENRPG.NoToken')}`);
    return;
  }
  let label = 'for ' + actor.name;
  let actorid = actor.id;
  let reRoll = false;
  let blind = false;

  let template = `
        <form>
            <label>${game.i18n.localize('ALIENRPG.ENSOKEN')}</label>

            <div class="form-group">
            <label>${game.i18n.localize('ALIENRPG.HOWMANYDICE')}</label>
            <input type="text" id="fr1Data" value=1>
            </div>
            <div class="form-group">
            <label>${game.i18n.localize('ALIENRPG.HOWMANYSTRESS')}</label>
            <input type="text" id="fr2Data" value=0>
            </div>
   
        </form>`;

  let buttons = {};
  // if (game.tables.entities.length > 0) {
  buttons = {
    draw: {
      icon: '<i class="fas fa-check"></i>',
      label: `${game.i18n.localize('ALIENRPG.Roll')}`,
      callback: async (html) => {
        // const tableId = html.find('#tableSelect')[0].value
        // const table = game.tables.get(tableId);
        const r1Data = parseInt(html.find('#fr1Data')[0].value || 0);
        const r2Data = parseInt(html.find('#fr2Data')[0].value || 0);

        await game.alienrpg.yze.yzeRoll(hostile, blind, reRoll, label, r1Data, 'Black', r2Data, 'Stress', actorid);
      },
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: `${game.i18n.localize('ALIENRPG.DialCancel')}`,
    },
  };

  new Dialog({
    title: 'Player - Roll Alien Dice.',
    content: template,
    buttons: buttons,
    default: 'draw',
  }).render(true);
})();
