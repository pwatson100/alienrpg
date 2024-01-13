export function enrichTextEditors() {
  // With permission from @mcglintlock
  // e.g., @DRAW[Compendium.cy-borg-core.random-tables.vX47Buopuq9t0x9r]{Names}
  // optionally add a roll for the draw at the end
  // e.g., @DRAW[Compendium.cy-borg-core.random-tables.vX47Buopuq9t0x9r]{Names}{1d4}
  const DRAW_FROM_TABLE_PATTERN = /@DRAW\[([^\]]+)\]{([^}]*)}(?:{([^}]*)})?/gm;
  const drawFromTableEnricher = (match, _options) => {
      const uuid = match[1];
      const tableName = match[2];
      const roll = match[3];
      const elem = document.createElement("span");
      elem.className = "draw-from-table";
      elem.setAttribute("data-tooltip", `Draw from ${tableName}. <br> ${game.i18n.localize("ALIENRPG.TOOLTIPROLLONTABLE")}`);
      elem.setAttribute("data-uuid", uuid);
      if (roll) {
          elem.setAttribute("data-roll", roll);
      }
      elem.innerHTML = `<i class="fas fa-dice-d20">&nbsp;</i>`;
      return elem;
  };


  CONFIG.TextEditor.enrichers.push(...[
      {
          pattern: /@RAW\[(.+?)\]/gm,
          enricher: async (match, options) => {
              const myData = await $.ajax({
                  url: match[1],
                  type: 'GET',
              });
              const doc = document.createElement("span");
              doc.innerHTML = myData;
              return doc;
          }
      },
      {
          pattern: DRAW_FROM_TABLE_PATTERN,
          enricher: drawFromTableEnricher,
      }, 
      {
          pattern: /@fas\[(.+?)\]/gm,
          enricher: async (match, options) => {
              const doc = document.createElement("span");                
              doc.innerHTML = `<i class="fas ${match[1]}"></i>`;
              return doc;
          }
      }]);

  async function drawFromRollableTable(event) {
      event.preventDefault();
      // const & var = globally defined
      let uuid = event.currentTarget.getAttribute("data-uuid");
      if (!uuid) {
          return;
      }
      let table = await fromUuid(uuid);
      let myF = async function (uuid, modifier) {
          if (table instanceof RollTable) {
              const formula = event.currentTarget.getAttribute("data-roll");
              const roll = formula ? new Roll(formula) : new Roll(`${table.formula} + ${modifier}`);
              await table.draw({ roll });
          }
      };
      if (event.ctrlKey) {
          let dialog_content = `<p>${game.i18n.format("ALIENRPG.ROLLONSELECTED", {
              tablename: table.name
          })}</p>
          <form>
              <div class="form-group">
                  <label>${game.i18n.localize("ALIENRPG.RollMod")}</label>
                  <input type="text" id="modifier" name="modifier" value="0" autofocus="autofocus" />
              </div>
          </form>`;
          let x = new Dialog({
              title: game.i18n.format("ALIENRPG.ROLLONSELECTED", {
                  tablename: table.name
              }),
              content: dialog_content,
              buttons:
              {
                  Ok: {
                      label: game.i18n.localize("ALIENRPG.Roll"), callback: async (html) => {
                          let modifier = parseInt(html.find("input[name='modifier'")[0].value);
                          if (isNaN(modifier)) { modifier = 0; }
                          await myF(uuid, modifier);
                      }
                  },
                  Cancel: { label: game.i18n.localize("ALIENRPG.DialCancel") }
              }
          });
          x.options.width = 200;
          x.position.width = 300;
          x.render(true);
      } else {
          await myF(uuid, 0);
      }
  }
  $(document).on("click", ".draw-from-table", drawFromRollableTable);
}
