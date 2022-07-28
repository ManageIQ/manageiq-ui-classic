import { componentTypes } from '@@ddf';

const serverControlsList = (serverControls) => serverControls[0].value.map((item) => ({
  component: componentTypes.SWITCH,
  label: item.label,
  name: item.name,
  initialValue: item.checked,
}));

export const serverControlsSchema = ({ serverControls }) => ({
  component: componentTypes.SUB_FORM,
  id: 'serverControls',
  name: 'serverControls',
  title: __('Server Controls'),
  fields: serverControlsList(serverControls),
});
