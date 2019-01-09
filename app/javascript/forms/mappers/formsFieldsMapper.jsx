import { formFieldsMapper } from '@data-driven-forms/pf3-component-mapper';
import DualListSelect from '../../components/dual-list-select';

const fieldsMapper = {
  ...formFieldsMapper,
  'dual-list-select': DualListSelect,
};

export default fieldsMapper;
