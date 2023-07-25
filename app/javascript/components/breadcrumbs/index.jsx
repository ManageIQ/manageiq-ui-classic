/* eslint-disable react/destructuring-assignment */
import React from 'react';
import PropTypes from 'prop-types';
import { Breadcrumbs } from './breadcrumbs';
import { NotificationsToggle } from './notifications-toggle';

export const BreadcrumbsBar = (props) => (
  <>
    <Breadcrumbs {...props} />
    <NotificationsToggle jsRequest={props.jsRequest} />
  </>
);

BreadcrumbsBar.propTypes = {
  jsRequest: PropTypes.bool,
};

BreadcrumbsBar.defaultProps = {
  jsRequest: false,
};
