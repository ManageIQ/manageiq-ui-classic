/* eslint-disable react/destructuring-assignment */
import PropTypes from 'prop-types';
import { Breadcrumbs } from './breadcrumbs';
import { NotificationsToggle } from './notifications-toggle';

export const BreadcrumbsBar = ({ jsRequest = false, ...props }) => (
  <>
    <Breadcrumbs {...props} />
    <NotificationsToggle jsRequest={jsRequest} />
  </>
);

BreadcrumbsBar.propTypes = {
  jsRequest: PropTypes.bool,
};
