import { componentTypes } from '@@ddf';
import { scheduleFormFields } from './schedule-form-fields';
import type {
  MiqFormSchemaType,
  SubFormType,
  FormState,
  SetStateAction,
  Dispatch,
  FilterOptionType,
} from './schedule-form-types';

export const createSchema = (
  actionOptions: string[][] | undefined,
  filterOptions: FilterOptionType[],
  data: FormState,
  setData: Dispatch<SetStateAction<FormState>>
): MiqFormSchemaType => {
  const formFields = scheduleFormFields(
    actionOptions,
    filterOptions,
    setData,
    data
  );
  const fields: SubFormType[] = [
    {
      component: componentTypes.SUB_FORM,
      name: 'BasicInformation',
      title: __('Basic Information'),
      className: 'schedule_form',
      fields: formFields,
    },
  ];
  return { fields };
};
