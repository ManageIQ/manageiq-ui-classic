module ApplicationController::CiProcessing
  extend ActiveSupport::Concern

  included do
    include Mixins::Actions::VmActions::Ownership
    include Mixins::Actions::VmActions::Retire
    include Mixins::Actions::VmActions::LiveMigrate
    include Mixins::Actions::VmActions::Evacuate
    include Mixins::Actions::VmActions::AssociateFloatingIp
    include Mixins::Actions::VmActions::DisassociateFloatingIp
    include Mixins::Actions::VmActions::AddSecurityGroup
    include Mixins::Actions::VmActions::RemoveSecurityGroup
    include Mixins::Actions::VmActions::Resize
    include Mixins::Actions::VmActions::RightSize
    include Mixins::Actions::VmActions::Reconfigure
    helper_method(:item_supports?)
    include Mixins::Actions::VmActions::PolicySimulation

    include Mixins::Actions::HostActions::Power
    include Mixins::Actions::HostActions::Misc

    include Mixins::ExplorerShow
  end

  # edit single selected Object
  def edit_record
    assert_privileges(params[:pressed])
    obj = find_checked_items
    db = params[:db] if params[:db]

    case params[:pressed]
    when "cloud_tenant_edit"
      @redirect_controller = "cloud_tenant"
    when "miq_template_edit"
      @redirect_controller = "miq_template"
    when "image_edit", "instance_edit", "vm_edit"
      @redirect_controller = "vm"
    when "host_edit"
      @redirect_controller = "host"
      session[:host_items] = obj.length > 1 ? obj : nil
    end
    @redirect_id = obj[0] if obj.length == 1 # not redirecting to an id if multi host are selected for credential edit
    @refresh_partial = case db
                       when 'ScanItemSet'
                         ScanItemSet.find(obj[0]).read_only ? 'show_list_set' : 'edit'
                       when 'Condition'
                         Condition.find(obj[0]).filename.nil? ? 'edit' : 'show_list'
                       when 'Schedule'
                         params[:controller] == 'report' ? 'schedule_edit' : 'edit'
                       when 'MiqAeInstance'
                         'instance_edit'
                       else
                         params[:db] == 'policyprofile' ? 'edit_set' : 'edit'
                       end
  end

  # copy single selected Object # FIXME: dead code?
  def copy_record
    obj = find_checked_items
    @refresh_partial = "copy"
    @redirect_id = obj[0]
  end

  def get_record(db)
    if db == "host"
      @host = @record = identify_record(params[:id], Host)
    elsif db == "miq_template"
      @miq_template = @record = identify_record(params[:id], MiqTemplate)
    elsif %w[vm_infra vm_cloud vm vm_or_template].include?(db)
      @vm = @record = identify_record(params[:id], VmOrTemplate)
    elsif db == "ems_cloud"
      @ems = @record = identify_record(params[:id], EmsCloud)
    elsif db == "switch"
      @switch = @record = identify_record(params[:id], Switch)
    elsif db == "service"
      @service = @record = identify_record(params[:id], Service)
    end
  end

  def get_error_message_from_fog(exception)
    exception_string = exception.to_s
    matched_message = exception_string.match(/message\\\": \\\"(.*)\\\", /)
    matched_message ? matched_message[1] : exception_string
  end

  private

  def vm_button_action
    method(:process_objects)
  end

  def cluster_button_action
    method(:process_clusters)
  end

  def storage_button_action
    method(:process_storage)
  end

  def process_elements(elements, klass, task, display_name = nil, order_field = nil)
    order_field ||= %w[name description title].find { |field| klass.column_names.include?(field) }

    order_by = order_field == "ems_id" ? order_field : klass.arel_table[order_field].lower

    Rbac.filtered(klass.where(:id => elements).order(order_by)).each do |record|
      name = record.send(order_field.to_sym)
      if task == 'destroy'
        name = record.send(:description) if klass.name == 'MiqPolicy'
        process_element_destroy(record, klass, name)
      else
        begin
          record.send(task.to_sym) if record.respond_to?(task) # Run the task
        rescue StandardError => bang
          add_flash(
            _("%{model} \"%{name}\": Error during '%{task}': %{error_msg}") %
            {
              :model     => ui_lookup(:model => klass.name),
              :name      => get_record_display_name(record),
              :task      => (display_name || task),
              :error_msg => bang.message
            },
            :error
          )
        else
          add_flash(
            _("%{model} \"%{name}\": %{task} successfully initiated") %
            {
              :model => ui_lookup(:model => klass.name),
              :name  => get_record_display_name(record),
              :task  => (display_name || task)
            }
          )
        end
      end
    end
  end

  def explorer_controller?
    %w[vm_cloud vm_infra vm_or_template infra_networking].include?(controller_name)
  end

  def process_element_destroy(element, klass, name)
    return unless element.respond_to?(:destroy)

    audit = {:event        => "#{klass.name.downcase}_record_delete",
             :message      => "[#{name}] Record deleted",
             :target_id    => element.id,
             :target_class => klass.base_class.name,
             :userid       => session[:userid]}

    model_name  = ui_lookup(:model => klass.name) # Lookup friendly model name in dictionary
    record_name = get_record_display_name(element)

    begin
      element.destroy
    rescue StandardError => bang
      add_flash(_("%{model} \"%{name}\": Error during delete: %{error_msg}") %
               {:model => model_name, :name => record_name, :error_msg => bang.message}, :error)
    else
      if element.destroyed?
        AuditEvent.success(audit)
        add_flash(_("%{model} \"%{name}\": Delete successful") % {:model => model_name, :name => record_name})
      else
        error_msg = element.errors.collect { |error| error.message }.join(';')
        add_flash(_("%{model} \"%{name}\": Error during delete: %{error_msg}") %
                 {:model => model_name, :name => record_name, :error_msg => error_msg}, :error)
      end
    end
  end

  # find the record that was chosen
  def identify_record(id, klass = self.class.model)
    begin
      record = find_record_with_rbac(klass, id)
    rescue StandardError => @bang
      self.x_node = "root" if @explorer
      flash_to_session(@bang.message, :error, true)
    end
    record
  end

  def process_show_list(options = {})
    session["#{self.class.session_key_prefix}_display".to_sym] = nil
    @display = nil
    @lastaction = "show_list"
    @gtl_url = "/show_list"

    model = options.delete(:model) # Get passed in model override
    @view, @pages = get_view(model || self.class.model, options) # Get the records (into a view) and the paginator
    if session[:bc] && session[:menu_click] # See if we came from a perf chart menu click
      drop_breadcrumb(:name => session[:bc],
                      :url  => url_for_only_path(:controller    => self.class.table_name,
                                                 :action        => "show_list",
                                                 :bc            => session[:bc],
                                                 :sb_controller => params[:sb_controller],
                                                 :menu_click    => session[:menu_click],
                                                 :escape        => false))
    else
      @breadcrumbs = []
      bc_name = breadcrumb_name(model)
      bc_name += " - " + session["#{self.class.session_key_prefix}_type".to_sym].titleize if session["#{self.class.session_key_prefix}_type".to_sym]
      bc_name += " (filtered)" if @filters && (@filters[:tags].present? || @filters[:cats].present?)
      action = %w[service vm_cloud vm_infra vm_or_template storage service_template].include?(self.class.table_name) ? "explorer" : "show_list"
      drop_breadcrumb(:name => bc_name, :url => "/#{controller_name}/#{action}")
    end
    @layout = session["#{self.class.session_key_prefix}_type".to_sym] if session["#{self.class.session_key_prefix}_type".to_sym]
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    build_listnav_search_list(@view.db) if !["miq_task"].include?(@layout) && !session[:menu_click]
  end

  def breadcrumb_name(_model)
    ui_lookup(:models => self.class.model.name)
  end

  def process_cloud_object_storage_buttons(pressed)
    assert_privileges(pressed)

    klass = record_class
    task = pressed.sub("#{klass.name.underscore.to_sym}_", "")

    return tag(klass) if task == "tag"

    cloud_object_store_button_operation(klass, task)
  end

  def cloud_object_store_button_operation(klass, task)
    display_name = _(task.capitalize)
    method = "#{klass.name.underscore.to_sym}_#{task}"
    task = method unless task == 'delete'
    items = find_records_with_rbac(klass, checked_or_params)
    unless records_support_feature?(items, task)
      message = if items.length == 1
                  _("%{task} does not apply to this item")
                else
                  _("%{task} does not apply to at least one of the selected items")
                end
      add_flash(message % {:task => display_name}, :error)
      return
    end
    process_objects(items.ids.sort, method, display_name)
  end

  def record_class
    VmOrTemplate
  end

  def process_objects(objs, task, display_name = nil)
    klass = record_class
    klass_str = klass.to_s

    assert_rbac(klass, objs)

    display_name ||= task.titleize
    case klass_str
    when 'CloudObjectStoreContainer', 'CloudObjectStoreObject'
      objs, _objs_out_reg = filter_ids_in_region(objs, klass_str)
    when 'VmOrTemplate'
      objs, _objs_out_reg = filter_ids_in_region(objs, "VM") unless VmOrTemplate::REMOTE_REGION_TASKS.include?(task)
      klass = Vm
    when 'OrchestrationStack', 'Service'
      objs, _objs_out_reg = filter_ids_in_region(objs, klass_str) unless task == "retire_now"
    end
    return if objs.empty?

    options = {:ids => objs, :task => task, :userid => session[:userid]}
    options[:snap_selected] = session[:snap_selected] if %w[remove_snapshot revert_to_snapshot].include?(task)
    klass.process_tasks(options)
  rescue StandardError => err
    add_flash(_("Error during '%{task}': %{error_message}") % {:task => task, :error_message => err.message}, :error)
  else
    add_flash(
      n_(
        "%{task} initiated for %{number} %{model} from the %{product} Database",
        "%{task} initiated for %{number} %{models} from the %{product} Database",
        objs.length
      ) %
      {
        # FIXME: Unify the dataflow: get rid of 'task_name (ApplicationHelper::Tasks)'.
        :task    => display_name,
        :number  => objs.length,
        :product => Vmdb::Appliance.PRODUCT_NAME,
        :model   => ui_lookup(:model => klass.to_s),
        :models  => ui_lookup(:models => klass.to_s)
      }
    )
    params[:miq_grid_checks] = [] if task == 'destroy' # Making selected checkboxes array empty when those rows are  deleted in table
  end

  def manager_button_operation(method, display_name)
    items = params[:id] ? [params[:id]] : find_checked_items

    if items.empty?
      add_flash(_("No providers were selected for %{task}") % {:task => display_name}, :error)
      return
    end

    process_managers(items, method)
  end

  def process_managers(managers, task)
    controller_class = request.parameters[:controller]
    provider_class = case controller_class
                     when 'ems_automation' then ManageIQ::Providers::AutomationManager
                     when 'ems_configuration'  then ManageIQ::Providers::ConfigurationManager
                     end

    manager_ids, _services_out_region = filter_ids_in_region(managers, provider_class.to_s)
    return if manager_ids.empty?

    assert_rbac(provider_class, manager_ids)

    options = {:ids => manager_ids, :task => task, :userid => session[:userid]}
    kls = provider_class.find_by(:id => manager_ids.first).class
    kls.process_tasks(options)
  rescue StandardError => err
    add_flash(_("Error during '%{task}': %{message}") % {:task => task, :message => err.message}, :error)
  else
    add_flash(n_("%{task} initiated for %{count} provider",
                 "%{task} initiated for %{count} providers", manager_ids.length) %
                {:task  => task_name(task),
                 :count => manager_ids.length})
    if @lastaction == "show_list"
      params[:miq_grid_checks] = []
      show_list
      @refresh_partial = "layouts/gtl"
    else
      params[:display] = @display
    end
  end

  # Delete all selected or single displayed VM(s)
  def deletevms
    assert_privileges(params[:pressed])
    generic_button_operation('destroy', _('Delete'), vm_button_action)
  end
  alias image_delete deletevms
  alias instance_delete deletevms
  alias vm_delete deletevms
  alias miq_template_delete deletevms

  # Import info for all selected or single displayed vm(s)
  def syncvms
    assert_privileges(params[:pressed])
    generic_button_operation('sync', _('Virtual Black Box synchronization'), vm_button_action)
  end

  DEFAULT_PRIVILEGE = Object.new # :nodoc:

  # Refresh the power states for selected or single VMs
  def refreshvms(privilege = DEFAULT_PRIVILEGE)
    if privilege == DEFAULT_PRIVILEGE
      Vmdb::Deprecation.warn(<<-MSG.strip_heredoc, caller_locations[1..-1])
      Please pass the privilege you want to check for when refreshing
      MSG
      privilege = params[:pressed]
    end
    assert_privileges(privilege)
    generic_button_operation('refresh_ems', _('Refresh Provider'), vm_button_action)
  end
  alias image_refresh refreshvms
  alias instance_refresh refreshvms
  alias vm_refresh refreshvms
  alias miq_template_refresh refreshvms

  # Import info for all selected or single displayed vm(s)
  def scanvms
    assert_privileges(params[:pressed])
    generic_button_operation('scan', _('Analysis'), vm_button_action)
  end
  alias image_scan scanvms
  alias instance_scan scanvms
  alias vm_scan scanvms
  alias miq_template_scan scanvms

  # Immediately retire items
  def retirevms_now
    assert_privileges(params[:pressed])
    redirect = {
      :redirect => {
        :controller => 'miq_request',
        :action     => 'show_list'
      }
    }
    generic_button_operation('retire_now', _('Retirement'), vm_button_action, role_allows?(:feature => "miq_request_show_list") ? redirect : nil)
  end
  alias instance_retire_now retirevms_now
  alias vm_retire_now retirevms_now
  alias orchestration_stack_retire_now retirevms_now
  alias service_retire_now retirevms_now

  def check_compliance_vms
    assert_privileges(params[:pressed])

    records = find_records_with_rbac(record_class, checked_or_params)
    # Check each record if there is any compliance policy assigned to it
    if records.any? { |record| !record.has_compliance_policies? }
      javascript_flash(
        :text       => _('No Compliance Policies assigned to one or more of the selected items'),
        :severity   => :error,
      )
      return
    end

    generic_button_operation('check_compliance_queue', _('Check Compliance'), vm_button_action)
  end
  alias image_check_compliance check_compliance_vms
  alias instance_check_compliance check_compliance_vms
  alias vm_check_compliance check_compliance_vms
  alias miq_template_check_compliance check_compliance_vms

  # Collect running processes for all selected or single displayed vm(s)
  def getprocessesvms
    assert_privileges(params[:pressed])
    generic_button_operation('collect_running_processes', _('Collect Running Processes'), vm_button_action)
  end
  alias instance_collect_running_processes getprocessesvms
  alias vm_collect_running_processes getprocessesvms

  # Start all selected or single displayed vm(s)
  def startvms
    assert_privileges(params[:pressed])
    generic_button_operation('start', _('Start'), vm_button_action)
  end
  alias instance_start startvms
  alias vm_start startvms

  # Suspend all selected or single displayed vm(s)
  def suspendvms
    assert_privileges(params[:pressed])
    generic_button_operation('suspend', _('Suspend'), vm_button_action)
  end
  alias instance_suspend suspendvms
  alias vm_suspend suspendvms

  # Pause all selected or single displayed vm(s)
  def pausevms
    assert_privileges(params[:pressed])
    generic_button_operation('pause', _('Pause'), vm_button_action)
  end
  alias instance_pause pausevms
  alias vm_pause pausevms

  # Terminate all selected or single displayed vm(s)
  def terminatevms
    assert_privileges(params[:pressed])
    generic_button_operation('vm_destroy', _('Terminate'), vm_button_action)
  end
  alias instance_terminate terminatevms
  alias vm_terminate terminatevms

  # Stop all selected or single displayed vm(s)
  def stopvms
    assert_privileges(params[:pressed])
    generic_button_operation('stop', _('Stop'), vm_button_action)
  end
  alias instance_stop stopvms
  alias vm_stop stopvms

  # Shelve all selected or single displayed vm(s)
  def shelvevms
    assert_privileges(params[:pressed])
    generic_button_operation('shelve', _('Shelve'), vm_button_action)
  end
  alias instance_shelve shelvevms
  alias vm_shelve shelvevms

  # Shelve all selected or single displayed vm(s)
  def shelveoffloadvms
    assert_privileges(params[:pressed])
    generic_button_operation('shelve_offload', _('Shelve Offload'), vm_button_action)
  end
  alias instance_shelve_offload shelveoffloadvms
  alias vm_shelve_offload shelveoffloadvms

  # Reset all selected or single displayed vm(s)
  def resetvms
    assert_privileges(params[:pressed])
    generic_button_operation('reset', _('Reset'), vm_button_action)
  end
  alias instance_reset resetvms
  alias vm_reset resetvms

  # Shutdown guests on all selected or single displayed vm(s)
  def guestshutdown
    assert_privileges(params[:pressed])
    generic_button_operation('shutdown_guest', _('Shutdown Guest'), vm_button_action)
  end
  alias vm_guest_shutdown guestshutdown

  # Standby guests on all selected or single displayed vm(s)
  def gueststandby
    assert_privileges(params[:pressed])
    generic_button_operation('standby_guest', _('Standby Guest'), vm_button_action)
  end

  # Restart guests on all selected or single displayed vm(s)
  def guestreboot
    assert_privileges(params[:pressed])
    generic_button_operation('reboot_guest', _('Restart Guest'), vm_button_action)
  end
  alias instance_guest_restart guestreboot
  alias vm_guest_restart guestreboot

  # Delete all snapshots for vm(s)
  def deleteallsnapsvms
    assert_privileges(params[:pressed])
    generic_button_operation('remove_all_snapshots', _('Delete All Snapshots'), vm_button_action,
                             @explorer ? {} : {:refresh_partial => 'vm_common/config'})
  end
  alias vm_snapshot_delete_all deleteallsnapsvms

  # Delete selected snapshot for vm
  def deletesnapsvms
    assert_privileges(params[:pressed])
    generic_button_operation('remove_snapshot', _('Delete Snapshot'), vm_button_action,
                             @explorer ? {} : {:refresh_partial => 'vm_common/config'})
  end
  alias vm_snapshot_delete deletesnapsvms

  # Delete selected snapshot for vm
  def revertsnapsvms
    assert_privileges(params[:pressed])
    generic_button_operation('revert_to_snapshot', _('Revert to a Snapshot'), vm_button_action,
                             @explorer ? {} : {:refresh_partial => 'vm_common/config'})
  end
  alias vm_snapshot_revert revertsnapsvms

  # End of common VM button handler routines

  # Common Cluster button handler routines
  def process_clusters(clusters, task, _ = nil)
    clusters, _clusters_out_region = filter_ids_in_region(clusters, _("Cluster"))
    return if clusters.empty?

    if task == "destroy"
      EmsCluster.where(:id => clusters).order(EmsCluster.arel_table[:name].lower).each do |cluster|
        id = cluster.id
        cluster_name = cluster.name
        audit = {:event => "ems_cluster_record_delete_initiated", :message => "[#{cluster_name}] Record delete initiated", :target_id => id, :target_class => "EmsCluster", :userid => session[:userid]}
        AuditEvent.success(audit)
      end
      EmsCluster.destroy_queue(clusters)
    else
      EmsCluster.where(:id => clusters).order(EmsCluster.arel_table[:name].lower).each do |cluster|
        cluster_name = cluster.name
        begin
          cluster.send(task.to_sym) if cluster.respond_to?(task) # Run the task
        rescue StandardError => err
          add_flash(_("Cluster \"%{name}\": Error during '%{task}': %{error_message}") %
            {:name          => cluster_name,
             :task          => task,
             :error_message => err.message}, :error) # Push msg and error flag
        else
          add_flash(_("Cluster: %{task} successfully initiated") % {:task => task})
        end
      end
    end
  end

  # Common RP button handler routines
  def process_resourcepools(rps, task)
    rps, _rps_out_region = filter_ids_in_region(rps, "Resource Pool")
    return if rps.empty?

    if task == "destroy"
      ResourcePool.where(:id => rps).order(ResourcePool.arel_table[:name].lower).each do |rp|
        id = rp.id
        rp_name = rp.name
        audit = {:event => "rp_record_delete_initiated", :message => "[#{rp_name}] Record delete initiated", :target_id => id, :target_class => "ResourcePool", :userid => session[:userid]}
        AuditEvent.success(audit)
      end
      ResourcePool.destroy_queue(rps)
    else
      ResourcePool.where(:id => rps).order(ResourcePool.arel_table[:name].lower).each do |rp|
        rp_name = rp.name
        begin
          rp.send(task.to_sym) if rp.respond_to?(task) # Run the task
        rescue StandardError => err
          add_flash(_("Resource Pool \"%{name}\": Error during '%{task}': %{error_message}") %
            {:name          => rp_name,
             :task          => task,
             :error_message => err.message}, :error)
        else
          add_flash(_("Resource Pool \"%{name}\": %{task} successfully initiated") % {:name => rp_name, :task => task})
        end
      end
    end
  end

  # The method takes care of task processing initiated from UI on the
  # selected records.
  #
  # In case a record does not support the feature, it won't be ran for
  # any of selected records.
  #
  # Params:
  #   action      - a string indicating the operation user wants to execute
  #   action_name - a string of an action used for a flash message in case
  #                 the task can not be applied
  #   operation   - a block with a operation, specific to the type of action
  #                 on a record
  #   options     - other optional parameters
  def generic_button_operation(action, action_name, operation, options = {})
    records = find_records_with_rbac(record_class, checked_or_params)
    if !records_support_feature?(records, action_to_feature(action))
      javascript_flash(
        :text       => _("%{action_name} action does not apply to selected items") % {:action_name => action_name},
        :severity   => :error,
        :scroll_top => true
      )
      return
    end
    operation.call(records.map(&:id), action, action_name)
    @single_delete = action == 'destroy' && !flash_errors?
    screen_redirection(options)
  end

  # Maps UI actions to queryable feature in case it is not possible
  # to use the action itself in supports query.
  #
  # Params:
  #   action      - a string indicating the operation user wants to execute
  # Returns:
  #   symbol      - a feature implemented by using SupportsFeatureMixin
  def action_to_feature(action)
    feature_aliases = {
      "scan"                   => :smartstate_analysis,
      "retire_now"             => :retire,
      "vm_destroy"             => :terminate,
      "vm_miq_request_new"     => :provisioning,
      "check_compliance_queue" => :check_compliance
    }
    feature_aliases[action] || action.to_sym
  end

  # Explorer or non-explorer screen redirection.
  #
  # Params:
  #   options - specific partial to render
  def screen_redirection(options)
    if options[:redirect].present?
      javascript_redirect(:controller => options[:redirect][:controller],
                          :action     => options[:redirect][:action])
      return
    end
    if %w[show_list storage_list storage_pod_list].include?(@lastaction)
      show_list unless @explorer
      @refresh_partial = "layouts/gtl"
      return
    end
    if options[:refresh_partial].present?
      show
      @refresh_partial = options[:refresh_partial]
      nil
    end
  end

  # Scan all selected or single displayed cluster(s)
  def scanclusters
    assert_privileges("ems_cluster_scan")
    generic_button_operation('scan', _('Analysis'), cluster_button_action,
                             :refresh_partial => %w[vm hosts].include?(@display) ? 'layouts/gtl' : 'config')
  end

  # Common Stacks button handler routines
  def process_orchestration_stacks(stacks, task, _ = nil)
    stacks, = filter_ids_in_region(stacks, "OrchestrationStack")
    return if stacks.empty?

    if task == "destroy"
      OrchestrationStack.where(:id => stacks).order(OrchestrationStack.arel_table[:name].lower).each do |stack|
        id = stack.id
        stack_name = stack.name
        audit = {:event        => "stack_record_delete_initiated",
                 :message      => "[#{stack_name}] Record delete initiated",
                 :target_id    => id,
                 :target_class => "OrchestrationStack",
                 :userid       => session[:userid]}
        AuditEvent.success(audit)
      end
      OrchestrationStack.destroy_queue(stacks)
    end
  end

  # Common Stacks button handler routines
  def process_configuration_jobs(stacks, task, _ = nil)
    stacks, = filter_ids_in_region(stacks, "ManageIQ::Providers::AnsibleTower::AutomationManager::Job")
    return if stacks.empty?

    if task == "destroy"
      model = ManageIQ::Providers::AnsibleTower::AutomationManager::Job
      model.where(:id => stacks).order(model.arel_table[:name].lower).each do |stack|
        id = stack.id
        stack_name = stack.name
        audit = {:event        => "stack_record_delete_initiated",
                 :message      => "[#{stack_name}] Record delete initiated",
                 :target_id    => id,
                 :target_class => "ManageIQ::Providers::AnsibleTower::AutomationManager::Job",
                 :userid       => session[:userid]}
        AuditEvent.success(audit)
      end
      model.destroy_queue(stacks)
    end
  end

  def process_storage(storages, task, _ = nil)
    storages, _storages_out_region = filter_ids_in_region(storages, _("Datastore"))
    return if storages.empty?

    if task == "destroy"
      Storage.where(:id => storages).order(Storage.arel_table[:name].lower).each do |storage|
        id = storage.id
        storage_name = storage.name
        audit = {:event => "storage_record_delete_initiated", :message => "[#{storage_name}] Record delete initiated", :target_id => id, :target_class => "Storage", :userid => session[:userid]}
        AuditEvent.success(audit)
      end
      Storage.destroy_queue(storages)
      add_flash(n_("Delete initiated for Datastore from the %{product} Database",
                   "Delete initiated for Datastores from the %{product} Database", storages.length) % {:product => Vmdb::Appliance.PRODUCT_NAME})
    else
      Storage.where(:id => storages).order(Storage.arel_table[:name].lower).each do |storage|
        storage_name = storage.name
        begin
          if task == "scan"
            storage.send(task.to_sym, session[:userid]) # Scan needs userid
          elsif storage.respond_to?(task) # Run the task
            storage.send(task.to_sym)
          end
        rescue StandardError => err
          add_flash(_("Datastore \"%{name}\": Error during '%{task}': %{error_message}") %
            {:name          => storage_name,
             :task          => task,
             :error_message => err.message}, :error) # Push msg and error flag
        else
          if task == "refresh_ems"
            add_flash(_("\"%{record}\": Refresh successfully initiated") % {:record => storage_name})
          else
            add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => storage_name, :task => task})
          end
        end
      end
    end
  end

  # Scan all selected or single displayed storage(s)
  def scanstorage
    assert_privileges("storage_scan")
    generic_button_operation('scan', _('SmartState Analysis'), storage_button_action,
                             :refresh_partial => %w[vm hosts].include?(@display) ? 'layouts/gtl' : 'config')
  end

  # Delete all selected or single displayed host(s)
  def deletehosts
    assert_privileges("host_delete")
    delete_elements(Host, :process_hosts)
  end

  def delete_cloud_tenant
    assert_privileges("cloud_tenant_delete")
    delete_elements(CloudTenant, :process_cloud_tenants)
  end

  # Delete all selected or single displayed stack(s)
  def orchestration_stack_delete
    assert_privileges("orchestration_stack_delete")
    begin
      delete_elements(OrchestrationStack, :process_orchestration_stacks)
    rescue StandardError => err
      add_flash(_("Error during deletion: %{error_message}") % {:error_message => err.message}, :error)
      if @lastaction == "show_list"
        show_list
        @refresh_partial = "layouts/gtl"
      end
    end
  end

  def configuration_job_delete
    assert_privileges("configuration_job_delete")
    delete_elements(ManageIQ::Providers::AnsibleTower::AutomationManager::Job,
                    :process_configuration_jobs,
                    'configuration_job')
  end

  # Delete all selected or single displayed datastore(s)
  def deletestorages
    assert_privileges("storage_delete")
    storages = find_records_with_rbac(Storage, checked_or_params)
    unless records_support_feature?(storages, 'delete')
      add_flash(_("Only storage without VMs and Hosts can be removed"), :error)
      return
    end
    storages.each do |storage|
      next if !storage.vms_and_templates.length.positive? &&
              !storage.hosts.length.positive?

      storages -= [storage]
      add_flash(_("\"%{datastore_name}\": cannot be removed, has vms or hosts") %
        {:datastore_name => storage.name}, :warning)
    end
    process_storage(storages.ids, 'destroy') unless storages.empty?
    if !%w[show_list storage_list storage_pod_list].include?(@lastaction) ||
       (@lastaction == "show" && @layout != "storage")
      @single_delete = !flash_errors?
    end
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    end
  end

  def delete_elements(model_class, destroy_method, model_name = nil)
    model_name ||= model_class.table_name
    elements = find_records_with_rbac(model_class, checked_or_params)
    send(destroy_method, elements.ids, 'destroy')
    if params[:miq_grid_checks].present? || @lastaction == "show_list" || (@lastaction == "show" && @layout != model_name.singularize) # showing a list
      params[:miq_grid_checks] = []
      unless flash_errors?
        add_flash(n_("Delete initiated for %{count} %{model} from the %{product} Database",
                     "Delete initiated for %{count} %{models} from the %{product} Database", elements.length) %
          {:count   => elements.length,
           :product => Vmdb::Appliance.PRODUCT_NAME,
           :model   => ui_lookup(:table => model_name),
           :models  => ui_lookup(:tables => model_name)})
      end
    else # showing 1 element, delete it
      @single_delete = true unless flash_errors?
      add_flash(_("The selected %{record} was deleted") % {:record => ui_lookup(:table => model_name)}) if @flash_array.nil?
    end
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    end
  end

  # Delete all selected or single displayed cluster(s)
  def deleteclusters
    assert_privileges("ems_cluster_delete")
    delete_elements(EmsCluster, :process_clusters)
  end

  # Delete all selected or single displayed flavor(s)
  def delete_flavors
    assert_privileges('flavor_delete')
    flavors = find_records_with_rbac(Flavor, checked_or_params)
    flavors.each do |flavor|
      flavor.delete_flavor_queue(User.current_user.id)
      add_flash(_("Delete of Flavor \"%{name}\" was successfully initiated.") % {:name => flavor.name})
    rescue StandardError => error
      add_flash(_("Unable to delete Flavor \"%{name}\": %{details}") % {:name    => flavor.name,
                                                                        :details => error.message}, :error)
    end
  end

  # Delete all selected or single displayed RP(s)
  def deleteresourcepools
    assert_privileges("resource_pool_delete")
    delete_elements(ResourcePool, :process_resourcepools)
  end

  # FIXME: need to unify pfx_for_vm_button_pressed and vm_style_button?
  def pfx_for_vm_button_pressed(pressed)
    if pressed.starts_with?("image_")
      "image"
    elsif pressed.starts_with?("instance_")
      "instance"
    elsif pressed.starts_with?("miq_template_")
      "miq_template"
    elsif pressed.starts_with?("orchestration_stack_")
      "orchestration_stack" # orchestration_stack does not belong here, added in 060dfb36
    else # need to get rid of the 'else' branch
      "vm"
    end
  end

  # These VM-type buttons flash (in case of error) or redirect
  def vm_button_redirected?(pfx, pressed)
    ["#{pfx}_policy_sim", "#{pfx}_compare", "#{pfx}_tag",
     "#{pfx}_retire", "#{pfx}_protect", "#{pfx}_ownership",
     "#{pfx}_refresh", "#{pfx}_right_size",
     "#{pfx}_reconfigure",
     "#{pfx}_resize", "#{pfx}_live_migrate", "#{pfx}_evacuate"].include?(pressed) && @flash_array.nil?
  end

  def vm_style_button?(pressed)
    pressed.starts_with?("image_",
                         "instance_",
                         "vm_",
                         "miq_template_",
                         "guest_") # guest_ seems to be a non-sense
  end

  def process_vm_buttons(pfx)
    case params[:pressed]
    when "#{pfx}_policy_sim"                then polsimvms
    when "#{pfx}_compare"                   then comparemiq
    when "#{pfx}_scan"                      then scanvms
    when "#{pfx}_collect_running_processes" then getprocessesvms
    when "#{pfx}_sync"                      then syncvms
    when "#{pfx}_tag"                       then tag(VmOrTemplate)
    when "#{pfx}_delete"                    then deletevms
    when "#{pfx}_protect"                   then assign_policies(VmOrTemplate)
    when "#{pfx}_edit"                      then edit_record
    when "#{pfx}_refresh"                   then refreshvms
    when "#{pfx}_start"                     then startvms
    when "#{pfx}_stop"                      then stopvms
    when "#{pfx}_suspend"                   then suspendvms
    when "#{pfx}_pause"                     then pausevms
    when "#{pfx}_shelve"                    then shelvevms
    when "#{pfx}_shelve_offload"            then shelveoffloadvms
    when "#{pfx}_reset"                     then resetvms
    when "#{pfx}_check_compliance"          then check_compliance_vms
    when "#{pfx}_reconfigure"               then vm_reconfigure
    when "#{pfx}_resize"                    then resizevms
    when "#{pfx}_evacuate"                  then evacuatevms
    when "#{pfx}_live_migrate"              then livemigratevms
    when "#{pfx}_associate_floating_ip"     then associate_floating_ip_vms
    when "#{pfx}_disassociate_floating_ip"  then disassociate_floating_ip_vms
    when "#{pfx}_retire"                    then retirevms
    when "#{pfx}_retire_now"                then retirevms_now
    when "#{pfx}_right_size"                then vm_right_size
    when "#{pfx}_ownership"                 then set_ownership
    when "#{pfx}_guest_shutdown"            then guestshutdown
    when "#{pfx}_guest_standby"             then gueststandby
    when "#{pfx}_guest_restart"             then guestreboot
    when "#{pfx}_miq_request_new"           then prov_redirect
    when "#{pfx}_clone"                     then prov_redirect("clone")
    when "#{pfx}_migrate"                   then prov_redirect("migrate")
    when "#{pfx}_publish"                   then prov_redirect("publish")
    when "#{pfx}_terminate"                 then terminatevms
    when "instance_add_security_group"      then add_security_group_vms
    when "instance_remove_security_group"   then remove_security_group_vms
    end
  end
end
