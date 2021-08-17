import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { prepareProps } from '@data-driven-forms/carbon-component-mapper';
import { MultiSelect } from 'carbon-components-react';
import { useFieldApi } from '@@ddf';

const MultiSelectWithSelectAll = (props) => {
  const {
    initialValues, options, id, titleText, label, placeholder,
    ...rest
  } = useFieldApi(prepareProps(props));

  const [defaultValues, setDefaultValues] = useState(initialValues || []);
  const [allitems, setAllItems] = useState(defaultValues.length === options.length);

  const loadvalues = (values) => {
    let stop = false;
    if (!allitems && values.selectedItems.length === options.length - 1) {
      setAllItems(true);
      values.selectedItems.push({ value: 'all', label: 'SELECT ALL' });
      setDefaultValues(options);
    } else {
      values.selectedItems.forEach((value) => {
        if (value.value === 'all') {
          setDefaultValues(options);
          setAllItems(true);
          stop = true;
        } else {
          if (allitems && !stop) {
            setDefaultValues([]);
          } else {
            const tempItems = [];
            for (let i = 0; i < values.selectedItems.length; i += 1) {
              if (values.selectedItems[i].value !== 'all') {
                tempItems.push(values.selectedItems[i]);
              }
            }
            setDefaultValues(tempItems);
          }
          setAllItems(false);
        }
      });
    }
  };

  // TODO: The select all is counted as one of the elements in the select list
  // so the number of selected elements is always 1 more when select all is selected.
  // Instead this should be fixed to display All when select all is selected.

  return (
    <MultiSelect.Filterable
      id={id}
      titleText={titleText}
      items={options}
      placeholder={placeholder}
      label={label}
      key={allitems ? 'all-items' : 'few-items'}
      sortItems={(items) => items}
      initialSelectedItems={defaultValues}
      onChange={(items) => loadvalues(items)}
      itemToString={(item) => item.label}
      selectionFeedback="top-after-reopen"
      {...rest}
    />
  );
};

MultiSelectWithSelectAll.propTypes = {
  initialValues: PropTypes.arrayOf(PropTypes.any),
  options: PropTypes.arrayOf(PropTypes.any).isRequired,
};

MultiSelectWithSelectAll.defaultProps = {
  initialValues: [],
};

export default MultiSelectWithSelectAll;
