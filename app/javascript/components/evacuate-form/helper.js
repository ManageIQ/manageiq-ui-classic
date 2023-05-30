import { http } from '../../http_api';

/** Function to structure the host options. */
const restructureOptions = (data) => {
  if (!data) { return []; } return data.map((item) => (
    ({ label: item.name, value: item.id })
  ));
};

/** Function to set the values in edit form */
export const setInitialData = (recordId, data, setData) => {
  let disableSelection = true;
  if (recordId) {
    http.get(`/vm_cloud/evacuate_form_fields/${recordId}`).then(({ hosts }) => {
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
