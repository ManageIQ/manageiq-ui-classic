import { http } from '../../http_api';

/** Function to structure the host options. */
const restructureOptions = (data) => {
  if (!data) { return []; } return data.map((item) => (
    ({ label: item.name, value: item.id })
  ));
};

/** Function to return the checkbox value as on/false. */
const getCheckboxValue = (field) => {
  if (field) { return 'on'; }
  return false;
};

/** Function to structure the form submit action data. */
// eslint-disable-next-line camelcase
export const restructureSubmitData = ({ auto_select_host, block_migration, disk_over_commit }) => ({
  auto_select_host: getCheckboxValue(auto_select_host),
  block_migration: getCheckboxValue(block_migration),
  disk_over_commit: getCheckboxValue(disk_over_commit),
});

/** Function to set the values in edit form */
export const setInitialData = (recordId, data, setData) => {
  let disableSelection = true;
  if (recordId) {
    http.get(`/vm_cloud/live_migrate_form_fields/${recordId}`).then(({ hosts }) => {
      if (hosts[0]) { disableSelection = false; }
      setData({
        ...data,
        options: {
          hosts: restructureOptions(hosts),
        },
        disableSelection,
        isLoading: false,
      });
    });
  } else {
    setData({
      ...data,
      disableSelection,
      isLoading: false,
    });
  }
};
