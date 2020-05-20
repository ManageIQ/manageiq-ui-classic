class TreeBuilder
  include TreeKids

  attr_reader :name, :options, :tree_nodes, :bs_tree

  def self.class_for_type(type)
    raise('Obsolete tree type.') if type == :filter
    @x_tree_node_classes ||= {}
    @x_tree_node_classes[type] ||= LEFT_TREE_CLASSES[type].constantize
  end

  def initialize(name, sandbox, build = true, **_params)
    @tree_state = TreeState.new(sandbox)
    @sb = sandbox # FIXME: some subclasses still access @sb

    @locals_for_render  = {}
    @name               = name.to_sym # includes _tree
    @options            = tree_init_options
    @tree_nodes         = []

    add_to_sandbox
    build_tree if build
  end

  def node_by_tree_id(id)
    model, rec_id, prefix = self.class.extract_node_model_and_id(id)

    case model
    when 'Hash' # create a fake hash node
      {:type => prefix, :id => rec_id, :full_id => id}
    when nil # no model, probably super() called from a redefinition
      nil
    else
      model.constantize.find(rec_id)
    end
  end

  # Get the children of a tree node that is being expanded (autoloaded)
  def x_get_child_nodes(id)
    parents = [] # FIXME: parent ids should be provided on autoload as well

    object = node_by_tree_id(id)

    # Save node as open
    open_node(id)

    x_get_tree_objects(object, false, parents).map do |o|
      x_build_node(o, id)
    end
  end

  # The possible options are
  # * full_ids - whether to generate full node IDs or not
  # * open_all - expand all expandable nodes
  # * lazy - is the tree lazily-loadable
  # * checkboxes - show checkboxes for the nodes
  # * allow_reselect - fire the onclick event if a selected node is reselected
  # * three_checks - hierarchically check the parent if all children are checked
  # * post_check - some kind of post-processing hierarchical checks
  # * silent_activate - whether to activate the active_node silently or not (by default for explorers)
  def tree_init_options
    $log.warn("MIQ(#{self.class.name}) - TreeBuilder descendants should have their own tree_init_options")
    {}
  end

  # Get nodes model (folder, Vm, Cluster, etc)
  def self.get_model_for_prefix(node_prefix)
    X_TREE_NODE_PREFIXES[node_prefix]
  end

  def self.get_prefix_for_model(model)
    model = model.to_s unless model.kind_of?(String)
    X_TREE_NODE_PREFIXES_INVERTED[model]
  end

  def self.build_node_id(record)
    prefix = get_prefix_for_model(record.class.base_model)
    "#{prefix}-#{record.id}"
  end

  # return this nodes model and record id
  def self.extract_node_model_and_id(node_id)
    prefix, record_id = node_id.split("_").last.split('-')
    model = get_model_for_prefix(prefix)
    [model, record_id, prefix]
  end

  def locals_for_render
    @locals_for_render.update(:select_node => @tree_state.x_node(@name).to_s)
  end

  def reload!
    build_tree
  end

  def open_node(id)
    opened_nodes.push(id) unless opened_nodes.include?(id)
  end

  def expand_node?(key)
    # A based on the tree state, a node should be expanded in three cases:
    # - the open_all setting is present
    # - it has been already expanded
    # - the node is set as active_node
    !!@options[:open_all] || opened_nodes.include?(key) || @tree_state.x_tree(@name)[:active_node] == key
  end

  # Add child nodes to a tree below node 'id'
  def self.tree_add_child_nodes(sandbox:, klass_name:, name:, id:)
    tree = klass_name.constantize.new(name, sandbox, false)
    tree.x_get_child_nodes(id)
  end

  private

  # Post-process partial checkbox state
  def post_check(tree)
    stack = tree.map(&:itself)
    nodes = []
    parents = []

    # Collect nodes in a flat structure
    while stack.any?
      node = stack.pop
      nodes.push(node)

      if node[:nodes]&.any?
        parents.push(node)
        node[:nodes].each { |child| stack.push(child) }
      end
    end

    # Process nodes top-to-bottom
    nodes.reverse!
    while nodes.any?
      parent = nodes.pop

      parent[:nodes]&.each do |child|
        if parent.try(:[], :state).try(:[], :checked)
          child[:state] ||= {}
          child[:state][:checked] = true
        end
      end
    end

    # Process nodes bottom-to-top
    while parents.any?
      parent = parents.pop
      parent[:state] ||= {}
      parent[:state][:checked] = parent[:nodes].map { |node| node.try(:[], :state).try(:[], :checked) }.reduce { |acc, curr| acc == curr ? acc : 'undefined' }
    end
  end

  def build_tree
    @tree_nodes = x_build_tree
    post_check(@tree_nodes) if @options[:post_check] && @options[:three_checks]
    active_node_set(@tree_nodes)
    @bs_tree = @tree_nodes.to_json
    @locals_for_render = set_locals_for_render
  end

  def opened_nodes
    # If the open_nodes is not set, Array(nil) will always return a different object, therefore,
    # for stateless trees it has a performance drawback of creating a new array after each time
    # this method is called. By memoizing the first result, only a single array gets allocated.
    @opened_nodes ||= Array(@tree_state.x_tree(@name)[:open_nodes])
  end

  # Subclass this method if active node on initial load is different than root node.
  def active_node_set(tree_nodes)
    @tree_state.x_node_set(tree_nodes.first[:key], @name) unless @tree_state.x_node(@name)
  end

  def add_to_sandbox
    @tree_state.add_tree(
      @options.reverse_merge(
        :tree       => @name,
        :klass_name => self.class.name,
        :open_nodes => []
      )
    )
  end

  def set_locals_for_render
    {
      :tree_id            => "#{@name}box",
      :tree_name          => @name.to_s,
      :bs_tree            => @bs_tree,
      :checkboxes         => @options[:checkboxes],
      :autoload           => @options[:lazy],
      :allow_reselect     => @options[:allow_reselect],
      :hierarchical_check => @options[:three_checks],
      :onclick            => @options[:onclick],
      :oncheck            => @options[:oncheck],
      :click_url          => @options[:click_url],
      :check_url          => @options[:check_url],
      :silent_activate    => @options[:silent_activate]
    }.compact
  end

  # Build an explorer tree, from scratch
  def x_build_tree
    nodes = x_get_tree_objects(nil, false, []).map do |child|
      # already a node? FIXME: make a class for node
      if child.kind_of?(Hash) && child.key?(:text) && child.key?(:key) && child.key?(:image)
        child
      else
        x_build_node(child, nil)
      end
    end

    return nodes unless respond_to?(:root_options, true)

    [TreeNode::Root.new(root_options, nil, self).to_h.merge(:nodes => nodes)]
  end

  # determine if this is an ancestry node, and return the approperiate object
  #
  # @param object [Hash,Array,Object] object that is possibly an ancestry node
  # @returns [Object, Hash] The object of interest from this ancestry tree, and the children
  #
  # Ancestry trees are of the form:
  #
  #   {Object => {Object1 => {}, Object2 => {Object2a => {}}}}
  #
  # Since `build_tree` and x_build_node uses enumeration, it comes in as:
  #   [Object, {Object1 => {}, Object2 => {Object2a => {}}}]
  #
  def object_from_ancestry(object)
    if object.kind_of?(Array) && object.size == 2 && (object[1].kind_of?(Hash) || object[1].kind_of?(Array))
      object
    else
      [object, nil]
    end
  end

  def x_get_tree_objects(parent, count_only, parents)
    children_or_count = parent.nil? ? x_get_tree_roots : x_get_tree_kids(parent, count_only, parents)
    children_or_count || (count_only ? 0 : [])
  end

  # @param object the current node object (or an ancestry tree hash)
  # @param pid [String|Nil] parent id root nodes are nil
  # @returns [Hash] display hash for this node and all children
  def x_build_node(object, pid)
    parents = pid.to_s.split('_')

    object, ancestry_kids = object_from_ancestry(object)
    node = TreeNode.new(object, pid, self)
    override(node, object) if self.class.method_defined?(:override) || self.class.private_method_defined?(:override)

    if ancestry_kids || node.expanded || !@options[:lazy]
      (ancestry_kids || x_get_tree_objects(object, false, parents)).each do |o|
        node.nodes.push(x_build_node(o, node.key))
      end
    elsif x_get_tree_objects(object, true, parents).positive?
      node.lazy = true # set child flag if children exist
    end

    node.to_h
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_custom_kids(_object, count_only)
    count_only ? 0 : []
  end

  def count_only_or_objects(count_only, objects, sort_by = nil)
    if count_only
      objects.respond_to?(:order) ? objects.except(:order).size : objects.size
    elsif sort_by.kind_of?(Proc)
      objects.sort_by(&sort_by)
    elsif sort_by
      objects.sort_by { |o| Array(sort_by).collect { |sb| o.deep_send(sb).to_s.downcase } }
    else
      objects
    end
  end

  def count_only_or_objects_filtered(count_only, objects, sort_by = nil, options = {}, &block)
    count_only_or_objects(count_only, Rbac.filtered(objects, options), sort_by, &block)
  end

  def prefixed_title(prefix, title)
    ViewHelper.capture do
      ViewHelper.concat_tag(:strong, "#{prefix}:")
      ViewHelper.concat(' ')
      ViewHelper.concat(title)
    end
  end

  LEFT_TREE_CLASSES = {
    # Overview
    ## Reports
    ### Saved Reports
    :savedreports                    => "TreeBuilderReportSavedReports",
    ### Reports
    :reports                         => "TreeBuilderReportReports",
    ### Schedules
    :schedules                       => "TreeBuilderReportSchedules",
    ### Dashboards
    :db                              => "TreeBuilderReportDashboards",
    ### Dashboard Widgets
    :widgets                         => "TreeBuilderReportWidgets",
    ### Edit Report Menus
    :roles                           => "TreeBuilderReportRoles",
    ### Import/Export
    :export                          => "TreeBuilderReportExport",
    ## Timelines (TODO)

    ## Utilization
    ### Utilization
    :utilization                     => "TreeBuilderUtilization",

    ## Chargeback
    ### Reports
    :cb_reports                      => "TreeBuilderChargebackReports",
    ### Rates
    :cb_rates                        => "TreeBuilderChargebackRates",
    ### Assignments
    :cb_assignments                  => "TreeBuilderChargebackAssignments",

    # Services
    ## My services
    ### Services
    :svcs                            => "TreeBuilderServices",

    ## Catalogs
    ### Service Catalogs
    :svccat                          => "TreeBuilderServiceCatalog",
    ### Catalog Items
    :sandt                           => "TreeBuilderCatalogItems",
    ### Orchestration Templates
    :ot                              => "TreeBuilderOrchestrationTemplates",
    ### Catalogs
    :stcat                           => "TreeBuilderCatalogs",

    ## Workloads
    ### VMs & Instances
    :vms_instances_filter            => "TreeBuilderVmsInstancesFilter",
    ### Templates & Images
    :templates_images_filter         => "TreeBuilderTemplatesImagesFilter",

    # Compute
    ## Clouds
    ### Instances
    #### Instances by provider
    :instances                       => "TreeBuilderInstances",
    #### Images by provider
    :images                          => "TreeBuilderImages",
    #### Instances
    :instances_filter                => "TreeBuilderInstancesFilter",
    #### Images
    :images_filter                   => "TreeBuilderImagesFilter",

    ## Infrastructure
    ### Virtual Machines
    #### VMs & Templates
    :vandt                           => "TreeBuilderVandt",
    #### VMs
    :vms_filter                      => "TreeBuilderVmsFilter",
    #### Templates
    :templates_filter                => "TreeBuilderTemplateFilter",
    ### Datastores
    #### Datastores
    :storage                         => "TreeBuilderStorage",
    #### Datastore Clusters
    :storage_pod                     => "TreeBuilderStoragePod",
    ### PXE
    #### PXE Servers
    :pxe_servers                     => "TreeBuilderPxeServers",
    #### Customization Templates
    :customization_templates         => "TreeBuilderPxeCustomizationTemplates",
    #### System Image Types
    :pxe_image_types                 => "TreeBuilderPxeImageTypes",
    #### ISO Datastores
    :iso_datastores                  => "TreeBuilderIsoDatastores",

    ### Networking
    #### Switches
    :infra_networking                => "TreeBuilderInfraNetworking",

    # Configuration
    ## Management
    ### Providers
    :configuration_manager_providers => "TreeBuilderConfigurationManager",
    ### Configured Systems
    :configuration_manager_cs_filter => "TreeBuilderConfigurationManagerConfiguredSystems",

    # Control
    ## Explorer
    ### Policy Profiles
    :policy_profile                  => "TreeBuilderPolicyProfile",
    ### Policies
    :policy                          => "TreeBuilderPolicy",
    ### Events
    :event                           => "TreeBuilderEvent",
    ### Conditions
    :condition                       => "TreeBuilderCondition",
    ### Actions
    :action                          => "TreeBuilderAction",
    ### Alert Profiles
    :alert_profile                   => "TreeBuilderAlertProfile",
    ### Alerts
    :alert                           => "TreeBuilderAlert",

    # Automation
    ## Ansible Tower
    ### Providers
    :automation_manager_providers    => "TreeBuilderAutomationManagerProviders",
    ### Configured Systems
    :automation_manager_cs_filter    => "TreeBuilderAutomationManagerConfiguredSystems",
    ### Job Templates
    :configuration_scripts           => "TreeBuilderAutomationManagerConfigurationScripts",

    ## Automate
    ### Explorer
    #### Datastore
    :ae                              => "TreeBuilderAeClass",
    ### Customization
    #### Provisioning Dialogs
    :old_dialogs                     => "TreeBuilderProvisioningDialogs",
    #### Service Dialogs
    :dialogs                         => "TreeBuilderServiceDialogs",
    #### Buttons
    :ab                              => "TreeBuilderButtons",
    #### Import/Export
    :dialog_import_export            => "TreeBuilderAeCustomization",
    ### Generic Objects
    :generic_object_definition       => "TreeBuilderGenericObjectDefinition",

    # OPS (Configuration)
    ## Settings
    :settings                        => "TreeBuilderOpsSettings",
    ## Access Control
    :rbac                            => "TreeBuilderOpsRbac",
    ## Diagnostics
    :diagnostics                     => "TreeBuilderOpsDiagnostics",
  }.freeze

  # Tree node prefixes for generic explorers
  X_TREE_NODE_PREFIXES = {
    "a"    => "MiqAction",
    "aec"  => "MiqAeClass",
    "aei"  => "MiqAeInstance",
    "aem"  => "MiqAeMethod",
    "aen"  => "MiqAeNamespace",
    "al"   => "MiqAlert",
    "ap"   => "MiqAlertSet",
    "asr"  => "AssignedServerRole",
    "az"   => "AvailabilityZone",
    "azu"  => "ManageIQ::Providers::Azure::CloudManager::OrchestrationTemplate",
    "azs"  => "ManageIQ::Providers::AzureStack::CloudManager::OrchestrationTemplate",
    "at"   => "ManageIQ::Providers::AnsibleTower::AutomationManager",
    "cl"   => "Classification",
    "cf"   => "ConfigurationScript",
    "cfp"  => "ConfigurationScriptPayload",
    "cw"   => "ConfigurationWorkflow",
    "cnt"  => "Container",
    "co"   => "Condition",
    "cbg"  => "CustomButtonSet",
    "cb"   => "CustomButton",
    "cfn"  => "ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate",
    "cm"   => "Compliance",
    "cd"   => "ComplianceDetail",
    "cp"   => "ConfigurationProfile",
    "cr"   => "ChargebackRate",
    "cs"   => "ConfiguredSystem",
    "ct"   => "CustomizationTemplate",
    "dc"   => "Datacenter",
    "dg"   => "Dialog",
    "ds"   => "Storage",
    "dsc"  => "StorageCluster",
    "e"    => "ExtManagementSystem",
    "ev"   => "MiqEventDefinition",
    "c"    => "EmsCluster",
    "csa"  => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem",
    "f"    => "EmsFolder",
    "g"    => "MiqGroup",
    "gd"   => "GuestDevice",
    "god"  => "GenericObjectDefinition",
    "h"    => "Host",
    "hot"  => "ManageIQ::Providers::Openstack::CloudManager::OrchestrationTemplate",
    "isd"  => "IsoDatastore",
    "isi"  => "IsoImage",
    "l"    => "Lan",
    "me"   => "MiqEnterprise",
    "mr"   => "MiqRegion",
    "msc"  => "MiqSchedule",
    "ms"   => "MiqSearch",
    "odg"  => "MiqDialog",
    "ot"   => "OrchestrationTemplate",
    "phys" => "PhysicalServer",
    "pi"   => "PxeImage",
    "pit"  => "PxeImageType",
    "ps"   => "PxeServer",
    "pp"   => "MiqPolicySet",
    "p"    => "MiqPolicy",
    "rep"  => "MiqReport",
    "rr"   => "MiqReportResult",
    "svr"  => "MiqServer",
    "ur"   => "MiqUserRole",
    "r"    => "ResourcePool",
    "s"    => "Service",
    "sa"   => "StorageAdapter",
    'sn'   => 'Snapshot',
    "sl"   => "MiqScsiLun",
    "sg"   => "MiqScsiTarget",
    "sis"  => "ScanItemSet",
    "role" => "ServerRole",
    "st"   => "ServiceTemplate",
    "stc"  => "ServiceTemplateCatalog",
    "sr"   => "ServiceResource",
    "sw"   => "Switch",
    "t"    => "MiqTemplate",
    "tn"   => "Tenant",
    "u"    => "User",
    "v"    => "Vm",
    "vap"  => "ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate",
    "vnf"  => "ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate",
    "wi"   => "WindowsImage",
    "ws"   => "MiqWidgetSet",
    "xx"   => "Hash", # For custom (non-CI) nodes, specific to each tree
    "z"    => "Zone"
  }.freeze

  X_TREE_NODE_PREFIXES_INVERTED = X_TREE_NODE_PREFIXES.invert
end
