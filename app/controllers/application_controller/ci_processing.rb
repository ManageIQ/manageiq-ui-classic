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

  # Build the vm detail gtl view
  def show_details(db, options = {})  # Pass in the db, parent vm is in @vm
    association = options[:association]
    conditions  = options[:conditions]
    # generate the grid/tile/list url to come back here when gtl buttons are pressed
    @gtl_url       = "/#{@db}/#{@listicon.pluralize}/#{@record.id}?"
    @showtype      = "details"
    @display       = "main"
    @no_checkboxes = @no_checkboxes.nil? || @no_checkboxes
    @showlinks     = true

    @view, @pages = get_view(db,
                             :parent      => @record,
                             :association => association,
                             :conditions  => conditions,
                             :dbname      => "#{@db}item")  # Get the records into a view & paginator

    if @explorer # In explorer?
      @refresh_partial = "vm_common/#{@showtype}"
      replace_right_cell
    else
      if pagination_request?
        replace_gtl_main_div
      elsif request.xml_http_request?
        # reload toolbars - AJAX request
        c_tb = build_toolbar(center_toolbar_filename)
        render :update do |page|
          page << javascript_prologue
          page.replace("flash_msg_div", :partial => "layouts/flash_msg")
          page.replace_html("main_div", :partial => "shared/views/ems_common/show") # Replace main div area contents
          page << javascript_pf_toolbar_reload('center_tb', c_tb)
          page.replace_html("paging_div",
                            :partial => 'layouts/pagingcontrols',
                            :locals  => {:pages      => @pages,
                                         :action_url => @lastaction,
                                         :db         => @view.db,
                                         :headers    => @view.headers})
        end
      elsif controller_name == "ems_cloud"
        render :template => "shared/views/ems_common/show"
      else
        render :action => "show"
      end
    end
  end

  # show a single item from a detail list
  def show_item
    @showtype = "item"
    if @explorer
      @refresh_partial = "layouts/#{@showtype}"
      replace_right_cell
    elsif request.xml_http_request?
      # reload toolbars - AJAX request
      c_tb = build_toolbar(center_toolbar_filename)
      render :update do |page|
        page << javascript_prologue
        page.replace("flash_msg_div", :partial => "layouts/flash_msg")
        page.replace_html("main_div", :partial => "shared/views/ems_common/show") # Replace the main div area contents
        page << javascript_pf_toolbar_reload('center_tb', c_tb)
      end
    elsif controller_name == "ems_cloud"
      render :template => "shared/views/ems_common/show"
    else
      render :action => "show"
    end
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

  def guest_applications
    @use_action = true
    @explorer = true if request.xml_http_request? # Ajax request means in explorer
    @db = params[:db] ? params[:db] : request.parameters[:controller]
    session[:db] = @db unless @db.nil?
    @db = session[:db] unless session[:db].nil?
    get_record(@db)
    @sb[:action] = params[:action]
    return if record_no_longer_exists?(@record)

    @lastaction = "guest_applications"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = @record.guest_applications.find(from_cid(id))
      if Regexp.new(/linux/).match(@record.os_image_name.downcase)
        drop_breadcrumb(:name => _("%{name} (Packages)") % {:name => @record.name},
                        :url  => "/#{@db}/guest_applications/#{@record.id}?page=#{@current_page}")
      else
        drop_breadcrumb(:name => _("%{name} (Applications)") % {:name => @record.name},
                        :url  => "/#{@db}/guest_applications/#{@record.id}?page=#{@current_page}")
      end
      drop_breadcrumb(:name => @item.name, :url => "/#{@db}/show/#{@record.id}?show=#{@item.id}")
      @view = get_db_view(GuestApplication)         # Instantiate the MIQ Report view object
      show_item
    else
      drop_breadcrumb({:name => @record.name, :url => "/#{@db}/show/#{@record.id}"}, true)
      if Regexp.new(/linux/).match(@record.os_image_name.downcase)
        drop_breadcrumb(:name => _("%{name} (Packages)") % {:name => @record.name},
                        :url  => "/#{@db}/guest_applications/#{@record.id}")
      else
        drop_breadcrumb(:name => _("%{name} (Applications)") % {:name => @record.name},
                        :url  => "/#{@db}/guest_applications/#{@record.id}")
      end
      @listicon = "guest_application"
      show_details(GuestApplication)
    end
  end

  def patches
    @use_action = true
    @explorer = true if request.xml_http_request? # Ajax request means in explorer
    @db = params[:db] ? params[:db] : request.parameters[:controller]
    session[:db] = @db unless @db.nil?
    @db = session[:db] unless session[:db].nil?
    get_record(@db)
    @sb[:action] = params[:action]
    return if record_no_longer_exists?(@record)

    @lastaction = "patches"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = @record.patches.find(from_cid(id))
      drop_breadcrumb(:name => _("%{name} (Patches)") % {:name => @record.name},
                      :url  => "/#{@db}/patches/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb(:name => @item.name, :url => "/#{@db}/patches/#{@record.id}?show=#{@item.id}")
      @view = get_db_view(Patch)
      show_item
    else
      drop_breadcrumb(:name => _("%{name} (Patches)") % {:name => @record.name},
                      :url  => "/#{@db}/patches/#{@record.id}")
      @listicon = "patch"
      show_details(Patch)
    end
  end

  def groups
    @use_action = true
    @explorer = true if request.xml_http_request? && explorer_controller? # Ajax request means in explorer
    @db = params[:db] ? params[:db] : request.parameters[:controller]
    session[:db] = @db unless @db.nil?
    @db = session[:db] unless session[:db].nil?
    get_record(@db)
    @sb[:action] = params[:action]
    return if record_no_longer_exists?(@record)

    @lastaction = "groups"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = @record.groups.find(from_cid(id))
      drop_breadcrumb(:name => _("%{name} (Groups)") % {:name => @record.name},
                      :url  => "/#{@db}/groups/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb({:name => @item.name, :url => "/#{@db}/groups/#{@record.id}?show=#{@item.id}"})
      @user_names = @item.users
      @view = get_db_view(Account, :association => "groups")
      show_item
    else
      drop_breadcrumb(:name => _("%{name} (Groups)") % {:name => @record.name},
                      :url  => "/#{@db}/groups/#{@record.id}")
      @listicon = "group"
      show_details(Account, :association => "groups")
    end
  end

  def users
    @use_action = true
    @explorer = true if request.xml_http_request? && explorer_controller? # Ajax request means in explorer
    @db = params[:db] ? params[:db] : request.parameters[:controller]
    session[:db] = @db unless @db.nil?
    @db = session[:db] unless session[:db].nil?
    get_record(@db)
    @sb[:action] = params[:action]
    return if record_no_longer_exists?(@record)

    @lastaction = "users"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = @record.users.find(from_cid(id))
      drop_breadcrumb(:name => _("%{name} (Users)") % {:name => @record.name},
                      :url  => "/#{@db}/users/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb(:name => @item.name, :url => "/#{@db}/show/#{@record.id}?show=#{@item.id}")
      @group_names = @item.groups
      @view = get_db_view(Account, :association => "users")
      show_item
    else
      drop_breadcrumb(:name => _("%{name} (Users)") % {:name => @record.name},
                      :url  => "/#{@db}/users/#{@record.id}")
      @listicon = "user"
      show_details(Account, :association => "users")
    end
  end

  def hosts
    @use_action = true
    @explorer = true if request.xml_http_request? && explorer_controller? # Ajax request means in explorer
    @db = params[:db] ? params[:db] : request.parameters[:controller]
    @db = 'switch' if @db == 'infra_networking'
    session[:db] = @db unless @db.nil?
    @db = session[:db] unless session[:db].nil?
    get_record(@db)
    @sb[:action] = params[:action]
    return if record_no_longer_exists?(@record)

    @lastaction = "hosts"
    if !params[:show].nil? || !params[:x_show].nil?
      id = params[:show] ? params[:show] : params[:x_show]
      @item = @record.hosts.find(from_cid(id))
      drop_breadcrumb(:name => _("%{name} (Hosts)") % {:name => @record.name},
                      :url  => "/#{request.parameters[:controller]}/hosts/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb(:name => @item.name, :url => "/#{request.parameters[:controller]}/show/#{@record.id}?show=#{@item.id}")
      @view = get_db_view(Host)
      show_item
    else
      drop_breadcrumb(:name => _("%{name} (Hosts)") % {:name => @record.name},
                      :url  => "/#{request.parameters[:controller]}/hosts/#{@record.id}")
      @listicon = "host"
      show_details(Host, :association => "hosts")
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
      action = %w(container service vm_cloud vm_infra vm_or_template storage).include?(self.class.table_name) ? "explorer" : "show_list"
      @breadcrumbs.clear
      drop_breadcrumb(:name => bc_name, :url => "/#{controller_name}/#{action}")
    end
    @layout = session["#{self.class.session_key_prefix}_type".to_sym] if session["#{self.class.session_key_prefix}_type".to_sym]
    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    build_listnav_search_list(@view.db) if !["miq_task"].include?(@layout) && !session[:menu_click]

    replace_gtl_main_div if params[:action] != "explorer" && params[:action] != "button" && pagination_request?
  end

  def breadcrumb_name(_model)
    ui_lookup(:models => self.class.model.name)
  end

  # Common item button handler routines
  def vm_button_operation(method, display_name, partial_after_single_selection = nil)
    selected_items = []
    klass = get_rec_cls
    # Either a list or coming from a different controller (eg from host screen, go to its selected_items)
    if @lastaction == "show_list" ||
       !%w(orchestration_stack service vm_cloud vm_infra vm miq_template vm_or_template).include?(
         request.parameters["controller"]) # showing a list

      # FIXME retrieving vms from DB two times
      selected_items = find_checked_ids_with_rbac(klass)
      if method == 'retire_now' &&
         !%w(orchestration_stack service).include?(request.parameters["controller"]) &&
         VmOrTemplate.find(selected_items).any? { |vm| !vm.supports_retire? }
        add_flash(_("Retire does not apply to selected %{model}") %
          {:model => ui_lookup(:table => "miq_template")}, :error)
        javascript_flash(:scroll_top => true)
        return
      end

      if method == 'scan' && !VmOrTemplate.batch_operation_supported?('smartstate_analysis', selected_items)
        render_flash_not_applicable_to_model('Smartstate Analysis', ui_lookup(:tables => "vm_or_template"))
        return
      end

      if selected_items.empty?
        add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:tables => request.parameters["controller"]), :task => display_name}, :error)
      else
        process_objects(selected_items, method)
      end

      if @lastaction == "show_list" # In the controller, refresh show_list, else let the other controller handle it
        show_list unless @explorer
        @refresh_partial = "layouts/gtl"
      end

    else # showing 1 item
      if params[:id].nil? || klass.find_by_id(params[:id]).nil?
        add_flash(_("%{record} no longer exists") %
          {:record => ui_lookup(:table => request.parameters["controller"])}, :error)
        show_list unless @explorer
        @refresh_partial = "layouts/gtl"
      else

        selected_items.push(find_id_with_rbac(klass, params[:id]))
        process_objects(selected_items, method) unless selected_items.empty?

        # TODO: tells callers to go back to show_list because this VM may be gone
        # Should be refactored into calling show_list right here
        if method == 'destroy'
          @single_delete = true unless flash_errors?
        end

        # For Snapshot Trees
        if partial_after_single_selection && !@explorer
          show
          @refresh_partial = partial_after_single_selection
        end
      end
    end
    selected_items.count
  end

  def process_cloud_object_storage_buttons(pressed)
    assert_privileges(pressed)

    klass = get_rec_cls
    task = pressed.sub("#{klass.name.underscore.to_sym}_", "")

    return tag(klass) if task == "tag"

    cloud_object_store_button_operation(klass, task)
  end

  def cloud_object_store_button_operation(klass, task)
    # Map to instance method name
    case task
    when "delete"
      method = "#{task}_#{klass.name.underscore.to_sym}"
      display_name = _(task.capitalize)
    else
      display_name = _(task.capitalize)
      method = task = "#{klass.name.underscore.to_sym}_#{task}"
    end

    items = []
    # Either a list or coming from a different controller
    if @lastaction == "show_list" || %w(cloud_object_store_containers cloud_object_store_objects).include?(@display)
      # FIXME retrieving vms from DB two times
      items = find_checked_ids_with_rbac(klass)
      if items.empty?
        add_flash(_("No %{model} were selected for %{task}") %
                    {:model => ui_lookup(:models => klass.name), :task => display_name}, :error)
      elsif klass.find(items).any? { |item| !item.supports?(task) }
        add_flash(_("%{task} does not apply to at least one of the selected items") %
                    {:task => display_name}, :error)
      else
        process_objects(items, method, display_name)
      end
    elsif params[:id].nil? || klass.find_by(:id => params[:id]).nil?
      add_flash(_("%{record} no longer exists") %
                  {:record => ui_lookup(:table => request.parameters["controller"])}, :error)
      show_list unless @explorer
      @refresh_partial = "layouts/gtl"
    elsif !klass.find_by(:id => params[:id]).supports?(task)
      add_flash(_("%{task} does not apply to this item") %
                  {:task => display_name}, :error)
    else
      items.push(find_id_with_rbac(klass, params[:id]))
      process_objects(items, method, display_name) unless items.empty?
    end
  end

  def get_rec_cls
    case request.parameters["controller"]
    when "miq_template"
      MiqTemplate
    when "orchestration_stack"
      OrchestrationStack
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
        :task    => display_name ? display_name.titleize : task_name(task),
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
    vm_button_operation('destroy', 'deletion')
  end
  alias_method :image_delete, :deletevms
  alias_method :instance_delete, :deletevms
  alias_method :vm_delete, :deletevms
  alias_method :miq_template_delete, :deletevms

  # Import info for all selected or single displayed vm(s)
  def syncvms
    assert_privileges(params[:pressed])
    vm_button_operation('sync', 'for Virtual Black Box synchronization')
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
    vm_button_operation('refresh_ems', 'Refresh')
  end
  alias_method :image_refresh, :refreshvms
  alias_method :instance_refresh, :refreshvms
  alias_method :vm_refresh, :refreshvms
  alias_method :miq_template_refresh, :refreshvms

  # Import info for all selected or single displayed vm(s)
  def scanvms
    assert_privileges(params[:pressed])
    vm_button_operation('scan', 'SmartState Analysis')
  end
  alias_method :image_scan, :scanvms
  alias_method :instance_scan, :scanvms
  alias_method :vm_scan, :scanvms
  alias_method :miq_template_scan, :scanvms

  # Immediately retire items
  def retirevms_now
    assert_privileges(params[:pressed])
    vm_button_operation('retire_now', 'retire')
  end
  alias_method :instance_retire_now, :retirevms_now
  alias_method :vm_retire_now, :retirevms_now
  alias_method :orchestration_stack_retire_now, :retirevms_now

  def check_compliance_vms
    assert_privileges(params[:pressed])
    vm_button_operation('check_compliance_queue', 'check compliance')
  end
  alias_method :image_check_compliance, :check_compliance_vms
  alias_method :instance_check_compliance, :check_compliance_vms
  alias_method :vm_check_compliance, :check_compliance_vms
  alias_method :miq_template_check_compliance, :check_compliance_vms

  # Collect running processes for all selected or single displayed vm(s)
  def getprocessesvms
    assert_privileges(params[:pressed])
    vm_button_operation('collect_running_processes', 'Collect Running Processes')
  end
  alias_method :instance_collect_running_processes, :getprocessesvms
  alias_method :vm_collect_running_processes, :getprocessesvms

  # Start all selected or single displayed vm(s)
  def startvms
    assert_privileges(params[:pressed])
    vm_button_operation('start', 'start')
  end
  alias_method :instance_start, :startvms
  alias_method :vm_start, :startvms

  # Suspend all selected or single displayed vm(s)
  def suspendvms
    assert_privileges(params[:pressed])
    vm_button_operation('suspend', 'suspend')
  end
  alias_method :instance_suspend, :suspendvms
  alias_method :vm_suspend, :suspendvms

  # Pause all selected or single displayed vm(s)
  def pausevms
    assert_privileges(params[:pressed])
    vm_button_operation('pause', 'pause')
  end
  alias_method :instance_pause, :pausevms
  alias_method :vm_pause, :pausevms

  # Terminate all selected or single displayed vm(s)
  def terminatevms
    assert_privileges(params[:pressed])
    vm_button_operation('vm_destroy', 'terminate')
  end
  alias_method :instance_terminate, :terminatevms

  # Stop all selected or single displayed vm(s)
  def stopvms
    assert_privileges(params[:pressed])
    vm_button_operation('stop', 'stop')
  end
  alias_method :instance_stop, :stopvms
  alias_method :vm_stop, :stopvms

  # Shelve all selected or single displayed vm(s)
  def shelvevms
    assert_privileges(params[:pressed])
    vm_button_operation('shelve', 'shelve')
  end
  alias_method :instance_shelve, :shelvevms
  alias_method :vm_shelve, :shelvevms

  # Shelve all selected or single displayed vm(s)
  def shelveoffloadvms
    assert_privileges(params[:pressed])
    vm_button_operation('shelve_offload', 'shelve_offload')
  end
  alias_method :instance_shelve_offload, :shelveoffloadvms
  alias_method :vm_shelve_offload, :shelveoffloadvms

  # Reset all selected or single displayed vm(s)
  def resetvms
    assert_privileges(params[:pressed])
    vm_button_operation('reset', 'reset')
  end
  alias_method :instance_reset, :resetvms
  alias_method :vm_reset, :resetvms

  # Shutdown guests on all selected or single displayed vm(s)
  def guestshutdown
    assert_privileges(params[:pressed])
    vm_button_operation('shutdown_guest', 'shutdown')
  end
  alias_method :vm_guest_shutdown, :guestshutdown

  # Standby guests on all selected or single displayed vm(s)
  def gueststandby
    assert_privileges(params[:pressed])
    vm_button_operation('standby_guest', 'standby')
  end

  # Restart guests on all selected or single displayed vm(s)
  def guestreboot
    assert_privileges(params[:pressed])
    vm_button_operation('reboot_guest', 'restart')
  end
  alias_method :instance_guest_restart, :guestreboot
  alias_method :vm_guest_restart, :guestreboot

  # Delete all snapshots for vm(s)
  def deleteallsnapsvms
    assert_privileges(params[:pressed])
    vm_button_operation('remove_all_snapshots', 'delete all snapshots', 'vm_common/config')
  end
  alias_method :vm_snapshot_delete_all, :deleteallsnapsvms

  # Delete selected snapshot for vm
  def deletesnapsvms
    assert_privileges(params[:pressed])
    vm_button_operation('remove_snapshot', 'delete snapshot', 'vm_common/config')
  end
  alias_method :vm_snapshot_delete, :deletesnapsvms

  # Delete selected snapshot for vm
  def revertsnapsvms
    assert_privileges(params[:pressed])
    vm_button_operation('revert_to_snapshot', 'revert to a snapshot', 'vm_common/config')
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

  def each_host(host_ids, task_name)
    Host.where(:id => host_ids).order("lower(name)").each do |host|
      begin
        yield host
      rescue => err
        add_flash(_("%{model} \"%{name}\": Error during '%{task}': %{message}") %
                  {
                    :model   => ui_lookup(:model => "Host"),
                    :name    => host.name,
                    :task    => task_name,
                    :message => err.message
                  }, :error)
      end
    end
  end

  # Common Host button handler routines
  def process_hosts(hosts, task, display_name = nil)
    hosts, _hosts_out_region = filter_ids_in_region(hosts, _("Host"))
    return if hosts.empty?
    task_name = (display_name || task)

    case task
    when "refresh_ems"
      Host.refresh_ems(hosts)
      add_flash(n_("%{task} initiated for %{count} Host from the %{product} Database",
                   "%{task} initiated for %{count} Hosts from the %{product} Database", hosts.length) % \
        {:task    => (display_name || task_name(task)),
         :product => I18n.t('product.name'),
         :count   => hosts.length})
      AuditEvent.success(:userid => session[:userid], :event => "host_#{task}",
          :message => "'#{task_name}' successfully initiated for #{pluralize(hosts.length, "Host")}",
          :target_class => "Host")
    when "destroy"
      each_host(hosts, task_name) do |host|
        validation = host.validate_destroy
        if !validation[:available]
          add_flash(validation[:message], :error)
        else
          audit = {:event        => "host_record_delete_initiated",
                   :message      => "[#{host.name}] Record delete initiated",
                   :target_id    => host.id,
                   :target_class => "Host",
                   :userid       => session[:userid]}
          AuditEvent.success(audit)
          host.destroy_queue
        end
      end
    when "scan"
      each_host(hosts, task_name) do |host|
        if host.respond_to?(:scan)
          host.send(task.to_sym, session[:userid]) # Scan needs userid
          add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => (display_name || task)})
        else
          add_flash(_("\"%{task}\": not supported for %{hostname}") % {:hostname => host.name, :task => (task_name || task)}, :error)
        end
      end
    when "maintenance"
      each_host(hosts, task_name) do |host|
        if host.maintenance
          if host.respond_to?(:unset_node_maintenance)
            host.send(:unset_node_maintenance_queue, session[:userid])
            add_flash(_("\"%{record}\": %{task} successfully initiated") %
                      {:record => host.name, :task => (display_name || task)})
          else
            add_flash(_("\"%{task}\": not supported for %{hostname}") %
                      {:hostname => host.name, :task => (task_name || task)}, :error)
          end
        elsif host.respond_to?(:set_node_maintenance)
          host.send(:set_node_maintenance_queue, session[:userid])
          add_flash(_("\"%{record}\": %{task} successfully initiated") %
                    {:record => host.name, :task => (display_name || task)})
        else
          add_flash(_("\"%{task}\": not supported for %{hostname}") %
                    {:hostname => host.name, :task => (task_name || task)}, :error)
        end
      end
    when "service_scheduling"
      each_host(hosts, task_name) do |host|
        params[:miq_grid_checks].split(",").each do |cloud_service_id|
          service = host.cloud_services.find(cloud_service_id)
          if service.validate_enable_scheduling
            resp = service.enable_scheduling
            status = resp.body.fetch("service").fetch("status")
            service.update(:scheduling_disabled => status == 'disabled')
            add_flash(_("\"%{record}\": Scheduling is %{status} now.") % {:record => service.name, :status => status})
          elsif service.validate_disable_scheduling
            resp = service.disable_scheduling
            status = resp.body.fetch("service").fetch("status")
            service.update(:scheduling_disabled => status == 'disabled')
            add_flash(_("\"%{record}\": Scheduling is %{status} now.") % {:record => service.name, :status => status})
          else
            add_flash(_("\"%{record}\": %{task} invalid") % {:record => service.name, :task => (display_name || task)},
                      :error)
          end
        end
      end
    when "manageable"
      each_host(hosts, task_name) do |host|
        if %w(enroll available adoptfail inspectfail cleanfail).include?(host.hardware.provision_state)
          host.manageable_queue(session[:userid])
          add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => (display_name || task)})
        else
          add_flash(_("\"%{task}\": not available for %{hostname}. %{hostname}'s provision state must be in \"available\", \"adoptfail\", \"cleanfail\", \"enroll\", or \"inspectfail\"") % {:hostname => host.name, :task => (display_name || task)}, :error)
        end
      end
    when "introspect"
      each_host(hosts, task_name) do |host|
        if host.hardware.provision_state == "manageable"
          host.introspect_queue(session[:userid])
          add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => (display_name || task)})
        else
          add_flash(_("\"%{task}\": not available for %{hostname}. %{hostname}'s provision state needs to be in \"manageable\"") % {:hostname => host.name, :task => (display_name || task)}, :error)
        end
      end
    when "provide"
      each_host(hosts, task_name) do |host|
        if host.hardware.provision_state == "manageable"
          host.provide_queue(session[:userid])
          add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => (display_name || task)})
        else
          add_flash(_("\"%{task}\": not available for %{hostname}. %{hostname}'s provision state needs to be in \"manageable\"") % {:hostname => host.name, :task => (display_name || task)}, :error)
        end
      end
    else
      each_host(hosts, task_name) do |host|
        if host.respond_to?(task) && host.is_available?(task)
          host.send(task.to_sym)
          add_flash(_("\"%{record}\": %{task} successfully initiated") % {:record => host.name, :task => (display_name || task)})
        else
          add_flash(_("\"%{task}\": not available for %{hostname}") % {:hostname => host.name, :task => (display_name || task)}, :error)
        end
      end
    end
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

  # Refresh all selected or single displayed host(s)
  def refreshhosts
    assert_privileges("host_refresh")
    host_button_operation('refresh_ems', _('Refresh'))
  end

  # Scan all selected or single displayed host(s)
  def scanhosts
    assert_privileges("host_scan")
    host_button_operation('scan', _('Analysis'))
  end

  # Toggle maintenance mode on all selected or single displayed host(s)
  def maintenancehosts
    assert_privileges("host_toggle_maintenance")
    host_button_operation('maintenance', _('Toggle Maintenance'))
  end

  # Toggle Scheduling on all selected or single displayed Cloud Service
  def toggleservicescheduling
    assert_privileges("host_cloud_service_scheduling_toggle")
    host_button_operation('service_scheduling', _('Toggle Scheduling for Cloud Service'))
  end

  def check_compliance_hosts
    assert_privileges("host_check_compliance")
    host_button_operation('check_compliance_queue', _('Compliance Check'))
  end

  def analyze_check_compliance_hosts
    assert_privileges("host_analyze_check_compliance")
    host_button_operation('scan_and_check_compliance_queue', _('Analyze and Compliance Check'))
  end

  # Set host to manageable state
  def sethoststomanageable
    assert_privileges("host_manageable")
    host_button_operation('manageable', _('Manageable'))
  end

  # Introspect host hardware
  def introspecthosts
    assert_privileges("host_introspect")
    host_button_operation('introspect', _('Introspect'))
  end

  # Provide host hardware, moving them to available state
  def providehosts
    assert_privileges("host_provide")
    host_button_operation('provide', _('Provide'))
  end

  def refreshphysicalservers
    # TODO: refresh physical servers
  end

  def deletephysicalservers
    # TODO: delete physical servers
  end

  def editphysicalservers
    # TODO: edit physical servers
  end

  # Handle the Host power buttons
  POWER_BUTTON_NAMES = {
    "reboot"           => _("Restart"),
    "start"            => _("Power On"),
    "stop"             => _("Power Off"),
    "enter_maint_mode" => _("Enter Maintenance Mode"),
    "exit_maint_mode"  => _("Exit Maintenance Mode"),
    "standby"          => _("Shutdown to Standby Mode")
  }
  def powerbutton_hosts(method)
    assert_privileges(params[:pressed])
    host_button_operation(method, POWER_BUTTON_NAMES[method] || method.titleize)
  end

  def host_button_operation(method, display_name)
    hosts = []

    # Either a list or coming from a different controller (eg from ems screen, go to its hosts)
    if @lastaction == "show_list" || @layout != "host"
      hosts = find_checked_ids_with_rbac(Host)
      if hosts.empty?
        add_flash(_("No %{model} were selected for %{task}") % {:model => ui_lookup(:tables => "host"), :task => display_name}, :error)
      else
        process_hosts(hosts, method, display_name)
      end

      if @lastaction == "show_list" # In host controller, refresh show_list, else let the other controller handle it
        show_list
        @refresh_partial = "layouts/gtl"
      end

    else # showing 1 host
      if params[:id].nil? || Host.find_by_id(params[:id]).nil?
        add_flash(_("%{record} no longer exists") % {:record => ui_lookup(:table => "host")}, :error)
      else
        hosts.push(find_id_with_rbac(Host, params[:id]))
        process_hosts(hosts, method, display_name)  unless hosts.empty?
      end

      params[:display] = @display
      show

      # TODO: tells callers to go back to show_list because this Host may be gone
      # Should be refactored into calling show_list right here
      if method == 'destroy'
        @single_delete = true unless flash_errors?
      end
      if @display == "vms"
        @refresh_partial = "layouts/gtl"
      else
        @refresh_partial = "config"
      end
    end

    hosts.count
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

  def pfx_for_vm_button_pressed(_button_pressed)
    if params[:pressed].starts_with?("image_")
      return "image"
    elsif params[:pressed].starts_with?("instance_")
      return "instance"
    elsif params[:pressed].starts_with?("miq_template_")
      return "miq_template"
    elsif params[:pressed].starts_with?("orchestration_stack_")
      return "orchestration_stack"
    else
      return "vm"
    end
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

  def send_nested(record, methods)
    obj = record
    Array(methods).each do |method|
      obj = obj.send(method)
    end
    obj
  end

  def show_association(action, display_name, listicon, method, klass, association = nil, conditions = nil)
    params[:display] = klass.name
    # Ajax request means in explorer, or if current explorer is one of the explorer controllers
    @explorer = true if request.xml_http_request? && explorer_controller?
    if @explorer  # Save vars for tree history array
      @x_show = params[:x_show]
      @sb[:action] = @lastaction = action
    end
    @record = identify_record(params[:id], controller_to_model)
    @view = session[:view]                  # Restore the view from the session to get column names for the display
    return if record_no_longer_exists?(@record, klass.to_s)

    @lastaction = action

    id = params[:show] ? params[:show] : params[:x_show]
    if id.present?
      @item = send_nested(@record, method).find(from_cid(id))

      drop_breadcrumb(:name => "#{@record.name} (#{display_name})",
                      :url  => "/#{controller_name}/#{action}/#{@record.id}?page=#{@current_page}")
      drop_breadcrumb(:name => @item.name,
                      :url  => "/#{controller_name}/#{action}/#{@record.id}?show=#{@item.id}")
      @view = get_db_view(klass, :association => association)
      show_item
    else
      drop_breadcrumb({:name => @record.name,
                       :url  => "/#{controller_name}/show/#{@record.id}"}, true)
      drop_breadcrumb(:name => "#{@record.name} (#{display_name})",
                      :url  => "/#{controller_name}/#{action}/#{@record.id}")
      @listicon = listicon

      show_details(klass, :association => association, :conditions => conditions)
    end
  end
end
