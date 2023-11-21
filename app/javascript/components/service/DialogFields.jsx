import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DIALOG_FIELD_TYPES } from './constants';
import CheckboxField from './dialogFieldItems/CheckboxField';
import DateField from './dialogFieldItems/DateField';
import DateTimeField from './dialogFieldItems/DateTimeField';
import DropDownField from './dialogFieldItems/DropDownField';
import RadioField from './dialogFieldItems/RadioField';
import RefreshField from './RefreshField';
import ServiceContext from './ServiceContext';
import TagField from './dialogFieldItems/TagField';
import TextInputField from './dialogFieldItems/TextInputField';
import TextAreaField from './dialogFieldItems/TextAreaField';

/** Function to render fields based on type */
const renderFieldContent = (field) => {
  switch (field.type) {
    case DIALOG_FIELD_TYPES.checkBox:
      return <CheckboxField field={field} />;
    case DIALOG_FIELD_TYPES.date:
      return <DateField field={field} />;
    case DIALOG_FIELD_TYPES.dateTime:
      return <DateTimeField field={field} />;
    case DIALOG_FIELD_TYPES.dropDown:
      return <DropDownField field={field} />;
    case DIALOG_FIELD_TYPES.radio:
      return <RadioField field={field} />;
    case DIALOG_FIELD_TYPES.tag:
      return <TagField field={field} />;
    case DIALOG_FIELD_TYPES.textBox:
      return <TextInputField field={field} />;
    case DIALOG_FIELD_TYPES.textArea:
      return <TextAreaField field={field} />;
    default:
      return <>{__('Field not supported')}</>;
  }
};

/** Function to render a field. */
const renderFieldItem = (field, data) => {
  const isRefreshing = data.fieldsToRefresh.includes(field.name);
  return (
    <div
      className={classNames('section-field-row', isRefreshing && 'field-refresh-in-progress')}
      key={field.id.toString()}
      id={`section-field-row-${field.name}`}
    >
      <div className="field-item">
        {
          renderFieldContent(field)
        }
      </div>
      <RefreshField field={field} />
    </div>
  );
};

/** Component to render the Fields in the Service/DialogTabs/DialogGroups component */
const DialogFields = ({ dialogFields }) => {
  const { data } = useContext(ServiceContext);
  return (
    <>
      {
        dialogFields.map((field) => (
          field.visible ? renderFieldItem(field, data) : <span key={field.id.toString()} />
        ))
      }
    </>
  );
};

DialogFields.propTypes = {
  dialogFields: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default DialogFields;
