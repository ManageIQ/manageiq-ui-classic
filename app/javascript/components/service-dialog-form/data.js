import React from 'react';
import {
  CheckboxChecked32, RadioButtonChecked32, Time32, StringText32, TextSmallCaps32, CaretDown32, Tag32, Calendar32,
} from '@carbon/icons-react';

export const dragItems = {
  COMPONENT: 'component',
  SECTION: 'section',
  FIELD: 'field',
};

/** Data needed to render the dynamic components on the left hand side of the form. */
export const dynamicComponents = [
  { id: 1, title: 'Text Box', icon: <StringText32 /> },
  { id: 2, title: 'Text Area', icon: <TextSmallCaps32 /> },
  { id: 3, title: 'Check Box', icon: <CheckboxChecked32 /> },
  { id: 4, title: 'Dropdown', icon: <CaretDown32 /> },
  { id: 5, title: 'Radio Button', icon: <RadioButtonChecked32 /> },
  { id: 6, title: 'Datepicker', icon: <Calendar32 /> },
  { id: 7, title: 'Timepicker', icon: <Time32 /> },
  { id: 8, title: 'Tag Control', icon: <Tag32 /> },
];

/** Function which returens the default data for a section under a tab. */
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
