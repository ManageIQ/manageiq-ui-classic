import { componentMapper } from '@data-driven-forms/carbon-component-mapper';
import { componentTypes } from '@@ddf';
import AsyncCredentials from '../../components/async-credentials/async-credentials';
import EditPasswordField from '../../components/async-credentials/edit-password-field';
import FileUploadComponent from '../../components/file-upload';
import PasswordField from '../../components/async-credentials/password-field';
import Select from '../../components/select';
import CodeEditor from '../../components/code-editor';
import { TreeViewSelector } from '../../components/tree-view';
import CheckboxTreeComponent from '../../components/tree-view/checkbox_tree';
import FontIconPicker from '../../components/fonticon-picker';
import FontIconPickerDdf from '../../components/fonticon-picker/font-icon-picker-ddf';
import KeyValueListComponent from '../../components/key-value-list';
import EmbeddedAutomateEntryPoint from '../../components/embedded-automate-entry-point';
import EmbeddedWorkflowEntryPoint from '../../components/embedded-workflow-entry-point';
import SelectedGroupsList from '../../components/selected-groups-list';
import SortableList from '../../components/sortable-list';
import ApCategoryTab from '../../components/ap-form/category-tab';
import ApFileTab from '../../components/ap-form/file-tab';
import ApRegistryTab from '../../components/ap-form/registry-tab';
import ApEventLogTab from '../../components/ap-form/event-log-tab';

const mapper = {
  ...componentMapper,
  'code-editor': CodeEditor,
  'embedded-automate-entry-point': EmbeddedAutomateEntryPoint,
  'embedded-workflow-entry-point': EmbeddedWorkflowEntryPoint,
  'edit-password-field': EditPasswordField,
  'file-upload': FileUploadComponent,
  'key-value-list': KeyValueListComponent,
  'password-field': PasswordField,
  'validate-credentials': AsyncCredentials,
  'selected-groups-list': SelectedGroupsList,
  'sortable-list': SortableList,
  'tree-selector': TreeViewSelector,
  [componentTypes.SELECT]: Select,
  'font-icon-picker': FontIconPicker,
  'font-icon-picker-ddf': FontIconPickerDdf, // used for react form pages
  'checkbox-tree': CheckboxTreeComponent,
  'ap-category-tab': ApCategoryTab,
  'ap-file-tab': ApFileTab,
  'ap-registry-tab': ApRegistryTab,
  'ap-event-log-tab': ApEventLogTab,
};

export default mapper;
