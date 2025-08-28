import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Select, SelectItem } from 'carbon-components-react';
import { dynamicFieldDataProps, SD_ACTIONS } from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, fieldTab, dynamicFields,
} from './dynamic-field-configuration';
import { tagControlCategories } from '../data';

/** Component to render a Field. */
const DynamicTagControl = ({ dynamicFieldData: { section, field, fieldPosition }, onFieldAction }) => {
  const { tabId, sectionId } = section;
  const [inputValues, setInputValues] = useState({});

  const inputId = `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-tag-control`;
  const editActionType = SD_ACTIONS.field.edit;

  const refreshEnabledFields = section.fields
    .filter((field) => field.showRefresh)
    .map((field) => ({ value: field.label, label: field.label }));

  const [fieldState, setFieldState] = useState({
    type: 'DialogFieldTagControl',
    position: fieldPosition,
    label: __('Tag Control'),
    name: inputId,
    visible: true,
    categories: [],
    selectedCategory: [],
    subCategories: [],
    fieldsToRefresh: refreshEnabledFields,
    sortBy: 'description',
    sortOrder: 'ascending',
  });

  useEffect(() => {
    if (fieldState.categories.length === 0) {
      tagControlCategories().then((fetchedCategories) => {
        const formattedCategories = fetchedCategories.map((cat) => ({
          label: __(cat.description),
          value: cat.id,
          key: cat.id,
          data: {
            id: cat.id,
            description: cat.description,
            name: cat.name,
            singleValue: cat.single_value,
            subCategories: cat.children.map((subCat) => ({
              id: subCat.id,
              label: __(subCat.description),
            })),
          },
        }));

        setFieldState((prevState) => ({
          ...prevState,
          categories: formattedCategories,
        }));
      });
    }
  }, [fieldState.categories.length]);

  const handleFieldUpdate = (event, updatedFields) => {
    setFieldState((prevState) => ({
      ...prevState,
      ...updatedFields, // update other fields
      categories: prevState.categories, // this is required to retain the options in the dropdown (not the selected category)
    }));

    onFieldAction({ event, type: editActionType, fieldPosition, inputProps: { ...fieldState, ...updatedFields } });
  };

  const fieldActions = (event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete) ? SD_ACTIONS.field.delete : editActionType;

    setInputValues({
      ...inputValues,
      ...inputProps,
    });

    onFieldAction({
      event,
      fieldPosition,
      type,
      inputProps,
    });
  };

  // To reset tabs in Edit Modal based on 'dynamic' switch
  const resetEditModalTabs = (isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  };

  const setCategoryData = (cat, subCat) => {
    setFieldState((prevState) => ({
      ...prevState,
      selectedCategory: cat,
      subCategories: subCat,
    }));
  };

  const ordinaryTagControlOptions = () => ([
    dynamicFields.required,
    dynamicFields.readOnly,
    dynamicFields.visible,
    dynamicFields.categories,
    dynamicFields.singleValue,
    dynamicFields.valueType,
    dynamicFields.sortBy,
    dynamicFields.sortOrder,
    dynamicFields.subCategories,
    dynamicFields.fieldsToRefresh,
  ]);

  const tagControlOptions = () => ({
    name: fieldTab.options,
    fields: ordinaryTagControlOptions(),
  });

  const tagControlEditFields = () => {
    // Removes dynamic switch from the list
    const fieldInfo = fieldInformation();
    fieldInfo.fields = fieldInfo.fields.filter((field) => field.name !== 'dynamic');

    const tabs = [
      fieldInfo,
      tagControlOptions(),
      advanced(),
    ];
    return tabs;
  };

  const sortedItems = () => {
    const { sortBy, sortOrder } = fieldState;
    const sortedArray = [...fieldState.subCategories].sort((a, b) => {
      const valueA = a[sortBy] ? a[sortBy].toString() : '';
      const valueB = b[sortBy] ? b[sortBy].toString() : '';
      // Alphanumeric comparison using localeCompare
      return sortOrder === 'ascending'
        ? valueA.localeCompare(valueB, undefined, { numeric: true, sensitivity: 'base' })
        : valueB.localeCompare(valueA, undefined, { numeric: true, sensitivity: 'base' });
    });
    return sortedArray;
  };

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <Select
          id={fieldState.name}
          labelText={fieldState.label}
          helperText={fieldState.helperText}
        >
          {sortedItems().map((subcat) => (
            <SelectItem key={subcat.id} text={subcat.label} value={subcat.id} />
          ))}
        </Select>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={(event, inputProps) => fieldActions(event, inputProps)}
        fieldConfiguration={tagControlEditFields()}
        dynamicToggleAction={(isDynamic) => resetEditModalTabs(isDynamic)}
        setCategoryData={(cat, subCat) => setCategoryData(cat, subCat)}
      />
    </div>
  );
};

DynamicTagControl.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTagControl;
