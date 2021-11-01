import moment from 'moment';

// Convert date from browser to user's manageiq timezone
export const convertDate = (date, timezone) => {
// Find utc offset of browser time zone (utcOffset) and the user's manageiq timezone (newOffset)
  const browserOffset = moment(date).utcOffset();
  const miqOffset = moment.tz(timezone).utcOffset();
  return moment(date).add({ minutes: browserOffset - miqOffset })._d;
};

export const datePassed = (retirementDate) => {
  const retireDate = new Date(retirementDate);
  const today = new Date();

  if (retireDate <= today) {
    return true;
  }
  return false;
};

// Convert date from UTC time to user's manageiq timezone
export const getDateFromUTC = (retirementDate, timezone) => {
  const utcOffset = -1 * moment(retirementDate).utcOffset();
  return moment(retirementDate).tz(timezone).add({ minutes: utcOffset })._d;
};

// Get retirement date using the delay form
export const getDelay = (hours, days, weeks, months) => moment().add({
  hours: Number(hours),
  days: Number(days),
  weeks: Number(weeks),
  months: Number(months),
})._d;

// Get retirement date using the date and time picker
export const getDate = (retirementDate, retirementTime) => {
  const date = new Date(retirementDate);
  let time;
  let timeHours;
  let timeMinutes;
  if (retirementTime instanceof Date === false || retirementTime === undefined) {
    time = moment().startOf('D');
    timeHours = time.hour();
    timeMinutes = time.minute();
    if (/^([0-1][0-2]|0?[1-9]):[0-5][0-9]$/.test(retirementTime)) {
      [timeHours, timeMinutes] = retirementTime.split(':');
    }
  } else {
    time = moment(retirementTime);
    timeHours = time.hour();
    timeMinutes = time.minute();
  }
  date.setHours(timeHours);
  date.setMinutes(timeMinutes);
  date.setSeconds(0);
  return date;
};

export const getRetirementDate = (retirementDate) => {
  let tempDate = retirementDate;
  if (Array.isArray(retirementDate)) {
    [tempDate] = retirementDate;
  }
  return tempDate;
};

export const getRetirementWarning = (retirementWarning) => {
  let retirementWarn = retirementWarning;
  if (retirementWarn === undefined) {
    retirementWarn = '';
  }
  return retirementWarn;
};
