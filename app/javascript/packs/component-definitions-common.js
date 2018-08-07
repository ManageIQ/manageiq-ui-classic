import React from 'react';
import { TagGroup, TableListView, GenericGroup } from '@manageiq/react-ui-components/dist/textual_summary';
import TextualSummaryWrapper from '../react/textual_summary_wrapper';
import TableListViewWrapper from '../react/table_list_view_wrapper';
import GenericGroupWrapper from '../react/generic_group_wrapper';
import VmSnapshotFormComponent from '../components/vm-snapshot-form-component';
import FormButtonsRedux from '../forms/form-buttons-redux';

/**
* Add component definitions to this file.
* example of component definition:
* ManageIQ.component.addReact('ComponentName', props => <ComponentName {...props} />);
*/

ManageIQ.component.addReact('TagGroup', props => <TagGroup {...props} />);
ManageIQ.component.addReact('TableListView', TableListView);
ManageIQ.component.addReact('TableListViewWrapper', TableListViewWrapper);
ManageIQ.component.addReact('GenericGroup', GenericGroup);
ManageIQ.component.addReact('GenericGroupWrapper', GenericGroupWrapper);
ManageIQ.component.addReact('TextualSummaryWrapper', TextualSummaryWrapper);
ManageIQ.component.addReact('VmSnapshotFormComponent', VmSnapshotFormComponent);
ManageIQ.component.addReact('FormButtonsRedux', FormButtonsRedux);
