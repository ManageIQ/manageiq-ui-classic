import React from 'react';
import { Icon } from 'patternfly-react';
import { DraggableField } from 'ddf-editor';

import { RawTagControl } from './TagControl';

const EditIcon = <Icon type="fa" name="pencil" fixedWidth />;
const DeleteIcon = <Icon type="fa" name="times" fixedWidth />;

const Component = DraggableField(RawTagControl, EditIcon, DeleteIcon);

const EditableTagControl = ({ FieldProvider, categoryId, ...rest }) => (
  <FieldProvider component={Component} {...rest} />
);

export default EditableTagControl;
