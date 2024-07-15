/** Function to convert a single digit to two digit string.
 * Eg: 5 => '05' and 12 => '12'. */
const padString = (i) => i.toString().padStart(2, '0');

/** Function to return the current local time as an object (No UTC). */
export const currentTime = () => {
  const now = new Date();
  const h = now.getHours();
  const hours = Array.from({ length: 13 }, (_, h) => ({ id: h, text: padString(h) }));
  const minutes = [...Array(60)].map((_, minute) => ({ id: minute, text: padString(minute) }));
  const meridiem = h >= 12 ? 'PM' : 'AM';
  let currentHour = h % 12;
  currentHour = currentHour || 12;
  const hour = hours.find((hour) => hour.id === currentHour).id;
  const minute = minutes.find((min) => min.id === now.getMinutes()).id;
  return {
    hours, minutes, hour, minute, meridiem,
  };
};

/** Function to return the current date as an object. */
export const currentDate = () => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = now.getFullYear();
  return { day, month, year };
};

/** Function to return the current date and time as an object. */
export const currentDateTime = () => ({ ...currentDate(), ...currentTime() });

/** Function to return the current date as a string from the date object. */
export const dateString = ({ day, month, year }) => {
  if (day && month && year) {
    return `${month}/${day}/${year}`;
  }
  return undefined;
};

/** Function to return the current date and time as a string from the date object. */
export const dateTimeString = (data) => {
  const date = dateString(data);
  return {
    date,
    hour: { id: data.hour, text: padString(data.hour) },
    minute: { id: data.minute, text: padString(data.minute) },
    meridiem: { id: data.meridiem, text: data.meridiem },
  };
};

/** Function to reformat the selected date during the DateField onchange event."
 * inputDate format eg: 'Sat Jul 13 2024 00:00:00 GMT+0530 (India Standard Time)'
 * */
export const extractDate = (inputDate) => {
  if (!inputDate) {
    return { day: undefined, month: undefined, year: undefined };
  }
  const date = new Date(inputDate);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate() + 1;

  return { day, month, year };
};

/** Function to reformat the selected date and time during the DateTimeField onchange event."
 * */
export const extractDateTime = (inputDate, time) => {
  const date = extractDate(inputDate);
  const { hour, minute } = time;
  return { ...date, hour: hour.id, minute: minute.id };
};

export const formatDate = ({ day, month, year }) =>
  ((day && month && year) ? `${padString(year)}-${padString(month)}-${padString(day)}` : '');

export const formatDateTime = ({
  day, month, year, hour, minute, meridiem,
}) => {
  const parsedHour = parseInt(hour, 10);
  const parsedMinute = parseInt(minute, 10);

  if (day && month && year && parsedHour != null && parsedMinute != null && meridiem) {
    let adjustedHour = parsedHour;

    if (meridiem.toLowerCase() === 'pm' && parsedHour !== 12) {
      adjustedHour += 12;
    } else if (meridiem.toLowerCase() === 'am' && parsedHour === 12) {
      adjustedHour = 0;
    }

    // Create a local Date object
    const localDate = new Date(year, month - 1, day, adjustedHour, parsedMinute);

    // Check for an invalid date
    if (Number.isNaN(localDate.getTime())) {
      return '';
    }

    // Convert to UTC
    const utcDate = new Date(Date.UTC(
      localDate.getFullYear(),
      localDate.getMonth(),
      localDate.getDate(),
      localDate.getHours(),
      localDate.getMinutes()
    ));

    return utcDate.toISOString();
  }
  return '';
};

export const serviceRequestDate = (value) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = padString(date.getMonth() + 1);
  const day = padString(date.getDate());
  return `${month}/${day}/${year}`;
};

/** DateTime field value that needs to be rendered for Service / Request / Dialog Options page. */
export const serviceRequestDateTime = (value) => {
  const split = value.split('T');
  const date = new Date(split[0]);
  const time = split[1].split(':');
  const year = date.getUTCFullYear();
  const month = padString(date.getUTCMonth() + 1);
  const day = padString(date.getUTCDate());
  const hours = padString(time[0]);
  const minutes = padString(time[1]);
  return `${month}/${day}/${year} at ${hours}:${minutes} UTC`;
};
