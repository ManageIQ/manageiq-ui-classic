import PropTypes from 'prop-types';

// Entries are stored as [value, description] pairs or as { value, description } objects.
export const valuesShape = PropTypes.arrayOf(PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),
  PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    description: PropTypes.string,
  }),
]));

export const fieldShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  dynamic: PropTypes.bool,
  read_only: PropTypes.bool,
  required: PropTypes.bool,
  values: valuesShape,
  options: PropTypes.shape({}),
  resource_action: PropTypes.shape({}),
  dialog_field_responders: PropTypes.arrayOf(PropTypes.string),
});

export const dialogDataShape = PropTypes.shape({
  label: PropTypes.string,
  dialog_tabs: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    dialog_groups: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      dialog_fields: PropTypes.arrayOf(fieldShape),
    })),
  })),
});

export const categoryShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  description: PropTypes.string,
  single_value: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.shape({})),
});
