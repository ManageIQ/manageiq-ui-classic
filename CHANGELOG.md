# Change Log

All notable changes to this project will be documented in this file.

## Unreleased - as of Sprint 52 end 2017-01-14

### Added
- Moved Automate tabs down 1 level to "Automation / Automate" ([#156](https://github.com/ManageIQ/manageiq-providers-azure/pull/Moved Automate tabs down 1 level to "Automation / Automate"))
- Rename Automate to Automation in UI ([#150](https://github.com/ManageIQ/manageiq-providers-azure/pull/Rename Automate to Automation in UI))
- Use decorators for certain TreeNode icons/images ([#118](https://github.com/ManageIQ/manageiq-providers-azure/pull/Use decorators for certain TreeNode icons/images))
- Add edit functionality for generic object UI ([#72](https://github.com/ManageIQ/manageiq-providers-azure/pull/Add edit functionality for generic object UI))
- Automatic detection of hawkular endpoint ([#37](https://github.com/ManageIQ/manageiq-providers-azure/pull/Automatic detection of hawkular endpoint))
- Add alerts on container nodes in control explorer ([#31](https://github.com/ManageIQ/manageiq-providers-azure/pull/Add alerts on container nodes in control explorer))
- Ad hoc metrics for OPS Remove tooltips and add spinners ([#27](https://github.com/ManageIQ/manageiq-providers-azure/pull/[Ad hoc metrics for OPS] Remove tooltips and add spinners))
- UI for add/remove interface on network router ([#60](https://github.com/ManageIQ/manageiq-providers-azure/pull/UI for add/remove interface on network router))

### Changed
- Clean up TreeNode:: title and tooltip evaluation escaping and gettext ([#74](https://github.com/ManageIQ/manageiq-providers-azure/pull/Clean up TreeNode:: title and tooltip evaluation escaping and gettext))
- Ops_rbac - group detail - don't render trees that are not visible ([#68](https://github.com/ManageIQ/manageiq-providers-azure/pull/ops_rbac - group detail - don't render trees that are not visible))
- Resolve symlinks before evaluating spec/manageiq/Gemfile ([#32](https://github.com/ManageIQ/manageiq-providers-azure/pull/Resolve symlinks before evaluating spec/manageiq/Gemfile))
- Improve UX for attaching Openstack cloud volumes to instances ([#110](https://github.com/ManageIQ/manageiq-providers-azure/pull/Improve UX for attaching Openstack cloud volumes to instances))
- Use ViewHelper instead of <tags> in policy simulation results tree ([#77](https://github.com/ManageIQ/manageiq-providers-azure/pull/Use ViewHelper instead of <tags> in policy simulation results tree))
- Merge all timeline accordions under a single tree ([#63](https://github.com/ManageIQ/manageiq-providers-azure/pull/Merge all timeline accordions under a single tree))

### Fixed

- Confirmation popup is not needed on timelines screen. ([#146](https://github.com/ManageIQ/manageiq-providers-azure/pull/Confirmation popup is not needed on timelines screen.))
- Fixed location of tooltip on topology screens ([#145](https://github.com/ManageIQ/manageiq-providers-azure/pull/Fixed location of tooltip on topology screens.))
- Filter Recent VMs/Hosts charts by provider ([#144](https://github.com/ManageIQ/manageiq-providers-azure/pull/Filter Recent VMs/Hosts charts by provider))
- Fix missing tree view in Datastore Clusters accordion ([#129](https://github.com/ManageIQ/manageiq-providers-azure/pull/Fix missing tree view in Datastore Clusters accordion))
- Display flash message on import/export custom report ([#125](https://github.com/ManageIQ/manageiq-providers-azure/pull/Display flash message on import/export custom report))
- Policy Event must have at least one action assigned to it ([#112](https://github.com/ManageIQ/manageiq-providers-azure/pull/Policy Event must have at least one action assigned to it))
- Remove unnecessary @config_tab variable ([#104](https://github.com/ManageIQ/manageiq-providers-azure/pull/Remove unnecessary @config_tab variable))
- Make created filters in Datastores visible ([#98](https://github.com/ManageIQ/manageiq-providers-azure/pull/Make created filters in Datastores visible and fix commiting filters))
- Cloud Subnet: Filtering networks by ems_id ([#61](https://github.com/ManageIQ/manageiq-providers-azure/pull/Cloud Subnet: Filtering networks by ems_id))
- Enable provision instances button via providers ([#53](https://github.com/ManageIQ/manageiq-providers-azure/pull/Enable provision instances button via providers))
- Fix units in C&U grouped charts ([#41](https://github.com/ManageIQ/manageiq-providers-azure/pull/Fix units in C&U grouped charts))
