(async () => {
  let options = '';
  game.tables.entities.forEach((t) => {
    if (t.folder.name === 'Alien Mother Tables') {
      options = options.concat(`<option value="${t.data._id}">${t.data.name}</option>`);
    }
  });
  let template = `
                    <form>
                        <div class="form-group">
                            <label>Select Table</label>
                            <select id="tableSelect">${options}</select>
                        </div>
                        <div class="form-group">
                            <label>How Many?</label>
                            <input type="text" id="inputNbr" value=1>
                        </div>
                        <div class="form-group">
                            <label>Modifier?</label>
                            <input type="text" id="inputMod" value="0">
                        </div>
                    </form>`;

  let buttons = {};
  if (game.tables.entities.length > 0) {
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: 'Draw',
        callback: async (html) => {
          const tableId = html.find('#tableSelect')[0].value;
          const table = game.tables.get(tableId);
          const drawNumber = parseInt(html.find('#inputNbr')[0].value || 0);
          const formula = table.data.formula;
          const modifier = parseInt(html.find('#inputMod')[0].value || '0');

          for (let i = 0; i < drawNumber; i++) {
            const roll = new Roll(formula + ' + ' + modifier);
            await table.draw({ roll: roll });
          }
        },
      },
      cancel: {
        icon: '<i class="fas fa-times"></i>',
        label: 'Cancel',
      },
    };
  } else {
    template = '<div style="text-align: center">There are no tables to draw from!</div><br>';
    buttons = {
      draw: {
        icon: '<i class="fas fa-check"></i>',
        label: 'OK',
      },
    };
  }

  new Dialog({
    title: 'Roll on selected Mother table',
    content: template,
    buttons: buttons,
    default: 'draw',
  }).render(true);
})();
