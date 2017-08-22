class TreeBuilder
  include CompressedIds
  extend CompressedIds
  include TreeKids

  attr_reader :name, :type, :tree_nodes

  def self.class_for_type(type)
    raise('Obsolete tree type.') if type == :filter
    @x_tree_node_classes ||= {}
    @x_tree_node_classes[type] ||= LEFT_TREE_CLASSES[type].constantize
  end

  def initialize(name, type, sandbox, build = true)
    @tree_state = TreeState.new(sandbox)
    @sb = sandbox # FIXME: some subclasses still access @sb

    @locals_for_render  = {}
    @name               = name.to_sym                     # includes _tree
    @options            = tree_init_options(name.to_sym)
    @tree_nodes         = {}.to_json
    # FIXME: remove @name or @tree, unify
    @type               = type.to_sym                     # *usually* same as @name but w/o _tree

    add_to_sandbox
    build_tree if build
  end

  def node_by_tree_id(id)
    model, rec_id, prefix = self.class.extract_node_model_and_id(id)

    if model == "Hash"
      {:type => prefix, :id => rec_id, :full_id => id}
    elsif model.nil? && [:sandt, :svccat, :stcat].include?(@type)
      # Creating empty record to show items under unassigned catalog node
      ServiceTemplateCatalog.new
    elsif model.nil? && [:configuration_manager_providers_tree].include?(@name)
      # Creating empty record to show items under unassigned catalog node
      ConfigurationProfile.new
    else
      model.constantize.find(from_cid(rec_id))
    end
  end

  # Get the children of a tree node that is being expanded (autoloaded)
  def x_get_child_nodes(id)
    parents = [] # FIXME: parent ids should be provided on autoload as well

    object = node_by_tree_id(id)

    # Save node as open
    open_node(id)

    x_get_tree_objects(object, @tree_state.x_tree(@name), false, parents).map do |o|
      x_build_node_tree(o, id, @tree_state.x_tree(@name))
    end
  end

  def tree_init_options(_tree_name)
    $log.warn "MIQ(#{self.class.name}) - TreeBuilder descendants should have their own tree_init_options"
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

  def self.build_node_cid(record_or_id, type = nil)
    if record_or_id.kind_of?(Integer)
      prefix = get_prefix_for_model(type)
      id = record_or_id
    else
      prefix = get_prefix_for_model(record_or_id.class.base_model)
      id = record_or_id.id
    end
    "#{prefix}-#{to_cid(id)}"
  end

  def self.hide_vms
    !User.current_user.settings.fetch_path(:display, :display_vms) # default value is false
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

  # FIXME: temporary conversion, needs to be moved into the generation
  def self.convert_bs_tree(nodes)
    return [] if nodes.nil?
    nodes = [nodes] if nodes.kind_of?(Hash)
    stack = nodes.dup
    while stack.any?
      node = stack.pop
      stack += node[:children] if node.key?(:children)
      stack += node[:nodes] if node.key?(:nodes)
      node[:text] = node.delete(:title) if node.key?(:title)
      node[:nodes] = node.delete(:children) if node.key?(:children)
      node[:lazyLoad] = node.delete(:isLazy) if node.key?(:isLazy)
      node[:state] = {}
      node[:state][:expanded] = node.delete(:expand) if node.key?(:expand)
      node[:state][:checked] = node.delete(:select) if node.key?(:select)
      node[:state][:selected] = node.delete(:highlighted) if node.key?(:highlighted)
      node[:selectable] = !node.delete(:cfmeNoClick) if node.key?(:cfmeNoClick)
      node[:class] = ''
      node[:class] = node.delete(:addClass) if node.key?(:addClass) && !node[:addClass].nil?
      node[:class] = node[:class].split(' ').push('no-cursor').join(' ') if node[:selectable] == false
    end
    nodes
  end

  # Add child nodes to a tree below node 'id'
  def self.tree_add_child_nodes(sandbox:, klass_name:, name:, type:, id:)
    tree = klass_name.constantize.new(name, type, sandbox, false)
    tree.x_get_child_nodes(id)
  end

  private

  def build_tree
    # FIXME: we have the options -- no need to reload from @sb
    tree_nodes = x_build_tree(@tree_state.x_tree(@name))
    active_node_set(tree_nodes)
    set_nodes(tree_nodes)
  end

  # Set active node to root if not set.
  # Subclass this method if active node on initial load is different than root node.
  def active_node_set(tree_nodes)
    @tree_state.x_node_set(tree_nodes.first[:key], @name) unless @tree_state.x_node(@name)
  end

  def set_nodes(nodes)
    # Add the root node even if it is not set
    add_root_node(nodes) if @options.fetch(:add_root, :true)
    @bs_tree = self.class.convert_bs_tree(nodes).to_json
    @tree_nodes = nodes.to_json
    @locals_for_render = set_locals_for_render
  end

  def add_to_sandbox
    @tree_state.add_tree(
      @options.reverse_merge(
        :tree                 => @name,
        :type                 => type,
        :klass_name           => self.class.name,
        :leaf                 => @options[:leaf],
        :add_root             => true,
        :open_nodes           => [],
        :lazy                 => true,
        :checkable_checkboxes => false
      )
    )
  end

  def add_root_node(nodes)
    root = nodes.first.merge!(root_options)
    if root[:image]
      root[:image] = ActionController::Base.helpers.image_path(root[:image])
    else
      root[:icon] ||= 'pficon pficon-folder-close' # Fall back to the folder fonticon
    end
  end

  def group_id
    (@group.present? && @group.id.present?) ? @group.id : 'new'
  end

  def set_locals_for_render
    {
      :tree_id    => "#{@name}box",
      :tree_name  => @name.to_s,
      :bs_tree    => @bs_tree,
      :onclick    => "miqOnClickSelectTreeNode",
      :checkboxes => false
    }
  end

  # Build an explorer tree, from scratch
  # Options:
  # :type                   # Type of tree, i.e. :handc, :vandt, :filtered, etc
  # :leaf                   # Model name of leaf nodes, i.e. "Vm"
  # :open_nodes             # Tree node ids of currently open nodes
  # :add_root               # If true, put a root node at the top
  # :full_ids               # stack parent id on top of each node id
  # :lazy                   # set if tree is lazy
  def x_build_tree(options)
    nodes = x_get_tree_objects(nil, options, false, []).map do |child|
      # already a node? FIXME: make a class for node
      if child.kind_of?(Hash) && child.key?(:text) && child.key?(:key) && child.key?(:image)
        child
      else
        x_build_node_tree(child, nil, options)
      end
    end
    return nodes unless options[:add_root]
    [{:key => 'root', :nodes => nodes, :expand => true}]
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

  def x_get_tree_objects(parent, options, count_only, parents)
    children_or_count = parent.nil? ? x_get_tree_roots(count_only, options) : x_get_tree_kids(parent, count_only, options, parents)
    children_or_count || (count_only ? 0 : [])
  end

  # @param object the current node object (or an ancestry tree hash)
  # @param pid [String|Nil] parent id root nodes are nil
  # @param options [Hash] tree options
  # @returns [Hash] display hash for this node and all children
  def x_build_node(object, pid, options)
    parents = pid.to_s.split('_')

    options[:is_current] = ((object.kind_of?(MiqServer) && MiqServer.my_server.id == object.id) ||
                             (object.kind_of?(Zone) && MiqServer.my_server.my_zone == object.name))

    object, ancestry_kids = object_from_ancestry(object)
    node = x_build_single_node(object, pid, options)

    # Process the node's children
    load_children = if object.kind_of?(Struct)
                      # Load children for Sections, don't for other Menu Structs.
                      object.kind_of?(Menu::Section)
                    else
                      object[:load_children]
                    end

    node[:expand] = Array(@tree_state.x_tree(@name)[:open_nodes]).include?(node[:key]) || !!options[:open_all] || node[:expand]
    if ancestry_kids ||
       load_children ||
       node[:expand] ||
       @options[:lazy] == false

      kids = (ancestry_kids || x_get_tree_objects(object, options, false, parents)).map do |o|
        x_build_node(o, node[:key], options)
      end
      node[:nodes] = kids unless kids.empty?
    else
      if x_get_tree_objects(object, options, true, parents) > 0
        node[:lazyLoad] = true # set child flag if children exist
      end
    end
    node
  end

  def x_build_single_node(object, pid, options)
    # FIXME: to_h is for backwards compatibility with hash-trees, it needs to be removed in the future
    node = TreeNode.new(object, pid, options).to_h
    override(node, object, pid, options) if self.class.method_defined?(:override) || self.class.private_method_defined?(:override)
    node
  end

  # Called with object, tree node parent id, tree options
  def x_build_node_tree(object, pid, options)
    x_build_node(object, pid, options)
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_custom_kids(_object, count_only, _options)
    count_only ? 0 : []
  end

  # count_only_or_objects but for many sets of objects
  # count_only will short circuit the sizes
  # the last parameter is a required sort_by (which is typically 'name')
  #
  # Passing a lambda around a collection will delay loading the collection.
  # Especially useful when the collection downloads a lot of data.
  def count_only_or_many_objects(count_only, *collections)
    sort_by = collections.pop

    if count_only
      collections.detect { |objects| resolve_object_lambdas(count_only, objects).size > 0 } ? 1 : 0
    else
      collections.map! { |objects| resolve_object_lambdas(count_only, objects) }
      collections.flat_map { |objects| count_only_or_objects(count_only, objects, sort_by) }
    end
  end

  def count_only_or_objects(count_only, objects, sort_by = nil)
    if count_only
      objects.size
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

  def assert_type(actual, expected)
    raise "#{self.class}: expected #{expected.inspect}, got #{actual.inspect}" unless actual == expected
  end

  def open_node(id)
    open_nodes = @tree_state.x_tree(@name)[:open_nodes]
    open_nodes.push(id) unless open_nodes.include?(id)
  end

  def prefixed_title(prefix, title)
    ViewHelper.capture do
      ViewHelper.concat_tag(:strong, "#{prefix}:")
      ViewHelper.concat ' '
      ViewHelper.concat title
    end
  end

  def resolve_object_lambdas(count_only, objects)
    if objects.respond_to?(:call)
      # works with a no-param lambda OR a lambda that requests the count_only
      (objects.arity == 1) ? objects.call(count_only) : objects.call
    else
      objects
    end
  end
  private :resolve_object_lambdas

  LEFT_TREE_CLASSES = {
    # Cloud Intel
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

    # Optimize
    ## Utilization
    ### Utilization (TODO)
    :utilization                     => "TreeBuilderUtilization",
    ### Bottlenecks (TODO)
    :bottlenecks                     => "TreeBuilderUtilization",

    # OPS (Configuration)
    ## Settings
    :settings                        => "TreeBuilderOpsSettings",
    ## Access Control
    :rbac                            => "TreeBuilderOpsRbac",
    ## Diagnostics
    :diagnostics                     => "TreeBuilderOpsDiagnostics",
    ## Database
    :vmdb                            => "TreeBuilderOpsVmdb",
  }.freeze

  # Tree node prefixes for generic explorers
  X_TREE_NODE_PREFIXES = {
    "a"   => "MiqAction",
    "aec" => "MiqAeClass",
    "aei" => "MiqAeInstance",
    "aem" => "MiqAeMethod",
    "aen" => "MiqAeNamespace",
    "al"  => "MiqAlert",
    "ap"  => "MiqAlertSet",
    "asr" => "AssignedServerRole",
    "az"  => "AvailabilityZone",
    "azu" => "OrchestrationTemplateAzure",
    "at"  => "ManageIQ::Providers::AnsibleTower::AutomationManager",
    "cl"  => "Classification",
    "cf"  => "ConfigurationScript",
    "cfp" => "ConfigurationScriptPayload",
    "cnt" => "Container",
    "co"  => "Condition",
    "cbg" => "CustomButtonSet",
    "cb"  => "CustomButton",
    "cfn" => "OrchestrationTemplateCfn",
    "cm"  => "Compliance",
    "cd"  => "ComplianceDetail",
    "cp"  => "ConfigurationProfile",
    "cr"  => "ChargebackRate",
    "cs"  => "ConfiguredSystem",
    "ct"  => "CustomizationTemplate",
    "dc"  => "Datacenter",
    "dg"  => "Dialog",
    "ds"  => "Storage",
    "dsc" => "StorageCluster",
    "e"   => "ExtManagementSystem",
    "ev"  => "MiqEventDefinition",
    "c"   => "EmsCluster",
    "csf" => "ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem",
    "csa" => "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem",
    "f"   => "EmsFolder",
    "fr"  => "ManageIQ::Providers::Foreman::ConfigurationManager",
    "g"   => "MiqGroup",
    "gd"  => "GuestDevice",
    "h"   => "Host",
    "hot" => "OrchestrationTemplateHot",
    "isd" => "IsoDatastore",
    "isi" => "IsoImage",
    "l"   => "Lan",
    "ld"  => "LdapDomain",
    "lr"  => "LdapRegion",
    "me"  => "MiqEnterprise",
    "mr"  => "MiqRegion",
    "msc" => "MiqSchedule",
    "ms"  => "MiqSearch",
    "odg" => "MiqDialog",
    "ot"  => "OrchestrationTemplate",
    "pi"  => "PxeImage",
    "pit" => "PxeImageType",
    "ps"  => "PxeServer",
    "pp"  => "MiqPolicySet",
    "p"   => "MiqPolicy",
    "rep" => "MiqReport",
    "rr"  => "MiqReportResult",
    "svr" => "MiqServer",
    "ur"  => "MiqUserRole",
    "r"   => "ResourcePool",
    "s"   => "Service",
    "sa"  => "StorageAdapter",
    'sn'  => 'Snapshot',
    "sl"  => "MiqScsiLun",
    "sg"  => "MiqScsiTarget",
    "sis" => "ScanItemSet",
    "role" => "ServerRole",
    "st"  => "ServiceTemplate",
    "stc" => "ServiceTemplateCatalog",
    "sr"  => "ServiceResource",
    "sw"  => "Switch",
    "t"   => "MiqTemplate",
    "tb"  => "VmdbTable",
    "ti"  => "VmdbIndex",
    "tn"  => "Tenant",
    "u"   => "User",
    "v"   => "Vm",
    "vap" => "ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate",
    "vnf" => "OrchestrationTemplateVnfd",
    "wi"  => "WindowsImage",
    "xx"  => "Hash",  # For custom (non-CI) nodes, specific to each tree
    "z"   => "Zone"
  }

  X_TREE_NODE_PREFIXES_INVERTED = X_TREE_NODE_PREFIXES.invert
end
