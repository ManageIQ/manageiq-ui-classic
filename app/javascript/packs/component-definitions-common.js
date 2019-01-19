import React from 'react';

import '@manageiq/react-ui-components/dist/tagging.css';
import { TagGroup, TableListView, GenericGroup } from '@manageiq/react-ui-components/dist/textual_summary';
import { TagView } from '@manageiq/react-ui-components/dist/tagging';

import Breadcrumbs from '../components/breadcrumbs';
import CatalogForm from '../components/catalog-form/catalog-form';
import CloudNetworkForm from '../components/cloud-network-form/cloud-network-form';
import CloudTenantForm from '../components/cloud-tenant-form/cloud-tenant-form';
import CopyDashboardForm from '../components/copy-dashboard-form/copy-dashboard-form';
import CopyCatalogForm from '../components/copy-catalog-form/copy-catalog-form';
import FlavorForm from '../components/flavor-form/flavor-form';
import FormButtonsRedux from '../forms/form-buttons-redux';
import GenericGroupWrapper from '../react/generic_group_wrapper';
import GraphQLExplorer from '../graphql-explorer';
import ImportDatastoreViaGit from '../components/automate-import-export-form/import-datastore-via-git';
import MiqAboutModal from '../components/miq-about-modal';
import OrcherstrationTemplateForm from '../components/orchestration-template/orcherstration-template-form';
import RemoveCatalogItemModal from '../components/remove-catalog-item-modal';
import ServiceDialogFromOtForm from '../components/orchestration-template/service-dialog-from-ot';
import ServiceForm from '../components/service-form';
import SetServiceOwnershipForm from '../components/set-service-ownership-form';
import TableListViewWrapper from '../react/table_list_view_wrapper';
import TaggingWrapperConnected from '../components/taggingWrapper';
import TextualSummaryWrapper from '../react/textual_summary_wrapper';
import VmServerRelationshipForm from '../components/vm-server-relationship-form';
import VmSnapshotFormComponent from '../components/vm-snapshot-form-component';
import WorkersForm from '../components/workers-form/workers-form';

/**
* Add component definitions to this file.
* example of component definition:
* ManageIQ.component.addReact('ComponentName', props => <ComponentName {...props} />);
*/

ManageIQ.component.addReact('Breadcrumbs', Breadcrumbs);
ManageIQ.component.addReact('CatalogForm', CatalogForm);
ManageIQ.component.addReact('CloudNetworkForm', CloudNetworkForm);
ManageIQ.component.addReact('CloudTenantForm', CloudTenantForm);
ManageIQ.component.addReact('CopyCatalogForm', CopyCatalogForm);
ManageIQ.component.addReact('CopyDashboardForm', CopyDashboardForm);
ManageIQ.component.addReact('FlavorForm', FlavorForm);
ManageIQ.component.addReact('FormButtonsRedux', FormButtonsRedux);
ManageIQ.component.addReact('GenericGroup', GenericGroup);
ManageIQ.component.addReact('GenericGroupWrapper', GenericGroupWrapper);
ManageIQ.component.addReact('GraphQLExplorer', GraphQLExplorer);
ManageIQ.component.addReact('ImportDatastoreViaGit', ImportDatastoreViaGit);
ManageIQ.component.addReact('MiqAboutModal', MiqAboutModal);
ManageIQ.component.addReact('OrcherstrationTemplateForm', OrcherstrationTemplateForm);
ManageIQ.component.addReact('RemoveCatalogItemModal', RemoveCatalogItemModal);
ManageIQ.component.addReact('ServiceDialogFromOtForm', ServiceDialogFromOtForm);
ManageIQ.component.addReact('ServiceForm', ServiceForm);
ManageIQ.component.addReact('SetServiceOwnershipForm', SetServiceOwnershipForm);
ManageIQ.component.addReact('TableListView', TableListView);
ManageIQ.component.addReact('TableListViewWrapper', TableListViewWrapper);
ManageIQ.component.addReact('TagGroup', props => <TagGroup {...props} />);
ManageIQ.component.addReact('TagView', TagView);
ManageIQ.component.addReact('TaggingWrapperConnected', TaggingWrapperConnected);
ManageIQ.component.addReact('TextualSummaryWrapper', TextualSummaryWrapper);
ManageIQ.component.addReact('VmServerRelationshipForm', VmServerRelationshipForm);
ManageIQ.component.addReact('VmSnapshotFormComponent', VmSnapshotFormComponent);
ManageIQ.component.addReact('WorkersForm', WorkersForm);
ManageIQ.component.addReact('FlavorForm', FlavorForm);
ManageIQ.component.addReact('ImportDatastoreViaGit', ImportDatastoreViaGit);
ManageIQ.component.addReact('VmServerRelationshipForm', VmServerRelationshipForm);
ManageIQ.component.addReact('CatalogForm', CatalogForm);
ManageIQ.component.addReact('Breadcrumbs', Breadcrumbs);
ManageIQ.component.addReact('TaggingWrapperConnected', TaggingWrapperConnected);
ManageIQ.component.addReact('ReportDataTable', ReportDataTable);
