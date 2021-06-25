const dataHelper = (values, timeProfileId, action, userid) => {
  let data = {};
  let APIaction = 'edit';
  let metrics = values.rollup_daily_metrics;
  let profileType = values.profile_type;
  let profile = {};
  let { days } = values.profile;
  const { tz } = values.profile;

  if (timeProfileId === '' || action === 'timeprofile_copy') {
    APIaction = 'create';
  }

  if (values.rollup_daily_metrics === undefined) {
    metrics = false;
  }

  if (values.profile_type === undefined) {
    profileType = 'user';
  }

  let hours = [];

  if (values.profile.hoursAM !== undefined) {
    values.profile.hoursAM.forEach((time) => {
      hours.push(time);
    });
  }

  if (values.profile.hoursPM !== undefined) {
    values.profile.hoursPM.forEach((time) => {
      hours.push(time);
    });
  }

  if (values.DaysSelectAll) {
    days = [0, 1, 2, 3, 4, 5, 6];
  }

  if (values.HoursSelectAll) {
    hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  }
  days.sort();
  hours.sort((int1, int2) => int1 - int2);

  profile = {
    days,
    hours,
    tz,
  };

  data = {
    action: APIaction,
    description: values.description,
    profile_type: profileType,
    profile_key: userid,
    profile,
    rollup_daily_metrics: metrics,
  };
  return data;
};

const days = [
  {
    value: 0,
    label: __('Sunday'),
  },
  {
    value: 1,
    label: __('Monday'),
  },
  {
    value: 2,
    label: __('Tuesday'),
  },
  {
    value: 3,
    label: __('Wedensday'),
  },
  {
    value: 4,
    label: __('Thursday'),
  },
  {
    value: 5,
    label: __('Friday'),
  },
  {
    value: 6,
    label: __('Saturday'),
  },
];

const hoursAM = [
  {
    value: 0,
    label: '12-1',
  },
  {
    value: 1,
    label: '1-2',
  },
  {
    value: 2,
    label: '2-3',
  },
  {
    value: 3,
    label: '3-4',
  },
  {
    value: 4,
    label: '4-5',
  },
  {
    value: 5,
    label: '5-6',
  },
  {
    value: 6,
    label: '6-7',
  },
  {
    value: 7,
    label: '7-8',
  },
  {
    value: 8,
    label: '8-9',
  },
  {
    value: 9,
    label: '9-10',
  },
  {
    value: 10,
    label: '10-11',
  },
  {
    value: 11,
    label: '11-12',
  },
];

const hoursPM = [
  {
    value: 12,
    label: '12-1',
  },
  {
    value: 13,
    label: '1-2',
  },
  {
    value: 14,
    label: '2-3',
  },
  {
    value: 15,
    label: '3-4',
  },
  {
    value: 16,
    label: '4-5',
  },
  {
    value: 17,
    label: '5-6',
  },
  {
    value: 18,
    label: '6-7',
  },
  {
    value: 19,
    label: '7-8',
  },
  {
    value: 20,
    label: '8-9',
  },
  {
    value: 21,
    label: '9-10',
  },
  {
    value: 22,
    label: '10-11',
  },
  {
    value: 23,
    label: '11-12',
  },
];

export {
  dataHelper, days, hoursAM, hoursPM,
};
