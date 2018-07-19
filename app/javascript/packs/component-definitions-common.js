import React from 'react';
import { TagGroup, TableListView, GenericGroup } from '@manageiq/react-ui-components/dist/textual_summary';
import TextualSummaryWrapper from '../react/textual_summary_wrapper';
import TableListViewWrapper from '../react/table_list_view_wrapper';
import GenericGroupWrapper from '../react/generic_group_wrapper';
import { addReact } from '../miq-component/helpers';
import VmSnapshotFormComponent from '../components/vm-snapshot-form-component';
import FormButtonsRedux from '../forms/form-buttons-redux';

/**
* Add component definitions to this file.
* example of component definition:
* ManageIQ.component.addReact('ComponentName', props => <ComponentName {...props} />);
*/

addReact('TagGroup', props => <TagGroup {...props} />);
addReact('TableListView', TableListView);
addReact('TableListViewWrapper', TableListViewWrapper);
addReact('GenericGroup', GenericGroup);
addReact('GenericGroupWrapper', GenericGroupWrapper);
addReact('TextualSummaryWrapper', TextualSummaryWrapper);
addReact('VmSnapshotFormComponent', VmSnapshotFormComponent);
addReact('FormButtonsRedux', FormButtonsRedux);
