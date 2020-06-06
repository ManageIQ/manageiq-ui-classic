import React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { NotificationsToggle } from './notifications-toggle';

export const BreadcrumbsBar = (props) => (
  <>
    <Breadcrumbs {...props} />
    <NotificationsToggle />
  </>
);
