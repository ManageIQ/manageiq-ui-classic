import PropTypes from 'prop-types';
import React from 'react';
import { API, http } from '../../http_api';
import { MiqForm } from './miq-form.jsx';
import { createSchema } from './action.schema.js';

export const ActionForm = MiqForm({
  name: 'ActionForm',
});
