import { componentTypes } from '@data-driven-forms/react-form-renderer';
import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';

import PlayerFieldSelect from './PlayerFieldSelect';
import TagControl from './TagControl';
import PlayerField from './PlayerField';

const dynamicPlayerFields = {
  ...formFieldsMapper,
  'tag-control': TagControl,
  [componentTypes.SELECT]: PlayerFieldSelect(formFieldsMapper[componentTypes.SELECT]),
};

const previewFieldsMapper = Object.keys(dynamicPlayerFields).reduce((obj, key) => ({
  ...obj,
  [key]: PlayerField(dynamicPlayerFields[key]),
}), {});

export default previewFieldsMapper;
