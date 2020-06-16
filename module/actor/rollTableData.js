export class alienrpgrTableGet extends Actor {
  constructor(options = {}) {
    super(options);
  }

  static rTableget() {
    let folder = game.folders.entities.find((x) => x.name === 'Alien Creature Tables');
    let aTables = folder.content;
    let lTables = {};
    // let lTables = aTables.find((x) => x.name);
    for (let index = 0; index < aTables.length; index++) {
      lTables[index] = aTables[index].name;
    }
    // console.warn('lTables', lTables);
    return lTables;
  }
}
