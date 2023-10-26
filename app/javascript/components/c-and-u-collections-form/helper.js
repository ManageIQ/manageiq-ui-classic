/** Function to append 0 to beginning of a number if it is a single digit. */
const padStart = (number) => String(number).padStart(2, '0');

/** This function format the date. */
export const formatDate = (date) => {
  const newDate = new Date(date[0]);
  return `${padStart(newDate.getMonth() + 1)}/${padStart(newDate.getDate())}/${newDate.getFullYear()}`;
};
