/** Helper function to get templates load and restructure its options */
export const loadRepositoryOptions = (repositoryId, currentRegion) => new Promise((resolve, _reject) => {
  API.get(
    // eslint-disable-next-line max-len
    `/api/configuration_script_sources/${repositoryId}/configuration_script_payloads?expand=resources&filter[]=region_number=${currentRegion}&sort_by=name&sort_order=ascending`
  )
    .then(({ resources }) => {
      const options = resources.map(({ id, name }) => ({ label: name, value: id }));
      resolve(options);
    });
});

/** Helper function to get label and value from object to show them as options in selecet */
export const transformObjectToSelectOptions = (obj) => [...Object.entries(obj).map(([value, label]) => ({ label, value }))];

/** Helper function to get the options for curriences field */
export const transformCurrenciesOptions = (currencies) => currencies.map((currency) => ({
  label: `${currency.symbol} ${currency.full_name}`,
  value: currency.id,
}));

/** Helper function to get the options for zones field */
export const transformZonesOptions = (options) => Object.values(options).map((option) => ({
  label: option.description,
  value: option.id,
}));

/** Helper function to tarnsform options for select fields */
export const transformGeneralOptions = (options) => Object.values(options).map((option) => ({
  label: option.name || option.label,
  value: option.id,
}));

/** Helper function to get the options for cloud types field */
export const transformcloudTypesOptions = (cloudTypes) => {
  const options = [];
  Object.keys(cloudTypes).forEach((key) => {
    const value = cloudTypes[key];
    options.push({ value: key, label: value });
  });
  return options;
};

/** Helper function to get credantials and restructure its options */
export const loadCloudCredentialOptions = (cloudType) => new Promise((resolve, _reject) => {
  API.get(`/api/authentications?collection_class=${cloudType}&expand=resources&attributes=id,name&sort_by=name&sort_order=ascending`)
    .then(({ resources }) => {
      const options = [...resources.map(({ id, name }) => ({ label: name, value: id }))];
      resolve(options);
    });
});

/** Helper function to set data to show esclation field */
export const setEscalationField = (value, data, setData, prefix) => {
  let options = {};
  Object.keys(data).forEach((key) => {
    if (data[key].id === value) {
      options = data[key].options;
    }
  });

  if (prefix === 'provision') {
    setData((state) => ({ ...state, provisionEsclationDisplay: !!((options && options.become_method && options.become_method !== '')) }));
  } else {
    // setData((state) => ({ ...state, retirementEsclationDisplay: !!((options && options.become_method && options.become_method !== '')) }));
  }
};
