export const checkForFormChanges = () => {
  let type = 'old'; // 'old' | 'angular' | 'tagging' | 'react'
  let dirty = false;
  const ignore = !!document.getElementById('ignore_form_changes');

  if (ManageIQ.redux.store.getState().FormButtons && ManageIQ.redux.store.getState().FormButtons.in_a_form) {
    type = 'react';
  }

  switch (type) {
    case 'react':
      dirty = !ManageIQ.redux.store.getState().FormButtons.pristine;
      break;

    default:
      dirty = $('#buttons_on').is(':visible');
      break;
  }

  if (dirty && !ignore) {
    return true;
  }

  return false;
};
