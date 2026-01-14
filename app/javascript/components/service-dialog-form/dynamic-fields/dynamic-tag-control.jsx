import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Select, SelectItem } from 'carbon-components-react';
import {
  dynamicFieldDataProps,
  SD_ACTIONS,
  getFieldValues,
  getRefreshEnabledFields,
  sortItems,
} from '../helper';
import DynamicFieldActions from '../dynamic-field-actions';
import {
  fieldInformation, advanced, fieldTab, dynamicFields,
} from './dynamic-field-configuration';
import { tagControlCategories } from '../data';

/**
 * DynamicTagControl - A component to render a tag control field with category selection
 *
 * @param {Object} props - Component props
 * @param {Object} props.dynamicFieldData - Data for the dynamic field
 * @param {Function} props.onFieldAction - Callback for field actions
 */
const DynamicTagControl = ({ dynamicFieldData, onFieldAction }) => {
  const { section, field, fieldPosition } = dynamicFieldData;
  const { tabId, sectionId, fields } = section;
  const editActionType = SD_ACTIONS.field.edit;

  // Generate unique ID for the tag control
  const inputId = useMemo(() =>
    `tab-${tabId}-section-${sectionId}-field-${fieldPosition}-tag-control`,
    [tabId, sectionId, fieldPosition]
  );

  // Get fields that have refresh enabled
  const refreshEnabledFields = useMemo(() =>
    getRefreshEnabledFields(fields),
    [fields]
  );

  // Initialize field state with values from the helper function
  const fieldValues = useMemo(() => getFieldValues(field), [field]);

  const [fieldState, setFieldState] = useState({
    ...fieldValues,
    position: fieldPosition,
    name: fieldValues.name || inputId,
    categories: [],
    selectedCategory: [],
    subCategories: [],
    fieldsToRefresh: refreshEnabledFields,
    sortBy: fieldValues.sortBy,
    sortOrder: fieldValues.sortOrder,
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

  /**
   * Updates field state and notifies parent component
   * @param {Event|string} event - Event object or action string
   * @param {Object} updatedFields - Fields to update
   */
  const handleFieldUpdate = useCallback((event, updatedFields) => {
    setFieldState((prevState) => {
      const newState = {
        ...prevState,
        ...updatedFields,
        categories: prevState.categories, // this is required to retain the options in the dropdown (not the selected category)
      };

      // Notify parent component about the change
      onFieldAction({
        event,
        type: editActionType,
        fieldPosition,
        inputProps: newState
      });

      return newState;
    });
  }, [editActionType, fieldPosition, onFieldAction]);

  /**
   * Handles field actions like delete
   * @param {string} event - Action type
   * @param {Object} inputProps - Field properties
   */
  const handleFieldActions = useCallback((event, inputProps) => {
    const type = (event === SD_ACTIONS.field.delete)
      ? SD_ACTIONS.field.delete
      : editActionType;

    onFieldAction({
      event,
      fieldPosition,
      type,
      inputProps,
    });
  }, [editActionType, fieldPosition, onFieldAction]);

  /**
   * Updates field state when dynamic property changes
   * @param {boolean} isDynamic - Whether the field is dynamic
   */
  const handleDynamicToggle = useCallback((isDynamic) => {
    setFieldState((prevState) => ({ ...prevState, dynamic: isDynamic }));
  }, []);

  /**
   * Sets the selected category and its subcategories
   * @param {Object} cat - Selected category
   * @param {Array} subCat - Subcategories of the selected category
   */
  const handleCategoryChange = useCallback((cat, subCat) => {
    setFieldState((prevState) => ({
      ...prevState,
      selectedCategory: cat,
      subCategories: subCat,
    }));
  }, []);

  /**
   * Returns sorted subcategories based on sortBy and sortOrder
   * @returns {Array} Sorted subcategories array
   */
  const sortedItems = useMemo(() =>
    sortItems(fieldState.subCategories, fieldState.sortBy, fieldState.sortOrder),
    [fieldState.subCategories, fieldState.sortBy, fieldState.sortOrder]
  );

  /**
   * Define tag control edit fields configuration
   */
  const tagControlEditFields = useMemo(() => {
    // Removes dynamic switch from the list
    const fieldInfo = fieldInformation();
    fieldInfo.fields = fieldInfo.fields.filter((field) => field.name !== 'dynamic');

    const ordinaryOptions = [
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
    ];

    return [
      fieldInfo,
      {
        name: fieldTab.options,
        fields: ordinaryOptions,
      },
      advanced(),
    ];
  }, []);

  return (
    <div className="dynamic-form-field">
      <div className="dynamic-form-field-item">
        <Select
          id={fieldState.name}
          labelText={fieldState.label}
          helperText={fieldState.helperText}
          disabled={fieldState.readOnly}
          aria-label={fieldState.label || __('Tag control field')}
        >
          {sortedItems.map((subcat) => (
            <SelectItem
              key={subcat.id}
              text={subcat.label}
              value={subcat.id}
            />
          ))}
        </Select>
      </div>
      <DynamicFieldActions
        componentId={field.componentId}
        fieldProps={fieldState}
        updateFieldProps={handleFieldUpdate}
        dynamicFieldAction={handleFieldActions}
        fieldConfiguration={tagControlEditFields}
        dynamicToggleAction={handleDynamicToggle}
        setCategoryData={handleCategoryChange}
      />
    </div>
  );
};

DynamicTagControl.propTypes = {
  dynamicFieldData: dynamicFieldDataProps.isRequired,
  onFieldAction: PropTypes.func.isRequired,
};

export default DynamicTagControl;
