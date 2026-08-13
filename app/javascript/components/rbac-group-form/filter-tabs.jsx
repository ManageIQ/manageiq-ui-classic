import { useFieldApi } from '@@ddf';
import PropTypes from 'prop-types';
import {
  Tabs, TabList, Tab, TabPanels, TabPanel,
} from '@carbon/react';
import CustomerTagsTab from './customer-tags-tab';
import BelongsToTab from './belongs-to-tab';

const FilterTabs = (props) => {
  const {
    input: { value, onChange },
  } = useFieldApi(props);

  const {
    currentTenantName,
    tags,
    hacTree,
    vatTree,
    readOnly,
    superAdminUser,
  } = props;

  const {
    assignedTags = [],
    hacChecked = [],
    vatChecked = [],
    useFilterExpression = false,
    filterExpression = null,
  } = value || {};

  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="rbac-group-filter-tabs">
      <hr />
      <h3>{readOnly ? __('Assigned Filters (read only)') : __('Assign Filters')}</h3>
      <Tabs>
        <TabList aria-label={__('Filter tabs')}>
          <Tab>{sprintf(__('%s Tags'), currentTenantName || __('My Company'))}</Tab>
          <Tab>{__('Clusters, Datastores, Hosts, Managers & Providers')}</Tab>
          <Tab>{__('VMs & Templates')}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <CustomerTagsTab
              tags={tags}
              assignedTags={assignedTags}
              onAssignedTagsChange={(v) => update({ assignedTags: v })}
              useFilterExpression={useFilterExpression}
              onToggle={(v) => {
                if (v) {
                  update({ useFilterExpression: true, assignedTags: [], filterExpression: null });
                } else {
                  update({ useFilterExpression: false, filterExpression: null });
                }
              }}
              filterExpression={filterExpression}
              onExpressionChange={(q, errors) => {
                if (errors.length === 0) {
                  update({ filterExpression: q });
                }
              }}
              readOnly={readOnly}
            />
          </TabPanel>
          <TabPanel>
            <BelongsToTab
              bsTree={hacTree}
              checked={hacChecked}
              onCheckedChange={(v) => update({ hacChecked: v })}
              readOnly={readOnly}
              superAdminUser={superAdminUser}
              limitedMessage={__('This user is limited to the selected items and their children.')}
            />
          </TabPanel>
          <TabPanel>
            <BelongsToTab
              bsTree={vatTree}
              checked={vatChecked}
              onCheckedChange={(v) => update({ vatChecked: v })}
              readOnly={readOnly}
              superAdminUser={superAdminUser}
              limitedMessage={__('This user is limited to the selected folders and their children.')}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

FilterTabs.propTypes = {
  currentTenantName: PropTypes.string,
  tags: PropTypes.shape({
    tags: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    assignedTags: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string })),
    affectedItems: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  hacTree: PropTypes.string,
  vatTree: PropTypes.string,
  readOnly: PropTypes.bool,
  superAdminUser: PropTypes.bool,
};

export default FilterTabs;
