import React from 'react';
import {
  CheckboxChecked, RadioButtonChecked, Time, StringText, TextSmallCaps, CaretDown, Tag, Calendar,
} from '@carbon/react/icons';
import { formattedCatalogPayload } from './helper';

export const dragItems = {
  COMPONENT: 'component',
  SECTION: 'section',
  FIELD: 'field',
  TAB: 'tab',
};

/** Data needed to render the dynamic components on the left hand side of the form. */
export const dynamicComponents = [
  { id: 1, title: 'Text Box', icon: <StringText size={32} /> },
  { id: 2, title: 'Text Area', icon: <TextSmallCaps size={32} /> },
  { id: 3, title: 'Check Box', icon: <CheckboxChecked size={32} /> },
  { id: 4, title: 'Dropdown', icon: <CaretDown size={32} /> },
  { id: 5, title: 'Radio Button', icon: <RadioButtonChecked size={32} /> },
  { id: 6, title: 'Datepicker', icon: <Calendar size={32} /> },
  { id: 7, title: 'Timepicker', icon: <Time size={32} /> },
  { id: 8, title: 'Tag Control', icon: <Tag size={32} /> },
];

/** Function which returns the default data for a section under a tab. */
export const defaultSectionContents = (tabId, sectionId) => ({
  tabId,
  sectionId,
  title: 'New Section',
  fields: [],
  order: 0,
});

/** Function which returns the default data for a tab with default section. */
export const defaultTabContents = (tabId) => ({
  tabId,
  name: tabId === 0 ? __('New Tab') : __(`New Tab ${tabId}`),
  sections: [defaultSectionContents(tabId, 0)],
});

/** Function to create a dummy tab for creating new tabs. */
export const createNewTab = () => ({
  tabId: 'new',
  name: 'Create Tab',
  sections: [],
});

export const tagControlCategories = async() => {
  try {
    const { resources } = await API.get('/api/categories?expand=resources&attributes=id,name,description,single_value,children');

    return resources;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

// data has formfields and list (as of now); no dialog related general info - this is needed
export const saveServiceDialog = (data) => {
  const payload = formattedCatalogPayload(data);

  return API.post('/api/service_dialogs', payload, {
    skipErrors: true,
  }).then(() => {
    window.location.href = '/miq_ae_customization/explorer';
  });
};
