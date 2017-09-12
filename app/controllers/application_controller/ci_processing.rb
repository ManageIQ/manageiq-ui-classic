module ApplicationController::CiProcessing
  extend ActiveSupport::Concern

  included do
    include Mixins::Actions::VmActions::Ownership
    include Mixins::Actions::VmActions::Retire
    include Mixins::Actions::VmActions::LiveMigrate
    include Mixins::Actions::VmActions::Evacuate
    include Mixins::Actions::VmActions::AssociateFloatingIp
    include Mixins::Actions::VmActions::DisassociateFloatingIp
    include Mixins::Actions::VmActions::Resize
    include Mixins::Actions::VmActions::RightSize
    include Mixins::Actions::VmActions::Reconfigure
    helper_method :supports_reconfigure_disks?
    include Mixins::Actions::VmActions::PolicySimulation

    include Mixins::Actions::HostActions::Discover
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
    when "miq_template_edit"
      @redirect_controller = "miq_template"
    when "image_edit", "instance_edit", "vm_edit"
      @redirect_controller = "vm"
    when "host_edit"
      @redirect_controller = "host"
      session[:host_items] = obj if obj.length > 1
    end
    @redirect_id = obj[0] if obj.length == 1      # not redirecting to an id if multi host are selected for credential edit

    if !["ScanItemSet", "Condition", "Schedule", "MiqAeInstance"].include?(db)
      @refresh_partial = "edit"
      @refresh_partial = "edit_set" if params[:db] == "policyprofile"
    else
      if db == "ScanItemSet"
        scan = ScanItemSet.find(obj[0])
        if !scan.read_only
          @refresh_partial = "edit"
        else
          @refresh_partial = "show_list_set"
        end
      elsif db == "Condition"
        cond = Condition.find(obj[0])
        if cond.filename.nil?
          @refresh_partial = "edit"
        else
          @refresh_partial = "show_list"
        end
      elsif db == "Schedule" && params[:controller] != "report"
        sched = MiqSchedule.find(obj[0])
        @refresh_partial = "edit"
      elsif db == "Schedule" && params[:controller] == "report"
        sched = MiqSchedule.find(obj[0])
        @refresh_partial = "schedule_edit"
      elsif db == "MiqAeInstance"
        @refresh_partial = "instance_edit"
      end
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
    elsif ["vm_infra", "vm_cloud", "vm", "vm_or_template"].include?(db)
      @vm = @record = identify_record(params[:id], VmOrTemplate)
    elsif db == "ems_cloud"
      @ems = @record = identify_record(params[:id], EmsCloud)
    elsif db == "switch"
      @switch = @record = identify_record(params[:id], Switch)
    end
  end

  def get_error_message_from_fog(exception)
    exception_string = exception.to_s
    matched_message = exception_string.match(/message\\\": \\\"(.*)\\\", /)
    matched_message ? matched_message[1] : exception_string
  end

  private

  def process_elements(elements, klass, task, display_name = nil, order_field = nil)
    order_field ||= %w(name description title).find do |field|
                      klass.column_names.include?(field)
                    end

    order_by = order_field == "ems_id" ? order_field : "lower(#{order_field})"

    Rbac.filtered(klass.where(:id => elements).order(order_by)).each do |record|
      name = record.send(order_field.to_sym)
      if task == 'destroy'
        process_element_destroy(record, klass, name)
      else
        begin
          record.send(task.to_sym) if record.respond_to?(task) # Run the task
        rescue => bang
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
    %w(vm_cloud vm_infra vm_or_template infra_networking).include?(controller_name)
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
    rescue => bang
      add_flash(_("%{model} \"%{name}\": Error during delete: %{error_msg}") %
               {:model => model_name, :name => record_name, :error_msg => bang.message}, :error)
    else
      if element.destroyed?
        AuditEvent.success(audit)
        add_flash(_("%{model} \"%{name}\": Delete successful") % {:model => model_name, :name => record_name})
      else
        error_msg = element.errors.collect { |_attr, msg| msg }.join(';')
        add_flash(_("%{model} \"%{name}\": Error during delete: %{error_msg}") %
                 {:model => model_name, :name => record_name, :error_msg => error_msg}, :error)
      end
    end
  end

  # find the record that was chosen
  def identify_record(id, klass = self.class.model)
    begin
      record = find_record_with_rbac(klass, from_cid(id))
    rescue ActiveRecord::RecordNotFound
    rescue => @bang
      self.x_node = "root" if @explorer
      add_flash(@bang.message, :error, true)
      session[:flash_msgs] = @flash_array.dup
    end
    record
  end

  def process_show_list(options = {})
    session["#{self.class.session_key_prefix}_display".to_sym] = nil
    @display  = nil
    @lastaction  = "show_list"
    @gtl_url = "/show_list"

    model = options.delete(:model) # Get passed in model override
    @view, @pages = get_view(model || self.class.model, options)  # Get the records (into a view) and the paginator
    if session[:bc] && session[:menu_click]               # See if we came from a perf chart menu click
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
      bc_name += " (filtered)" if @filters && (!@filters[:tags].blank? || !@filters[:cats].blank?)
      action = %w(service vm_cloud vm_infra vm_or_template storage service_template).include?(self.class.table_name) ? "explorer" : "show_list"
      @breadcrumbs.clear
      drop_breadcrumb(:name => bc_name, :url => "/#{controller_name}/#{action}")
    end
    @layout = session["#{self.class.session_key_prefix}_type".to_sym] if session["#{self.class.session_key_prefix}_type".to_sym]
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    build_listnav_search_list(@view.db) if !["miq_task"].include?(@layout) && !session[:menu_click]
  end

  def breadcrumb_name(_model)
    ui_lookup(:models => self.class.model.name)
  end

  def check_retire_requirements(selected_items)
    # FIXME: should check model, not controller
    return true if %w(orchestration_stack service).include?(controller_name)

    if VmOrTemplate.find(selected_items).any? { |vm| !vm.supports_retire? }
      javascript_flash(:text => _("Retire does not apply to selected item"), :severity => :error, :scroll_top => true)
      return false
    end
    true
  end

  def check_scan_requirements(selected_items)
    unless VmOrTemplate.batch_operation_supported?('smartstate_analysis', selected_items)
      render_flash_not_applicable_to_model('Smartstate Analysis', ui_lookup(:tables => "vm_or_template"))
      return false
    end
    true
  end

  def check_reset_requirements(selected_items)
    if VmOrTemplate.find(selected_items).any? { |vm| !vm.supports_reset? }
      javascript_flash(:text => _("Reset does not apply to at least one of the selected items"), :severity => :error, :scroll_top => true)
      return false
    end
    true
  end

  def check_non_empty(items, display_name)
    if items.blank?
      add_flash(_("No items were selected for %{task}") % {:task => display_name}, :error)
      return false
    end
    true
  end

  def vm_button_operation_internal(items, task, display_name)
    return false if task == 'retire_now' && !check_retire_requirements(items)
    return false if task == 'scan' && !check_scan_requirements(items)
    return false if task == 'reset' && !check_reset_requirements(items)
    return false unless check_non_empty(items, display_name)

    process_objects(items, task, display_name)
    true
  end

  # Common item button handler routines
  def vm_button_operation(task, display_name, partial_after_single_selection = nil)
    klass = get_rec_cls

    # Either a list or coming from a different controller (e.g. from host screen, go to its vms)
    if @lastaction == "show_list" ||
       !%w(service vm_cloud vm_infra vm miq_template vm_or_template).include?(controller_name)

      # FIXME: retrieving vms from DB two times
      items = find_checked_ids_with_rbac(klass, task)

      vm_button_operation_internal(items, task, display_name) || return

      # In non-explorer case, render the list (filling in @view).
      if @lastaction == "show_list"
        show_list unless @explorer
        @refresh_partial = "layouts/gtl"
      end

    else # showing 1 item
      items = [find_id_with_rbac_no_exception(klass, params[:id])].compact

      unless check_non_empty(items, display_name)
        show_list unless @explorer
        @refresh_partial = "layouts/gtl"
        return
      end

      vm_button_operation_internal(items, task, display_name)

      # Tells callers to go back to show_list because this item may be gone.
      @single_delete = task == 'destroy' && !flash_errors?

      # For Snapshot Trees
      if partial_after_single_selection && !@explorer
        show
        @refresh_partial = partial_after_single_selection
      end
    end
  end

  def process_cloud_object_storage_buttons(pressed)
    assert_privileges(pressed)

    klass = get_rec_cls
    task = pressed.sub("#{klass.name.underscore.to_sym}_", "")

    return tag(klass) if task == "tag"

    cloud_object_store_button_operation(klass, task)
  end

  def check_supports_task(items, klass, task, display_name)
    if klass.find(items).any? { |item| !item.supports?(task) }

      message = if items.length == 1
                  _("%{task} does not apply to this item")
                else
                  _("%{task} does not apply to at least one of the selected items")
                end

      add_flash(message % {:task => display_name}, :error)
      return false
    end
    true
  end

  def cloud_object_store_button_operation(klass, task)
    display_name = _(task.capitalize)

    # Map task to instance method name
    case task
    when 'delete'
      method = "#{task}_#{klass.name.underscore.to_sym}"
    else
      method = task = "#{klass.name.underscore.to_sym}_#{task}"
    end

    items = []
    # Either a list or coming from a different controller
    if @lastaction == "show_list" || %w(cloud_object_store_containers cloud_object_store_objects).include?(@display)
      # FIXME retrieving vms from DB two times
      items = find_checked_ids_with_rbac(klass)

      return unless check_non_empty(items, display_name)
      return unless check_supports_task(items, klass, task, display_name)

      process_objects(items, method, display_name)
    else
      items = [find_id_with_rbac_no_exception(klass, params[:id])].compact

      unless check_non_empty(items, display_name)
        show_list unless @explorer
        @refresh_partial = "layouts/gtl"
        return
      end

      return unless check_supports_task(items, klass, task, display_name)

      process_objects(items, method, display_name) unless items.empty?
    end
  end

  def get_rec_cls
    # FIXME: the specs for ci_processing rely on setting (and testing) request.parameters['controller'].
    # That is wrong and needs to be fixed.
    case request.parameters["controller"] || controller_name
    when "miq_template"
      MiqTemplate
    when "orchestration_stack"
      params[:display] == "instances" ? VmOrTemplate : OrchestrationStack
    when "service"
      Service
    when "cloud_object_store_container"
      params[:pressed].starts_with?("cloud_object_store_object") ? CloudObjectStoreObject : CloudObjectStoreContainer
    when "cloud_object_store_object"
      CloudObjectStoreObject
    when "ems_storage"
      params[:pressed].starts_with?("cloud_object_store_object") ? CloudObjectStoreObject : CloudObjectStoreContainer
    else
      VmOrTemplate
    end
  end

  def process_objects(objs, task, display_name = nil)
    klass = get_rec_cls
    klass_str = klass.to_s

    assert_rbac(klass, objs)

    display_name ||= task.titleize
    case klass_str
    when 'OrchestrationStack', 'Service', 'CloudObjectStoreContainer', 'CloudObjectStoreObject'
      objs, _objs_out_reg = filter_ids_in_region(objs, klass.to_s)
    when 'VmOrTemplate'
      objs, _objs_out_reg = filter_ids_in_region(objs, "VM") unless VmOrTemplate::REMOTE_REGION_TASKS.include?(task)
      klass = Vm
    end
    return if objs.empty?

    options = {:ids => objs, :task => task, :userid => session[:userid]}
    options[:snap_selected] = session[:snap_selected] if task == "remove_snapshot" || task == "revert_to_snapshot"

    klass.process_tasks(options)
  rescue => err
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
        :product => I18n.t('product.name'),
        :model   => ui_lookup(:model => klass.to_s),
        :models  => ui_lookup(:models => klass.to_s)
      }
    )
  end

  def manager_button_operation(method, display_name)
    items = params[:id] ? [params[:id]] : find_checked_items

    if items.empty?
      add_flash(_("No providers were selected for %{task}") % {:task  => display_name}, :error)
      return
    end

    process_managers(items, method)
  end

  def process_managers(managers, task)
    controller_class = request.parameters[:controller]
    provider_class = case controller_class
                     when 'provider_foreman' then ManageIQ::Providers::ConfigurationManager
                     when 'automation_manager' then ManageIQ::Providers::AutomationManager
                     end

    manager_ids, _services_out_region = filter_ids_in_region(managers, provider_class.to_s)
    return if manager_ids.empty?

    assert_rbac(provider_class, manager_ids)

    options = {:ids => manager_ids, :task => task, :userid => session[:userid]}
    kls = provider_class.find_by(:id => manager_ids.first).class
    kls.process_tasks(options)
  rescue => err
    add_flash(_("Error during '%{task}': %{message}") % {:task => task, :message => err.message}, :error)
  else
    add_flash(n_("%{task} initiated for %{count} provider",
                 "%{task} initiated for %{count} providers)", manager_ids.length) %
                {:task  => task_name(task),
                 :count => manager_ids.length})
  end

  # Delete all selected or single displayed VM(s)
  def deletevms
    assert_privileges(params[:pressed])
    vm_button_operation('destroy', _('Delete'))
  end
  alias_method :image_delete, :deletevms
  alias_method :instance_delete, :deletevms
  alias_method :vm_delete, :deletevms
  alias_method :miq_template_delete, :deletevms

  # Import info for all selected or single displayed vm(s)
  def syncvms
    assert_privileges(params[:pressed])
    vm_button_operation('sync', _('Virtual Black Box synchronization'))
  end

  DEFAULT_PRIVILEGE = Object.new # :nodoc:

  # Refresh the power states for selected or single VMs
  def refreshvms(privilege = DEFAULT_PRIVILEGE)
    if privilege == DEFAULT_PRIVILEGE
      ActiveSupport::Deprecation.warn(<<-MSG.strip_heredoc)
      Please pass the privilege you want to check for when refreshing
      MSG
      privilege = params[:pressed]
    end
    assert_privileges(privilege)
    vm_button_operation('refresh_ems', _('Refresh Provider'))
  end
  alias_method :image_refresh, :refreshvms
  alias_method :instance_refresh, :refreshvms
  alias_method :vm_refresh, :refreshvms
  alias_method :miq_template_refresh, :refreshvms

  # Import info for all selected or single displayed vm(s)
  def scanvms
    assert_privileges(params[:pressed])
    vm_button_operation('scan', _('Analysis'))
  end
  alias_method :image_scan, :scanvms
  alias_method :instance_scan, :scanvms
  alias_method :vm_scan, :scanvms
  alias_method :miq_template_scan, :scanvms

  # Immediately retire items
  def retirevms_now
    assert_privileges(params[:pressed])
    vm_button_operation('retire_now', _('Retirement'))
  end
  alias_method :instance_retire_now, :retirevms_now
  alias_method :vm_retire_now, :retirevms_now
  alias_method :orchestration_stack_retire_now, :retirevms_now

  def check_compliance_vms
    assert_privileges(params[:pressed])
    vm_button_operation('check_compliance_queue', _('Check Compliance'))
  end
  alias_method :image_check_compliance, :check_compliance_vms
  alias_method :instance_check_compliance, :check_compliance_vms
  alias_method :vm_check_compliance, :check_compliance_vms
  alias_method :miq_template_check_compliance, :check_compliance_vms

  # Collect running processes for all selected or single displayed vm(s)
  def getprocessesvms
    assert_privileges(params[:pressed])
    vm_button_operation('collect_running_processes', _('Collect Running Processes'))
  end
  alias_method :instance_collect_running_processes, :getprocessesvms
  alias_method :vm_collect_running_processes, :getprocessesvms

  # Start all selected or single displayed vm(s)
  def startvms
    assert_privileges(params[:pressed])
    vm_button_operation('start', _('Start'))
  end
  alias_method :instance_start, :startvms
  alias_method :vm_start, :startvms

  # Suspend all selected or single displayed vm(s)
  def suspendvms
    assert_privileges(params[:pressed])
    vm_button_operation('suspend', _('Suspend'))
  end
  alias_method :instance_suspend, :suspendvms
  alias_method :vm_suspend, :suspendvms

  # Pause all selected or single displayed vm(s)
  def pausevms
    assert_privileges(params[:pressed])
    vm_button_operation('pause', _('Pause'))
  end
  alias_method :instance_pause, :pausevms
  alias_method :vm_pause, :pausevms

  # Terminate all selected or single displayed vm(s)
  def terminatevms
    assert_privileges(params[:pressed])
    vm_button_operation('vm_destroy', _('Terminate'))
  end
  alias_method :instance_terminate, :terminatevms

  # Stop all selected or single displayed vm(s)
  def stopvms
    assert_privileges(params[:pressed])
    vm_button_operation('stop', _('Stop'))
  end
  alias_method :instance_stop, :stopvms
  alias_method :vm_stop, :stopvms

  # Shelve all selected or single displayed vm(s)
  def shelvevms
    assert_privileges(params[:pressed])
    vm_button_operation('shelve', _('Shelve'))
  end
  alias_method :instance_shelve, :shelvevms
  alias_method :vm_shelve, :shelvevms

  # Shelve all selected or single displayed vm(s)
  def shelveoffloadvms
    assert_privileges(params[:pressed])
    vm_button_operation('shelve_offload', _('Shelve Offload'))
  end
  alias_method :instance_shelve_offload, :shelveoffloadvms
  alias_method :vm_shelve_offload, :shelveoffloadvms

  # Reset all selected or single displayed vm(s)
  def resetvms
    assert_privileges(params[:pressed])
    vm_button_operation('reset', _('Reset'))
  end
  alias_method :instance_reset, :resetvms
  alias_method :vm_reset, :resetvms

  # Shutdown guests on all selected or single displayed vm(s)
  def guestshutdown
    assert_privileges(params[:pressed])
    vm_button_operation('shutdown_guest', _('Shutdown Guest'))
  end
  alias_method :vm_guest_shutdown, :guestshutdown

  # Standby guests on all selected or single displayed vm(s)
  def gueststandby
    assert_privileges(params[:pressed])
    vm_button_operation('standby_guest', _('Standby Guest'))
  end

  # Restart guests on all selected or single displayed vm(s)
  def guestreboot
    assert_privileges(params[:pressed])
    vm_button_operation('reboot_guest', _('Restart Guest'))
  end
  alias_method :instance_guest_restart, :guestreboot
  alias_method :vm_guest_restart, :guestreboot

  # Delete all snapshots for vm(s)
  def deleteallsnapsvms
    assert_privileges(params[:pressed])
    vm_button_operation('remove_all_snapshots', _('Delete All Snapshots'), 'vm_common/config')
  end
  alias_method :vm_snapshot_delete_all, :deleteallsnapsvms

  # Delete selected snapshot for vm
  def deletesnapsvms
    assert_privileges(params[:pressed])
    vm_button_operation('remove_snapshot', _('Delete Snapshot'), 'vm_common/config')
  end
  alias_method :vm_snapshot_delete, :deletesnapsvms

  # Delete selected snapshot for vm
  def revertsnapsvms
    assert_privileges(params[:pressed])
    vm_button_operation('revert_to_snapshot', _('Revert to a Snapshot'), 'vm_common/config')
  end
  alias_method :vm_snapshot_revert, :revertsnapsvms

  # End of common VM button handler routines

  # Common Cluster button handler routines
  def process_clusters(clusters, task)
    clusters, _clusters_out_region = filter_ids_in_region(clusters, _("Cluster"))
    return if clusters.empty?

    if task == "destroy"
      EmsCluster.where(:id => clusters).order("lower(name)").each do |cluster|
        id = cluster.id
        cluster_name = cluster.name
        audit = {:event => "ems_cluster_record_delete_initiated", :message => "[#{cluster_name}] Record delete initiated", :target_id => id, :target_class => "EmsCluster", :userid => session[:userid]}
        AuditEvent.success(audit)
      end
      EmsCluster.destroy_queue(clusters)
    else
      EmsCluster.where(:id => clusters).order("lower(name)").each do |cluster|
        cluster_name = cluster.name
        begin
          cluster.send(task.to_sym) if cluster.respond_to?(task)    # Run the task
        rescue => err
          add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{error_message}") %
            {:model         => ui_lookup(:model => "EmsCluster"),
             :name          => cluster_name,
             :task          => task,
             :error_message => err.message}, :error) # Push msg and error flag
        else
          add_flash(_("%{model}: %{task} successfully initiated") % {:model => ui_lookup(:model => "EmsCluster"), :task => task})
        end
      end
    end
  end

  # Common RP button handler routines
  def process_resourcepools(rps, task)
    rps, _rps_out_region = filter_ids_in_region(rps, "Resource Pool")
    return if rps.empty?

    if task == "destroy"
      ResourcePool.where(:id => rps).order("lower(name)").each do |rp|
        id = rp.id
        rp_name = rp.name
        audit = {:event => "rp_record_delete_initiated", :message => "[#{rp_name}] Record delete initiated", :target_id => id, :target_class => "ResourcePool", :userid => session[:userid]}
        AuditEvent.success(audit)
      end
      ResourcePool.destroy_queue(rps)
    else
      ResourcePool.where(:id => rps).order("lower(name)").each do |rp|
        rp_name = rp.name
        begin
          rp.send(task.to_sym) if rp.respond_to?(task)    # Run the task
        rescue => err
          add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{error_message}") %
            {:model         => ui_lookup(:model => "ResourcePool"),
             :name          => rp_name,
             :task          => task,
             :error_message => err.message}, :error)
        else
          add_flash(_("%{model} \"%{name}\": %{task} successfully initiated") % {:model => ui_lookup(:model => "ResourcePool"), :name => rp_name, :task => task})
        end
      end
    end
  end

  def cluster_button_operation(method, display_name)
    clusters = []
    # Either a list or coming from a different controller (eg from host screen, go to its clusters)
    if @lastaction == "show_list" || @layout != "ems_cluster"
      clusters = find_checked_ids_with_rbac(EmsCluster)
      if clusters.empty?
        add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:tables => "ems_clusters"), :task => display_name}, :error)
      else
        process_clusters(clusters, method)
      end

      if @lastaction == "show_list" # In cluster controller, refresh show_list, else let the other controller handle it
        show_list
        @refresh_partial = "layouts/gtl"
      end

    else # showing 1 cluster
      if params[:id].nil? || EmsCluster.find_by_id(params[:id]).nil?
        add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:tables => "ems_cluster")}, :error)
      else
        clusters.push(find_id_with_rbac(EmsCluster, params[:id]))
        process_clusters(clusters, method)  unless clusters.empty?
      end

      params[:display] = @display
      show

      # TODO: tells callers to go back to show_list because this Host may be gone
      # Should be refactored into calling show_list right here
      if method == 'destroy'
        @single_delete = true unless flash_errors?
      end
      if ["vms", "hosts"].include?(@display)
        @refresh_partial = "layouts/gtl"
      else
        @refresh_partial = "config"
      end
    end

    clusters.count
  end

  # Scan all selected or single displayed cluster(s)
  def scanclusters
    assert_privileges("ems_cluster_scan")
    cluster_button_operation('scan', _('Analysis'))
  end

  # Common Stacks button handler routines
  def process_orchestration_stacks(stacks, task, _ = nil)
    stacks, = filter_ids_in_region(stacks, "OrchestrationStack")
    return if stacks.empty?

    if task == "destroy"
      OrchestrationStack.where(:id => stacks).order("lower(name)").each do |stack|
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
      ManageIQ::Providers::AnsibleTower::AutomationManager::Job.where(:id => stacks).order("lower(name)").each do |stack|
        id = stack.id
        stack_name = stack.name
        audit = {:event        => "stack_record_delete_initiated",
                 :message      => "[#{stack_name}] Record delete initiated",
                 :target_id    => id,
                 :target_class => "ManageIQ::Providers::AnsibleTower::AutomationManager::Job",
                 :userid       => session[:userid]}
        AuditEvent.success(audit)
      end
      ManageIQ::Providers::AnsibleTower::AutomationManager::Job.destroy_queue(stacks)
    end
  end

  def process_storage(storages, task)
    storages, _storages_out_region = filter_ids_in_region(storages, _("Datastore"))
    return if storages.empty?

    if task == "destroy"
      Storage.where(:id => storages).order("lower(name)").each do |storage|
        id = storage.id
        storage_name = storage.name
        audit = {:event => "storage_record_delete_initiated", :message => "[#{storage_name}] Record delete initiated", :target_id => id, :target_class => "Storage", :userid => session[:userid]}
        AuditEvent.success(audit)
      end
      Storage.destroy_queue(storages)
      add_flash(n_("Delete initiated for Datastore from the %{product} Database",
                   "Delete initiated for Datastores from the %{product} Database", storages.length) % {:product => I18n.t('product.name')})
    else
      Storage.where(:id => storages).order("lower(name)").each do |storage|
        storage_name = storage.name
        begin
          if task == "scan"
            storage.send(task.to_sym, session[:userid]) # Scan needs userid
          else
            storage.send(task.to_sym) if storage.respond_to?(task)    # Run the task
          end
        rescue => err
          add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{error_message}") %
            {:model         => ui_lookup(:model => "Storage"),
             :name          => storage_name,
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

  def storage_button_operation(method, display_name)
    storages = []
    # Either a list or coming from a different controller (eg from host screen, go to its storages)
    if params.key?(:miq_grid_checks)
      storages = find_checked_ids_with_rbac(Storage)

      if method == 'scan' && !Storage.batch_operation_supported?('smartstate_analysis', storages)
        render_flash_not_applicable_to_model(_('Smartstate Analysis'), ui_lookup(:tables => "storage"))
        return
      end
      if storages.empty?
        add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:tables => "storage"), :task => display_name}, :error)
      else
        process_storage(storages, method)
      end

      if @lastaction == "show_list"
        show_list unless @explorer
        @refresh_partial = "layouts/gtl"
      end

    else # showing 1 storage
      if params[:id].nil? || Storage.find_by_id(params[:id]).nil?
        add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:tables => "storage")}, :error)
      else
        storages.push(find_id_with_rbac(Storage, params[:id]))
        process_storage(storages, method)  unless storages.empty?
      end

      params[:display] = @display
      show
      if ["vms", "hosts"].include?(@display)
        @refresh_partial = "layouts/gtl"
      else
        @refresh_partial = "config"
      end
    end

    storages.count
  end

  # Refresh all selected or single displayed Datastore(s)
  def refreshstorage
    assert_privileges("storage_refresh")
    storage_button_operation('refresh_ems', _('Refresh'))
  end

  # Scan all selected or single displayed storage(s)
  def scanstorage
    assert_privileges("storage_scan")
    storage_button_operation('scan', _('Analysis'))
  end

  # Delete all selected or single displayed host(s)
  def deletehosts
    assert_privileges("host_delete")
    delete_elements(Host, :process_hosts)
  end

  # Delete all selected or single displayed stack(s)
  def orchestration_stack_delete
    assert_privileges("orchestration_stack_delete")
    delete_elements(OrchestrationStack, :process_orchestration_stacks)
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
    storages = find_checked_ids_with_rbac(Storage)
    unless Storage.batch_operation_supported?('delete', storages)
      add_flash(_("Only storage without VMs and Hosts can be removed"), :error)
      return
    end

    datastores = []
    if %w(show_list storage_list storage_pod_list).include?(@lastaction) || (@lastaction == "show" && @layout != "storage") # showing a list, scan all selected hosts
      datastores = storages
      if datastores.empty?
        add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:tables => "storage"), :task => display_name}, :error)
      end
      ds_to_delete = []
      datastores.each do |s|
        ds = Storage.find_by_id(s)
        if ds.vms_and_templates.length <= 0 && ds.hosts.length <= 0
          ds_to_delete.push(s)
        else
          add_flash(_("\"%{datastore_name}\": cannot be removed, has vms or hosts") %
            {:datastore_name => ds.name}, :warning)
        end
      end
      process_storage(ds_to_delete, "destroy")  unless ds_to_delete.empty?
    else # showing 1 datastore, delete it
      if params[:id].nil? || Storage.find_by_id(params[:id]).nil?
        add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:tables => "storage")}, :error)
      else
        datastores.push(find_id_with_rbac(Storage, params[:id]))
      end
      process_storage(datastores, "destroy")  unless datastores.empty?
      @single_delete = true unless flash_errors?
      add_flash(_("The selected %{record} was deleted") %
        {:record => ui_lookup(:table => "storages")}) if @flash_array.nil?
    end
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    end
  end

  def delete_elements(model_class, destroy_method, model_name = nil)
    elements = []
    model_name ||= model_class.table_name
    if @lastaction == "show_list" || (@lastaction == "show" && @layout != model_name.singularize) # showing a list
      elements = find_checked_ids_with_rbac(model_class)
      if elements.empty?
        add_flash(_("No %{model} were selected for deletion") %
          {:model => ui_lookup(:tables => model_name)}, :error)
      end
      send(destroy_method, elements, "destroy") unless elements.empty?
      add_flash(n_("Delete initiated for %{count} %{model} from the %{product} Database",
                   "Delete initiated for %{count} %{models} from the %{product} Database", elements.length) %
        {:count   => elements.length,
         :product => I18n.t('product.name'),
         :model   => ui_lookup(:table => model_name),
         :models  => ui_lookup(:tables => model_name)}) unless flash_errors?
    else # showing 1 element, delete it
      if params[:id].nil? || model_class.find_by_id(params[:id]).nil?
        add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:table => model_name)}, :error)
      else
        elements.push(find_id_with_rbac(model_class, params[:id]))
      end
      send(destroy_method, elements, "destroy") unless elements.empty?
      @single_delete = true unless flash_errors?
      add_flash(_("The selected %{record} was deleted") %
        {:record => ui_lookup(:table => model_name)}) if @flash_array.nil?
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
    elsif pressed.starts_with?("vm_")
      "vm"
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
     "#{pfx}_resize", "#{pfx}_live_migrate", "#{pfx}_evacuate"
      ].include?(pressed) &&
      @flash_array.nil?
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
    when "#{pfx}_shelveoffloadvms"          then shelveoffloadvms
    when "#{pfx}_reset"                     then resetvms
    when "#{pfx}_check_compliance"          then check_compliance_vms
    when "#{pfx}_reconfigure"               then reconfigurevms
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
    end
  end

  def owner_changed?(owner)
    return false if @edit[:new][owner].blank?
    @edit[:new][owner] != @edit[:current][owner]
  end
end
