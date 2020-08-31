class EmsInfraController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon # common methods for EmsInfra/Cloud controllers
  include Mixins::EmsCommon::Angular
  include Mixins::DashboardViewMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  # when methods are evaluated from this constant and return true that means: column is displayed
  DISPLAY_GTL_METHODS = [
    :user_super_admin?
  ].freeze

  def user_super_admin?
    current_user.super_admin_user?
  end

  def self.model
    ManageIQ::Providers::InfraManager
  end

  def self.table_name
    @table_name ||= "ems_infra"
  end

  def show
    @breadcrumbs =  [{:name => _('Infrastructure Providers'), :url => '/ems_infra/show_list'}]
    super
  end

  def ems_path(*args)
    ems_infra_path(*args)
  end

  def new_ems_path
    new_ems_infra_path
  end

  def show_list
    @showtype = nil
    super
  end

  def index
    redirect_to(:action => 'show_list')
  end

  def new
    @disabled_ems_infra_types = [%w[KubeVirt kubevirt]]
    super
  end

  def scaling
    assert_privileges("ems_infra_scale")

    # Hiding the toolbars
    @in_a_form = true

    redirect_to(ems_infra_path(params[:id])) if params[:cancel]

    drop_breadcrumb(:name => _("Scale Infrastructure Provider"), :url => "/ems_infra/scaling")
    @infra = get_infra_provider(params[:id])
    # TODO: Currently assumes there is a single stack per infrastructure provider. This should
    # be improved to support multiple stacks.
    @stack = @infra.direct_orchestration_stacks.first
    if @stack.nil?
      add_flash(_('Orchestration stack could not be found.'), :error)
      return
    end

    @count_parameters = @stack.parameters.select { |x| x.name.include?('::count') || x.name.include?('Count') }

    return unless params[:scale]

    scale_parameters = params.select { |k, _v| k.include?('::count') || k.include?('Count') }.to_unsafe_h
    assigned_hosts = scale_parameters.values.sum(&:to_i)
    infra = get_infra_provider(params[:id])
    if assigned_hosts > infra.hosts.count
      # Validate number of selected hosts is not more than available
      add_flash(_("Assigning %{hosts} but only have %{hosts_count} hosts available.") % {
        :hosts => assigned_hosts, :hosts_count => infra.hosts.count.to_s
      }, :error)
    else
      scale_parameters_formatted = {}
      return_message = _("Scaling")
      if @count_parameters.any? { |p| scale_parameters[p.name].present? && scale_parameters[p.name].to_s < p.value.to_s }
        add_flash(_("Scaling down is not supported. New value for %{name} %{new_value} is lower than current value %{current_value}.") % {:name => p.name, :new_value => scale_parameters[p.name], :current_value => p.value}, :error)
        return
      end
      @count_parameters.each do |p|
        next if scale_parameters[p.name].nil? || scale_parameters[p.name] == p.value
        return_message += _(" %{name} from %{value} to %{parameters} ") % {:name => p.name, :value => p.value, :parameters => scale_parameters[p.name]}
        scale_parameters_formatted[p.name] = scale_parameters[p.name]
      end

      update_stack_up(@stack, scale_parameters_formatted, params[:id], return_message)
    end
  end

  def scaledown
    assert_privileges("ems_infra_scale")
    redirect_to(ems_infra_path(params[:id])) if params[:cancel]

    # Hiding the toolbars
    @in_a_form = true

    drop_breadcrumb(:name => _("Scale Infrastructure Provider Down"), :url => "/ems_infra/scaling")
    @infra = get_infra_provider(params[:id])
    # TODO: Currently assumes there is a single stack per infrastructure provider. This should
    # be improved to support multiple stacks.
    @stack = @infra.direct_orchestration_stacks.first
    if @stack.nil?
      add_flash(_('Orchestration stack could not be found.'), :error)
      return
    end

    @compute_hosts = @infra.hosts.select { |host| host.name.include?('Compute') }

    return unless params[:scaledown]

    host_ids = params[:host_ids]
    if host_ids.nil?
      add_flash(_("No compute hosts were selected for scale down."), :error)
    else
      hosts = get_hosts_to_scaledown_from_ids(host_ids)

      # verify selected nodes can be removed
      has_invalid_nodes, error_return_message = verify_hosts_for_scaledown(hosts)
      if has_invalid_nodes
        add_flash(error_return_message, :error)
        return
      end

      # figure out scaledown parameters and update stack
      stack_parameters = get_scaledown_parameters(hosts, @infra, @compute_hosts)

      update_stack_down(@stack, stack_parameters, params[:id], hosts)
    end
  end

  def register_nodes
    assert_privileges("host_register_nodes")
    redirect_to(ems_infra_path(params[:id], :display => "hosts")) if params[:cancel]

    # Hiding the toolbars
    @in_a_form = true
    drop_breadcrumb(:name => _("Register Nodes"), :url => "/ems_infra/register_nodes")

    @infra = ManageIQ::Providers::Openstack::InfraManager.find(params[:id])

    if params[:register]
      if params[:nodes_json].nil? || params[:nodes_json][:file].nil?
        add_flash(_('Please select a JSON file containing the nodes you would like to register.'), :error)
        return
      end

      begin
        uploaded_file = params[:nodes_json][:file]
        nodes_json = parse_json(uploaded_file)
        if nodes_json.nil?
          add_flash(_("JSON file format is incorrect, missing 'nodes'."), :error)
        end
      rescue => ex
        add_flash(_("Cannot parse JSON file: %{message}") % {:message => ex}, :error)
      end

      if nodes_json
        begin
          @infra.workflow_service
        rescue => ex
          add_flash(_("Cannot connect to workflow service: %{message}") % {:message => ex}, :error)
          return
        end
        begin
          state, response = @infra.register_and_configure_nodes(nodes_json)
        rescue => ex
          add_flash(_("Error executing register and configure workflows: %{message}") % {:message => ex}, :error)
          return
        end
        if state == "SUCCESS"
          redirect_to(ems_infra_path(params[:id],
                                     :display   => "hosts",
                                     :flash_msg => _("Nodes were added successfully. Refresh queued.")))
        else
          add_flash(_("Unable to add nodes: %{error}") % {:error => response}, :error)
        end
      end
    end
  end

  def open_admin_ui
    assert_privileges("ems_infra_admin_ui")
    ems = identify_record(params[:id], ManageIQ::Providers::InfraManager)

    if ems.supports?(:admin_ui)
      task_id = ems.queue_generate_admin_ui_url
      initiate_wait_for_task(:task_id => task_id, :action => "open_admin_ui_done")
    else
      javascript_flash(:text     => _("Admin UI feature is not supported for this infrastructure provider"),
                       :severity => :error)
    end
  end

  def open_admin_ui_done
    task = MiqTask.find(params[:task_id])

    if task.results_ready? && task.task_results.kind_of?(String)
      javascript_open_window(task.task_results)
    else
      message = MiqTask.status_ok?(task.status) ? _("The URL is blank or not a String") : task.message
      javascript_flash(:text     => _("Infrastructure provider failed to generate Admin UI URL: %{message}") % {:message => message},
                       :severity => :error)
    end
  end

  def ems_infra_form_fields
    ems_form_fields
  end

  private

  def record_class
    case params[:pressed]
    when /^ems_cluster/
      EmsCluster
    when /^orchestration_stack/
      OrchestrationStack
    when /^storage/
      Storage
    else
      VmOrTemplate
    end
  end

  ############################
  # Special EmsCloud link builder for restful routes
  def show_link(ems, options = {})
    ems_path(ems.id, options)
  end

  def update_stack_up(stack, stack_parameters, provider_id, return_message)
    if stack_parameters_changed?(stack_parameters)
      begin
        stack.scale_up_queue(session[:userid], stack_parameters)
        add_flash(return_message)
        flash_to_session
        redirect_to(ems_infra_path(provider_id))
      rescue => ex
        add_flash(_("Unable to initiate scale up: %{message}") % {:message => ex}, :error)
      end
    end
  end

  def update_stack_down(stack, stack_parameters, provider_id, hosts)
    return_message = _(" Scaling down to %{a} compute nodes") % {:a => stack_parameters['ComputeCount']}
    if stack_parameters_changed?(stack_parameters)
      begin
        stack.scale_down_queue(session[:userid], stack_parameters, hosts)
        add_flash(return_message)
        flash_to_session
        redirect_to(ems_infra_path(provider_id))
      rescue => ex
        add_flash(_("Unable to initiate scale down: %{message}") % {:message => ex}, :error)
      end
    end
  end

  def stack_parameters_changed?(stack_parameters)
    if stack_parameters.empty?
      # No values were changed
      add_flash(_("A value must be changed or provider stack will not be updated."), :error)
      return false
    end
    true
  end

  def verify_hosts_for_scaledown(hosts)
    has_invalid_nodes = false
    error_return_message = _("Not all hosts can be removed from the deployment.")

    hosts.each do |host|
      unless host.maintenance
        has_invalid_nodes = true
        error_return_message += _(" %{host_uid_ems} needs to be in maintenance mode before it can be removed ") %
                                {:host_uid_ems => host.uid_ems}
      end
      if host.number_of(:vms).positive?
        has_invalid_nodes = true
        error_return_message += _(" %{host_uid_ems} needs to be evacuated before it can be removed ") %
                                {:host_uid_ems => host.uid_ems}
      end
      unless host.name.include?('Compute')
        has_invalid_nodes = true
        error_return_message += _(" %{host_uid_ems} is not a compute node ") % {:host_uid_ems => host.uid_ems}
      end
    end

    return has_invalid_nodes, error_return_message
  end

  def get_scaledown_parameters(hosts, provider, compute_hosts)
    resources_by_physical_resource_id = {}
    provider.orchestration_stacks.each do |s|
      s.resources.each do |r|
        resources_by_physical_resource_id[r.physical_resource] = r
      end
    end

    host_physical_resource_ids = hosts.map(&:ems_ref_obj)
    parent_resource_names = []
    host_physical_resource_ids.each do |pr_id|
      host_resource = resources_by_physical_resource_id[pr_id]
      host_stack = find_record_with_rbac(OrchestrationStack, host_resource.stack_id)
      parent_host_resource = resources_by_physical_resource_id[host_stack.ems_ref]
      parent_resource_names << parent_host_resource.logical_resource
    end

    stack_parameters = {}
    stack_parameters['ComputeCount'] = compute_hosts.length - hosts.length
    stack_parameters['ComputeRemovalPolicies'] = [{:resource_list => parent_resource_names}]
    stack_parameters
  end

  def restful?
    true
  end
  public :restful?

  def parse_json(uploaded_file)
    JSON.parse(uploaded_file.read)["nodes"]
  end

  def get_infra_provider(id)
    ManageIQ::Providers::Openstack::InfraManager.find(id)
  end

  def get_hosts_to_scaledown_from_ids(host_ids)
    host_ids.map { |host_id| find_record_with_rbac(Host, host_id) }
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Infrastructure")},
        {:title => _("Providers")},
        {:url   => controller_url, :title => _("Infrastructure Providers")},
      ],
      :record_info => @ems,
    }.compact
  end

  menu_section :inf
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons
end
