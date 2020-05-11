export class alienrolls extends ActorSheet {
  panicRoll = () => {
    // Roll against the panic table and push the roll to the chat log.
    let chatMessage = '';
    const table = game.tables.getName('Panic Table');
    const roll = new Roll('1d6 + @stress', this.actor.getRollData());
    const customResults = table.roll({ roll });
    chatMessage += '<h2>Panic Condition</h2>';
    chatMessage += `<h4><i>${table.data.description}</i></h4>`;
    chatMessage += `${customResults.results[0].text}`;
    ChatMessage.create({ user: game.user._id, content: chatMessage, other: game.users.entities.filter((u) => u.isGM).map((u) => u._id), type: CONST.CHAT_MESSAGE_TYPES.OTHER });
  };

  getRoll = (dn, arr) => {
    // const dieRoll = [];
    die.roll(dn).rolls = [];
    let dieRoll = die.roll(dn).rolls;
    dieRoll.forEach((el) => arr.push(el.roll));
    return arr;
  };

  yzeDiceRoll = (system, d1, d2, d3, reRoll) => {
    const first = [];
    const second = [];
    const third = [];
    const die = new Die(6);
    let wOneS = 0;
    let wSixS = 0;
    let yOneS = 0;
    let ySixS = 0;
    let bOneS = 0;
    let bSixS = 0;
    if (system != 'Alien') {
      console.print('Not yet supported');
    } else {
      // roll base dice
      if (d1 <= 0) {
        console.log('Error no dice specified in d1 yzeDiceRoll(system, d1, d2, d3) ');
      } else {
        getRoll(d1, first);
        if (d2 > 0) {
          getRoll(d2, second);
          if (d3 > 0) {
            getRoll(d3, third);
          }
        }
      }

      // process successes and failures
      first.forEach((elA) => {
        if (elA === 1) {
          wOneS++;
        } else {
          if (elA === 6) {
            wSixS++;
          }
        }
      });

      if (d2 > 0) {
        second.forEach((elB) => {
          if (elB === 1) {
            yOneS++;
          } else {
            if (elB === 6) {
              ySixS++;
            }
          }
        });
      }

      if (d3 > 0) {
        third.forEach((elC) => {
          if (elC === 1) {
            bOneS++;
          } else {
            if (elC === 6) {
              bSixS++;
            }
          }
        });
      }
    }
    return { wOneS, wSixS, yOneS, ySixS, bOneS, bSixS };
  };

  // //  Dice roller usage : yzeDiceRoll(YZE system, number of dice, number of dice, number of dice)
  // //   Currently only supports Alien.   passes back a string array for each dice.
  // //let result ={};
  // //let result = yzeDiceRoll('Alien', 12, 12, 12);
  // //console.log('result', result);

  // //console.log('first' ,first);
  // //console.log('second',second);
  // //console.log('third',third);
} // End of Export
