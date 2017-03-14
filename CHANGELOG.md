# Change Log

All notable changes to this project will be documented in this file.

## Unreleased - as of Sprint 56 end 2017-03-13

### [Added](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+56+Ending+Mar+13%2C+2017%22+label%3Aenhancement)

- Automate
  - UI changes needed for embedded ansible models [(#584)](https://github.com/ManageIQ/manageiq-ui-classic/pull/584)
  - Display the credentials for the embedded tower in the playbook catalog UI dropdowns [(#627)](https://github.com/ManageIQ/manageiq-ui-classic/pull/627)
- Compute
  - Cloud
    - Display AWS instance labels in the Summary screen [(#631)](https://github.com/ManageIQ/manageiq-ui-classic/pull/631)
    - Support operation `delete` on CloudObjectStoreContainer [(#420)](https://github.com/ManageIQ/manageiq-ui-classic/pull/420)
  - Containers
    - Dashboard: Show hourly and realtime trends [(#519)](https://github.com/ManageIQ/manageiq-ui-classic/pull/519)
    - Adding External Logging Link for Containers Providers [(#489)](https://github.com/ManageIQ/manageiq-ui-classic/pull/489)
    - Container SSA: warn if no smartproxy/state role [(#273)](https://github.com/ManageIQ/manageiq-ui-classic/pull/273)
    - Topology for Container Projects [(#120)](https://github.com/ManageIQ/manageiq-ui-classic/pull/120)
    - TLS verification & custom CA UI for oVirt and Container providers [(#450)](https://github.com/ManageIQ/manageiq-ui-classic/pull/450)
  - Infrastructure
    - Show vms in infra topology [(#564)](https://github.com/ManageIQ/manageiq-ui-classic/pull/564)
    - Physical infra pages [(#196)](https://github.com/ManageIQ/manageiq-ui-classic/pull/196)
- Control: Add live search to the service template id dropdown for Run Ansible Playbook action [(#512)](https://github.com/ManageIQ/manageiq-ui-classic/pull/512)
- Graphics
  - Add icon for ansible credentials [(#525)](https://github.com/ManageIQ/manageiq-ui-classic/pull/525)
  - Textual Summaries - textual\_*\_ icon - support for fonticons decorators [(#603)](https://github.com/ManageIQ/manageiq-ui-classic/pull/603)
- Middleware: Enable Xa capability for Middleware  Datatsource options [(#149)](https://github.com/ManageIQ/manageiq-ui-classic/pull/149)
- Services
  - Added remove resources option in the form on Retirement tab [(#629)](https://github.com/ManageIQ/manageiq-ui-classic/pull/629)
  - Get list of Repositories using Embedded Provider [(#565)](https://github.com/ManageIQ/manageiq-ui-classic/pull/565)
- Settings: Add custom logo capability to the ‘About’ modal [(#566)](https://github.com/ManageIQ/manageiq-ui-classic/pull/566)
- Storage
  - Allow cloud volume to provide list of supported VMs for attachment [(#601)](https://github.com/ManageIQ/manageiq-ui-classic/pull/601)
  - Support operation `delete` on CloudObjectStoreObject [(#497)](https://github.com/ManageIQ/manageiq-ui-classic/pull/497)

### [Changed](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+56+Ending+Mar+13%2C+2017%22+label%3Aenhancement)

- Services
  - Fixed class names to get objects using EmbeddedAnsible tower. [(#659)](https://github.com/ManageIQ/manageiq-ui-classic/pull/659)
  - Changed all drop downs in form to sort by name in ascending order. [(#597)](https://github.com/ManageIQ/manageiq-ui-classic/pull/597)
- Storage
  - Extend form for creating new cloud volumes [(#517)](https://github.com/ManageIQ/manageiq-ui-classic/pull/517)
  - Allow any EMS to create cloud volume [(#600)](https://github.com/ManageIQ/manageiq-ui-classic/pull/600)


### [Fixed](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+56+Ending+Mar+13%2C+2017%22+label%3Abug)

- Automate
  - Allow access to embedded ansible anytime a feature is allowed [(#640)](https://github.com/ManageIQ/manageiq-ui-classic/pull/640)
  - Decorator update for inventory and credentials [(#538)](https://github.com/ManageIQ/manageiq-ui-classic/pull/538)
  - Fix for unable to import service dialog from yaml  [(#616)](https://github.com/ManageIQ/manageiq-ui-classic/pull/616)
- Compute
  - Containers: Fix overlapping in Container Image summary screen [(#272)](https://github.com/ManageIQ/manageiq-ui-classic/pull/272)
  - Infrastructure
    - Datastore selection flash message fix [(#559)](https://github.com/ManageIQ/manageiq-ui-classic/pull/559)
    - Create snapshot with no active snapshot [(#598)](https://github.com/ManageIQ/manageiq-ui-classic/pull/598)
- Middleware: Use the proper EAP icon for EAP 6.4 instead of using default icon [(#537)](https://github.com/ManageIQ/manageiq-ui-classic/pull/537)
- Networks: Show also non vpc vms in network topology [(#510)](https://github.com/ManageIQ/manageiq-ui-classic/pull/510)
- UI
  - Fix the displaying of the flash message(s) in policy list [(#628)](https://github.com/ManageIQ/manageiq-ui-classic/pull/628)
  - Fix error when creating filter in Networks page [(#494)](https://github.com/ManageIQ/manageiq-ui-classic/pull/494)
- Services
  - Fixed 'Catalog' should not be a required field [(#514)](https://github.com/ManageIQ/manageiq-ui-classic/pull/514)
  - Fixed Error handling of REST API calls. [(#490)](https://github.com/ManageIQ/manageiq-ui-classic/pull/490)
- Textual Summaries
  - TextualMultilabel: fix additional_table_class. [(#609)](https://github.com/ManageIQ/manageiq-ui-classic/pull/609)
  - Container node condition displayed with multilabel [(#541)](https://github.com/ManageIQ/manageiq-ui-classic/pull/541)

## Unreleased - as of Sprint 55 end 2017-02-27

### [Added](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+55+Ending+Feb+27%2C+2017%22+label%3Aenhancement)

- UI for Ansible Tower Playbooks & Repositories [(#283)](https://github.com/ManageIQ/manageiq-ui-classic/pull/283)
- Ansible Playbook Control UI [(#399)](https://github.com/ManageIQ/manageiq-ui-classic/pull/399)
- Enable container start pages [(#380)](https://github.com/ManageIQ/manageiq-ui-classic/pull/380)
- Server group power ops ui [(#286)](https://github.com/ManageIQ/manageiq-ui-classic/pull/286)
- Angular Form with REST API calls for Playbook Service Template type. [(#262)](https://github.com/ManageIQ/manageiq-ui-classic/pull/262)
- Add checkbox for chargeback without C & U [(#366)](https://github.com/ManageIQ/manageiq-ui-classic/pull/366)
- Use task queue for update stack operation [(#373)](https://github.com/ManageIQ/manageiq-ui-classic/pull/373)
- Use task queue for VM actions [(#307)](https://github.com/ManageIQ/manageiq-ui-classic/pull/307)
- Add class decorator support [(#237)](https://github.com/ManageIQ/manageiq-ui-classic/pull/237)
- Added live search to drop downs for services [(#462)](https://github.com/ManageIQ/manageiq-ui-classic/pull/462)
- Updated summary screen to show details of Playbook type template [(#456)](https://github.com/ManageIQ/manageiq-ui-classic/pull/456)
- UI for Ansible Credentials [(#452)](https://github.com/ManageIQ/manageiq-ui-classic/pull/452)
- Add subscription backlog to replication tab [(#443)](https://github.com/ManageIQ/manageiq-ui-classic/pull/443)
- Use table name when generating SQL to filter tasks on `Tasks` screen  [(#344)](https://github.com/ManageIQ/manageiq-ui-classic/pull/344)

### [Changed](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+55+Ending+Feb+27%2C+2017%22+label%3Aenhancement)
- Update labels for playbook catalog  action [(#424)](https://github.com/ManageIQ/manageiq-ui-classic/pull/424)
- Removed Arbitration Profiles from classic UI [(#426)](https://github.com/ManageIQ/manageiq-ui-classic/pull/426)
- update/replacePartials - carp when element doesn't exist [(#422)](https://github.com/ManageIQ/manageiq-ui-classic/pull/422)
- Disable VNC Console for VMs hosted on ESXi 6.5 or greater [(#355)](https://github.com/ManageIQ/manageiq-ui-classic/pull/355)
- Skip protect_from_forgery for #authenticate [(#451)](https://github.com/ManageIQ/manageiq-ui-classic/pull/451)
- Make sure bucket duration is not less the 20 minutes [(#385)](https://github.com/ManageIQ/manageiq-ui-classic/pull/385)

### [Fixed](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+55+Ending+Feb+27%2C+2017%22+label%3Abug)

- Make cascading auto-refresh behavior more consistent with how it was previously [(#433)](https://github.com/ManageIQ/manageiq-ui-classic/pull/433)
- Catalog Items - show all items regardless of display=true [(#446)](https://github.com/ManageIQ/manageiq-ui-classic/pull/446)
- Fix grouping in CU charts [(#335)](https://github.com/ManageIQ/manageiq-ui-classic/pull/335)
- Change ordering of Saved Chargeback reports [(#454)](https://github.com/ManageIQ/manageiq-ui-classic/pull/454)
- Fix assets names for Amazon storage managers [(#428)](https://github.com/ManageIQ/manageiq-ui-classic/pull/428)
- Fix adding Kubernetes provider [(#314)](https://github.com/ManageIQ/manageiq-ui-classic/pull/314)
- Dont allow to edit the name of Default rate for container images [(#269)](https://github.com/ManageIQ/manageiq-ui-classic/pull/269)
- Fix Snapshot revert [(#411)](https://github.com/ManageIQ/manageiq-ui-classic/pull/411)
- Fix to render pagination and listnav on list view. [(#436)](https://github.com/ManageIQ/manageiq-ui-classic/pull/436)
- Revert fix for BZ 1396068 as it breaks VMware [(#409)](https://github.com/ManageIQ/manageiq-ui-classic/pull/409)
- Display nested Resource Pools in summary page [(#255)](https://github.com/ManageIQ/manageiq-ui-classic/pull/255)
- Remove disabling of 'instance_retire' button [(#453)](https://github.com/ManageIQ/manageiq-ui-classic/pull/453)
- Allow to remove super administrator user [(#416)](https://github.com/ManageIQ/manageiq-ui-classic/pull/416)
- Fix creation of trees for new group [(#379)](https://github.com/ManageIQ/manageiq-ui-classic/pull/379)
- Show filter with list of users on All Jobs and All UI Task screens [(#435)](https://github.com/ManageIQ/manageiq-ui-classic/pull/435)
- Fix view multiple graphs [(#403)](https://github.com/ManageIQ/manageiq-ui-classic/pull/403)
- Fix image paths in ImportExportHelper. [(#397)](https://github.com/ManageIQ/manageiq-ui-classic/pull/397)
- Add specs for rendering Alert detail screen and pressing buttons [(#396)](https://github.com/ManageIQ/manageiq-ui-classic/pull/396)
- Make buttons visible only in list of chargeback saved reports [(#394)](https://github.com/ManageIQ/manageiq-ui-classic/pull/394)
- Update spice-html5-bower to 1.6.3 fixing an extra GET .../null request [(#370)](https://github.com/ManageIQ/manageiq-ui-classic/pull/370)
- Fix broken Automate icons [(#351)](https://github.com/ManageIQ/manageiq-ui-classic/pull/351)
- Listnav Quad power state styling fix [(#439)](https://github.com/ManageIQ/manageiq-ui-classic/pull/439)
- Removed duplicate security group listing in cloud tenant table [(#457)](https://github.com/ManageIQ/manageiq-ui-classic/pull/457)
- Added alt-text to Advanced Search buttons [(#367)](https://github.com/ManageIQ/manageiq-ui-classic/pull/367)
- Correct inconsistent provider input field lengths [(#406)](https://github.com/ManageIQ/manageiq-ui-classic/pull/406)
- Display Catalog Item form buttons [(#432)](https://github.com/ManageIQ/manageiq-ui-classic/pull/432)
- Fix VM quadicon links in Services [(#372)](https://github.com/ManageIQ/manageiq-ui-classic/pull/372)
- Fix incorrect localization in instance methods across button classes [(#429)](https://github.com/ManageIQ/manageiq-ui-classic/pull/429)
- Fix retrieval of `device_path` from the attach form [(#464)](https://github.com/ManageIQ/manageiq-ui-classic/pull/464)
- Fix units formating for grouped charts [(#382)](https://github.com/ManageIQ/manageiq-ui-classic/pull/382)
- Make chart loading more error resistant. [(#465)](https://github.com/ManageIQ/manageiq-ui-classic/pull/465)
- Fix an error when cancelling from edit subnet screen [(#501)](https://github.com/ManageIQ/manageiq-ui-classic/pull/501)

## Unreleased - as of Sprint 54 end 2017-02-13

### [Added](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+54+Ending+Feb+13%2C+2017%22+label%3Aenhancement)

- Move the Ansible Tower UI to the Automation tab [(#170)](https://github.com/ManageIQ/manageiq-ui-classic/pull/170)
- Allow reselection of node for Workload tree [(#300)](https://github.com/ManageIQ/manageiq-ui-classic/pull/300)
- Add service_action to resource_action ae_attributes. [(#297)](https://github.com/ManageIQ/manageiq-ui-classic/pull/297)
- Add icon for node alerts [(#277)](https://github.com/ManageIQ/manageiq-ui-classic/pull/277)
- Add Live Migrate actions to the task queue. [(#208)](https://github.com/ManageIQ/manageiq-ui-classic/pull/208)
- Added changes to show Catalog Item type [(#165)](https://github.com/ManageIQ/manageiq-ui-classic/pull/165)
- UI for server group deployments [(#23)](https://github.com/ManageIQ/manageiq-ui-classic/pull/23)
- Display a more informative message on single datasource deletion. [(#353)](https://github.com/ManageIQ/manageiq-ui-classic/pull/353)

### [Changed](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+54+Ending+Feb+13%2C+2017%22+label%3Aenhancement)

- Unified the layout for VNC/SPICE remote consoles [(#186)](https://github.com/ManageIQ/manageiq-ui-classic/pull/186)
- Update ui-components to 0.0.12 (dialog editor) [(#288)](https://github.com/ManageIQ/manageiq-ui-classic/pull/288)
- Enable 'Provision VMs' button in Datastores and Clusters [(#298)](https://github.com/ManageIQ/manageiq-ui-classic/pull/298)
- Don't invoke get_tagdata() for non-taggable objects [(#348)](https://github.com/ManageIQ/manageiq-ui-classic/pull/348)

### [Fixed](https://github.com/ManageIQ/manageiq-ui-classic/issues?q=milestone%3A%22Sprint+54+Ending+Feb+13%2C+2017%22+label%3Abug)

- Cascading Auto Refresh for dialog fields [(#264)](https://github.com/ManageIQ/manageiq-ui-classic/pull/264)
- Add list of roles to rbac [(#271)](https://github.com/ManageIQ/manageiq-ui-classic/pull/271)
- Fix assigning roles in group form [(#296)](https://github.com/ManageIQ/manageiq-ui-classic/pull/296)
- Fix search box display for Configuration management providers [(#295)](https://github.com/ManageIQ/manageiq-ui-classic/pull/295)
- Use correct route to derive unfilled hawkular hostname [(#265)](https://github.com/ManageIQ/manageiq-ui-classic/pull/265)
- Fix "Provider Conditions" title in tree builder conditions [(#268)](https://github.com/ManageIQ/manageiq-ui-classic/pull/268)
- Fix typo in class name [(#334)](https://github.com/ManageIQ/manageiq-ui-classic/pull/334)
- Fixed DOM element names for Utilization & Bottleneck tree select [(#324)](https://github.com/ManageIQ/manageiq-ui-classic/pull/324)
- Fix buttons AND OR NOT REMOVE in exp editor [(#258)](https://github.com/ManageIQ/manageiq-ui-classic/pull/258)
- Topology: Fix second search [(#313)](https://github.com/ManageIQ/manageiq-ui-classic/pull/313)
- Network Provider timelines button fix. [(#316)](https://github.com/ManageIQ/manageiq-ui-classic/pull/316)
- Update the model for the ConfiguredSystems displayed in the Configuration managers Ui [(#358)](https://github.com/ManageIQ/manageiq-ui-classic/pull/358)
- AutomationManagerController & ProviderForemanController - unify model_to_type_name fixing toolbars [(#350)](https://github.com/ManageIQ/manageiq-ui-classic/pull/350)
- Fix race condition in container_live_dashboard_controlle controller [(#362)](https://github.com/ManageIQ/manageiq-ui-classic/pull/362)


## Unreleased - as of Sprint 53 end 2017-01-30

### [Added](https://github.com/ManageIQ/manageiq-ui-classic/pulls?utf8=%E2%9C%93&q=is%3Apr%20is%3Aclosed%20milestone%3A%22Sprint%2053%20Ending%20Jan%2030%2C%202017%22%20label%3Aenhancement)
- Middleware: provide select JDBC driver tab to more easily input Drivers loaded in servers ([#82](https://github.com/ManageIQ/manageiq-ui-classic/pull/82))
- Replace AnsibleTower::ConfigurationManager with AutomationManager references in the Ui ([#248](https://github.com/ManageIQ/manageiq-ui-classic/pull/248))
- Add volume snapshot summary to block storage manager ([#231](https://github.com/ManageIQ/manageiq-ui-classic/pull/231))
- Add delete functionality for generic object UI ([#180](https://github.com/ManageIQ/manageiq-ui-classic/pull/180))
- Add Dashboard settings to General ([#141](https://github.com/ManageIQ/manageiq-ui-classic/pull/141))
- Add assets for EC2 block and storage managers ([#133](https://github.com/ManageIQ/manageiq-ui-classic/pull/133))
- Introduce Vm/Chargeback tab [ui-part] ([#270](https://github.com/ManageIQ/manageiq-ui-classic/pull/270))

### [Changed](https://github.com/ManageIQ/manageiq-ui-classic/pulls?utf8=%E2%9C%93&q=is%3Apr%20is%3Aclosed%20milestone%3A%22Sprint%2053%20Ending%20Jan%2030%2C%202017%22%20label%3Aenhancement)
- Limit number of objects on topology views ([#95](https://github.com/ManageIQ/manageiq-ui-classic/pull/95))
- Add latest VMRC API version ([#184](https://github.com/ManageIQ/manageiq-ui-classic/pull/184))
- Remove instance retire class from summary view ([#143](https://github.com/ManageIQ/manageiq-ui-classic/pull/143))
- Sort custom attributes by attribute name ([#228](https://github.com/ManageIQ/manageiq-ui-classic/pull/228))
- Reset selected snapshot in session when deleting the snapshot ([#183](https://github.com/ManageIQ/manageiq-ui-classic/pull/183))

### [Fixed](https://github.com/ManageIQ/manageiq-ui-classic/pulls?utf8=%E2%9C%93&q=is%3Apr%20is%3Aclosed%20milestone%3A%22Sprint%2053%20Ending%20Jan%2030%2C%202017%22%20label%3Abug%20)

Notable fixes include:
- Fix check_box_tag parameters for snap_memory ([#217](https://github.com/ManageIQ/manageiq-ui-classic/pull/217))
rhv: removed the option to migrate the VMs outside of the cluster. ([#207](https://github.com/ManageIQ/manageiq-ui-classic/pull/207))
- Fix valid_tenant check in ops. ([#203](https://github.com/ManageIQ/manageiq-ui-classic/pull/203))
- Tenant admin should not be able to create groups in other tenants. ([#151](https://github.com/ManageIQ/manageiq-ui-classic/pull/151))
- Fix button when adding a filter in Cloud Providers ([#142](https://github.com/ManageIQ/manageiq-ui-classic/pull/142))
- Fix repeating values on Y-axis of C&U charts ([#40](https://github.com/ManageIQ/manageiq-ui-classic/pull/40))
- Floating IPs: Adds missing route for wait_for_task ([#192](https://github.com/ManageIQ/manageiq-ui-classic/pull/192))
- Fix Chart pie clicking when part of it is hidden ([#213](https://github.com/ManageIQ/manageiq-ui-classic/pull/213))
- Fixed node id for policy after coming from an event ([#256](https://github.com/ManageIQ/manageiq-ui-classic/pull/256))

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
