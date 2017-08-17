const moment = require('moment');

class Helper {
  constructor() {}

  parseDate(date) {
    return moment(date).toDate();
  }

  getDayAsIndex(unparsedDay) {
    let day = null;

    switch (unparsedDay) {
      case 'M': day = 0; break;
      case 'T': day = 1; break;
      case 'W': day = 2; break;
      case 'R': day = 3; break;
      case 'F': day = 4; break;
    }

    return day;
  }
}

module.exports = new Helper();