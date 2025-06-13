// ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
import dateFormat from 'dateformat';

class InsydeDate extends Date {
  constructor() {
    super(...arguments);
  }

  // addition function
  addDays(days) {
    this.setDate(this.getDate() + days);
    return this;
  }

  addSeconds(s) {
    this.setSeconds(this.getSeconds() + s);
    return this;
  }

  // formated print
  // ref: https://www.npmjs.com/package/dateformat
  format(fmt) {
    return dateFormat(this, fmt);
  }

  // unit: seconds
  getUnixTime() {
    return Math.floor(this.getTime() / 1000);
  }

  // for insyde custom output
  insydeSel() {
    return this.format('ddd mmm dd HH:MM:ss yyyy');
  }

  // test cases
  // sample code
  /*demo() {
    let d = new InsydeDate();
    // native
    // handle input a datetime string
    console.log('\n>>>>> input a datetime string');
    d = InsydeDate.parse('2022/01/01'); // NOTE: return value is integer unix time, unit: mini-seconds
    console.log(d);
    d = InsydeDate.parse('2022-01-01');
    console.log(d);
    d = InsydeDate.parse('Mon Jul 04 2022 15:07:09 GMT+0800');
    console.log(d);

    // handle input an integer unix time
    console.log('\n>>>>> input an integer unix time');
    d = new InsydeDate(1656922927643); // unit: mini-seconds
    console.log(d);
    d = new InsydeDate(1656922927); // unit: seconds
    console.log(d);

    // handle input year-month-day pair
    console.log('\n>>>>> input year-month-day pair');
    let year = 2020;
    let month = 1; // 0-base
    let day = 1; // 1-base
    // year, month, day, hours, minutes, seconds, milliseconds
    d = new InsydeDate(year, month - 1, day, 0, 0, 0, 0);
    console.log(d);
    d = new InsydeDate(year, month - 1, day);
    console.log(d);
    d = new InsydeDate();
    d.setFullYear(year);
    d.setMonth(month - 1);
    d.setDate(day);
    console.log(d);

    // handle input hour-minute-second pair
    console.log('\n>>>>> input hour-minute-second pair');
    let hour = 13;
    let minute = 1;
    let second = 1;
    d = new InsydeDate(70, 0, 1, hour, minute, second); // bias local time
    console.log(d);
    d = new InsydeDate(0, 0, 0, hour, minute, second);
    console.log(d);
    d = new InsydeDate();
    d.setHours(hour);
    d.setMinutes(minute);
    d.setSeconds(second);
    console.log(d);

    // print
    console.log('\n>>>>> test print');
    d = new InsydeDate();
    console.log(d.toISOString());
    console.log(d.toDateString());
    console.log(d.toJSON());
    console.log(d.toGMTString());
    console.log(d.toLocaleDateString());
    console.log(d.toLocaleString());
    console.log(d.toString());
    console.log(d.toTimeString());
    console.log(d.toUTCString());
    console.log(d.valueOf()); // get integer unix time, unit: mini-seconds
    console.log(d.getUnixTime()); // get integer unix time, unit: seconds

    // advance
    console.log('\n>>>>> test format');
    console.log(d.format('dddd, mmmm dS, yyyy, h:MM:ss TT'));
    console.log(d.format('yyyy/mm/dd, HH:MM:ss'));
    console.log(d.format('yyyy/mm/dd, HH:MM:ss.l'));
    console.log(d.format('yyyy/mm/dd'));
    console.log(d.format('yyyy-mm-dd'));
    console.log(d.format('ddd mmm dd HH:MM:ss yyyy'));

    d = new InsydeDate(InsydeDate.parse('2022/01/01')); // NOTE: return value is integer unix time, unit: mini-seconds
    console.log(d.format('yyyy/mm/dd'));
    console.log(d.insydeSel());

    // test addDays
    console.log('\n>>>>> test addDays');
    d = new InsydeDate();
    console.log(d);
    d.addDays(1);
    console.log(d);
    d.addDays(31);
    console.log(d);
    d.addDays(-31);
    console.log(d);

    // test addSeconds
    console.log('\n>>>>> test addSeconds');
    d = new InsydeDate();
    console.log(d);
    d.addSeconds(1);
    console.log(d);
    d.addSeconds(86400);
    console.log(d);
    d.addSeconds(-86400);
    console.log(d);
  }*/
}

export default InsydeDate;
