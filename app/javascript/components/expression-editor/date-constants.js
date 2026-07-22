/**
 * Relative-date option lists mirroring ViewHelper::FROM_* in app/helpers/view_helper.rb.
 * FROM_HOURS is only shown when colType is 'datetime'.
 */

export const FROM_HOURS = [
  'This Hour',
  'Last Hour',
  '2 Hours Ago',
  '3 Hours Ago',
  '4 Hours Ago',
  '5 Hours Ago',
  '6 Hours Ago',
  '7 Hours Ago',
  '8 Hours Ago',
  '9 Hours Ago',
  '10 Hours Ago',
  '11 Hours Ago',
  '12 Hours Ago',
  '13 Hours Ago',
  '14 Hours Ago',
  '15 Hours Ago',
  '16 Hours Ago',
  '17 Hours Ago',
  '18 Hours Ago',
  '19 Hours Ago',
  '20 Hours Ago',
  '21 Hours Ago',
  '22 Hours Ago',
  '23 Hours Ago',
];

export const FROM_DAYS = [
  'Today',
  'Yesterday',
  '2 Days Ago',
  '3 Days Ago',
  '4 Days Ago',
  '5 Days Ago',
  '6 Days Ago',
  '7 Days Ago',
  '14 Days Ago',
];

export const FROM_WEEKS = [
  'This Week',
  'Last Week',
  '2 Weeks Ago',
  '3 Weeks Ago',
  '4 Weeks Ago',
];

export const FROM_MONTHS = [
  'This Month',
  'Last Month',
  '2 Months Ago',
  '3 Months Ago',
  '4 Months Ago',
  '6 Months Ago',
];

export const FROM_QUARTERS = [
  'This Quarter',
  'Last Quarter',
  '2 Quarters Ago',
  '3 Quarters Ago',
  '4 Quarters Ago',
];

export const FROM_YEARS = [
  'This Year',
  'Last Year',
  '2 Years Ago',
  '3 Years Ago',
  '4 Years Ago',
];

// Build the relative-date option list; prepends hour options for datetime fields.
export const buildRelativeDateOptions = (isDatetime) => {
  const keys = [
    ...(isDatetime ? FROM_HOURS : []),
    ...FROM_DAYS,
    ...FROM_WEEKS,
    ...FROM_MONTHS,
    ...FROM_QUARTERS,
    ...FROM_YEARS,
  ];
  return keys.map((k) => ({ name: k, label: __(k) }));
};

// 15-minute-interval time options for a full day (0:00–23:45), 96 entries.
export const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => (
  ['00', '15', '30', '45'].map((m) => {
    const label = `${h}:${m}`;
    return { name: label, label };
  })
)).flat();
