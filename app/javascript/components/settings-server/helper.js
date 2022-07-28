export const createOptions = (options) => (options ? options.map((item, index) => (
  typeof (item) === 'string'
    ? { label: item, value: item, key: index }
    : { label: item[0], value: item[1], key: index })) : []);

const basicInformation = (result, formData) => {
  const basicInfo = formData.basic_information;
  const basic = {
    companyName: result.server.company,
    applianceName: formData.server.name,
    zone: {
      options: createOptions(basicInfo.zone.options),
      value: basicInfo.zone.value,
    },
    applianceTimeZone: {
      options: createOptions(basicInfo.appliance_time_zone.options),
      value: basicInfo.appliance_time_zone.value,
    },
    defaultLocal: {
      options: createOptions(basicInfo.default_local.options),
      value: basicInfo.default_local.value,
    },
  };
  return basic;
};

export const initialFormData = (result, formData) => ({
  basic: basicInformation(result, formData),
  serverControls: formData.server_controls,
  smtp: formData.smtp,
  webservices: formData.webservices,
  logging: formData.logging,
});
