module OpsController::Settings::Schedules
  extend ActiveSupport::Concern

  # Show the main Schedules list view
  def schedules_list
    schedule_build_list

    update_gtl_div('schedules_list') if pagination_or_gtl_request?
  end

  def schedule_show
    @display = "main"
    return if record_no_longer_exists?(@selected_schedule)

    # Get configured tz, else use user's tz
    @timezone = @selected_schedule.run_at && @selected_schedule.run_at[:tz] ? @selected_schedule.run_at[:tz] : session[:user_tz]

    if @selected_schedule.sched_action[:method] == 'automation_request'
      params = @selected_schedule.filter[:ui][:ui_object]
      @object_class = ui_lookup(:model => params[:target_class])
      @object_name = params[:target_class].constantize.find_by(:id => params[:target_id]).name if params[:target_class]
    end

    if @selected_schedule.filter.kind_of?(MiqExpression)
      @exp_table = exp_build_table(@selected_schedule.filter.exp)
    end
  end

  def schedule_run_now
    schedules = find_records_with_rbac(MiqSchedule, checked_or_params)
    schedules.each do |schedule|
      MiqSchedule.queue_scheduled_work(schedule.id, nil, Time.now.utc.to_i, nil)
      audit = {
        :event        => "queue_scheduled_work",
        :message      => "Schedule [#{schedule.name}] queued to run from the UI by user #{current_user.name}",
        :target_id    => schedule.id,
        :target_class => "MiqSchedule",
        :userid       => current_user.userid
      }
      AuditEvent.success(audit)
    end
    unless flash_errors?
      msg = n_("The selected Schedule has been queued to run", "The selected Schedules have been queued to run", schedules.length)
      add_flash(msg, :success, true)
    end
    get_node_info(x_node)
    replace_right_cell(:nodetype => x_node)
  end

  def schedule_add
    assert_privileges("schedule_add")
    @_params[:typ] = "new"
    schedule_edit
  end

  def schedule_edit
    assert_privileges("schedule_edit")
    case params[:button]
    when "cancel"
      @schedule = MiqSchedule.find_by(:id => params[:id])
      if !@schedule || @schedule.id.blank?
        add_flash(_("Add of new Schedule was cancelled by the user"))
      else
        add_flash(_("Edit of Schedule \"%{name}\" was cancelled by the user") % {:name => @schedule.name})
      end
      get_node_info(x_node)
      @schedule = nil
      replace_right_cell(:nodetype => @nodetype)
    when "save", "add"
      schedule = params[:id] != "new" ? MiqSchedule.find(params[:id]) : MiqSchedule.new(:userid => session[:userid])

      # This should be changed to something like schedule.changed? and schedule.changes
      # when we have a version of Rails that supports detecting changes on serialized
      # fields
      old_schedule_attributes = schedule.attributes.clone
      old_schedule_attributes.merge("filter" => old_schedule_attributes["filter"].try(:to_human))
      if schedule.run_at
        old_schedule_attributes.merge("run_at" => {:start_time => schedule.run_at[:start_time],
                                                   :tz         => schedule.run_at[:tz],
                                                   :interval   => {:unit  => schedule.run_at[:interval][:unit],
                                                                   :value => schedule.run_at[:interval][:value]}})
      end
      schedule_set_basic_record_vars(schedule)
      schedule_set_record_vars(schedule)
      schedule_set_timer_record_vars(schedule)
      schedule_validate?(schedule)
      begin
        schedule.save!
      rescue => bang
        add_flash(_("Error when adding a new schedule: %{message}") % {:message => bang.message}, :error)
        javascript_flash
      else
        AuditEvent.success(build_saved_audit_hash_angular(old_schedule_attributes, schedule, params[:button] == "add"))
        add_flash(_("Schedule \"%{name}\" was saved") % {:name => schedule.name})
        if params[:button] == "add"
          self.x_node = "xx-msc"
          schedules_list
          settings_get_info("st")
        else
          @selected_schedule = schedule
          get_node_info(x_node)
        end
        replace_right_cell(:nodetype => "root", :replace_trees => [:settings])
      end
    when "reset", nil # Reset or first time in
      require 'uri'
      obj = find_checked_items
      obj[0] = params[:id] if obj.blank? && params[:id]
      @schedule = params[:typ] == "new" ? MiqSchedule.new(:userid => session[:userid]) : MiqSchedule.find(obj[0]) # Get existing or new record

      # This is only because ops_controller tries to set form locals, otherwise we should not use the @edit variable
      @edit = {:sched_id => @schedule.id}

      depot                 = @schedule.file_depot
      full_uri, _query      = depot.try(:uri)&.split('?')
      @uri_prefix, @uri     = full_uri.to_s.split('://')
      @protocol             = DatabaseBackup.supported_depots[@uri_prefix]
      @log_userid           = depot.try(:authentication_userid)
      @log_password         = depot.try(:authentication_password)
      @log_aws_region       = depot.try(:aws_region)
      @openstack_region     = depot.try(:openstack_region)
      @keystone_api_version = depot.try(:keystone_api_version)
      @v3_domain_ident      = depot.try(:v3_domain_ident)
      @swift_api_port       = full_uri.blank? ? nil : URI(full_uri).port
      @security_protocol    = depot.try(:security_protocol)

      # This is a hack to trick the controller into thinking we loaded an edit variable
      session[:edit] = {:key => "schedule_edit__#{@schedule.id || 'new'}"}

      schedule_build_edit_screen
      session[:changed] = false
      if params[:button] == "reset"
        add_flash(_("All changes have been reset"), :warning)
      end
      replace_right_cell(:nodetype => "se")
    end
  end

  def schedule_form_fields
    schedule = MiqSchedule.find(params[:id])

    if schedule_check_compliance?(schedule)
      action_type = schedule.resource_type.underscore + "_" + schedule.sched_action[:method]
    elsif schedule_db_backup?(schedule)
      require 'uri'
      action_type          = schedule.sched_action[:method]
      depot                = schedule.file_depot
      full_uri, _query     = depot.try(:uri).split('?')
      uri_prefix, uri      = full_uri.to_s.split('://')
      protocol             = DatabaseBackup.supported_depots[uri_prefix]
      depot_name           = depot.try(:name)
      log_userid           = depot.try(:authentication_userid)
      log_aws_region       = depot.try(:aws_region)
      openstack_region     = depot.try(:openstack_region)
      keystone_api_version = depot.try(:keystone_api_version)
      v3_domain_ident      = depot.try(:v3_domain_ident)
      swift_api_port       = full_uri.blank? ? 5000 : URI(full_uri).port
      security_protocol    = depot.try(:security_protocol)
    elsif schedule_automation_request?(schedule)
      action_type = schedule.sched_action[:method]
      automate_request = fetch_automate_request_vars(schedule)
    elsif schedule.towhat.nil?
      action_type = "vm"
    elsif schedule.resource_type.nil?
      action_type = "vm"
    else
      action_type ||= schedule.resource_type == "EmsCluster" ? "emscluster" : schedule.resource_type.underscore
    end

    filter_type, filter_value = determine_filter_type_and_value(schedule)
    filtered_item_list = build_filtered_item_list(action_type, filter_type)
    run_at = schedule.run_at[:start_time].in_time_zone(schedule.run_at[:tz])

    schedule_hash = {
      :action_type          => action_type,
      :depot_name           => depot_name,
      :filter_type          => filter_type,
      :filter_value         => filter_value,
      :filtered_item_list   => filtered_item_list,
      :log_userid           => log_userid || "",
      :protocol             => protocol,
      :schedule_description => schedule.description,
      :schedule_enabled     => schedule.enabled ? "1" : "0",
      :schedule_name        => schedule.name,
      :schedule_start_date  => run_at.strftime("%m/%d/%Y"),
      :schedule_start_hour  => run_at.strftime("%H").to_i,
      :schedule_start_min   => run_at.strftime("%M").to_i,
      :schedule_time_zone   => schedule.run_at[:tz],
      :schedule_timer_type  => schedule.run_at[:interval][:unit].capitalize,
      :schedule_timer_value => schedule.run_at[:interval][:value].to_i,
      :uri                  => uri,
      :uri_prefix           => uri_prefix,
      :log_aws_region       => log_aws_region || "",
      :openstack_region     => openstack_region || "",
      :keystone_api_version => keystone_api_version,
      :v3_domain_ident      => v3_domain_ident || "",
      :swift_api_port       => swift_api_port || 5000,
      :security_protocol    => security_protocol || ""
    }

    if schedule.sched_action[:method] == "automation_request"
      schedule_hash.merge!(
        :starting_object => automate_request[:starting_object],
        :instance_names  => automate_request[:instance_names],
        :instance_name   => automate_request[:instance_name],
        :object_message  => automate_request[:object_message],
        :object_request  => automate_request[:object_request],
        :target_class    => automate_request[:target_class],
        :target_classes  => automate_request[:target_classes],
        :targets         => automate_request[:targets],
        :target_id       => automate_request[:target_id],
        :ui_attrs        => automate_request[:ui_attrs],
        :filter_type     => nil,
        :zone_id         => schedule.zone_id.to_s
      )
    end
    render :json => schedule_hash
  end

  def schedule_form_filter_type_field_changed
    filtered_item_list = build_filtered_item_list(params[:action_type], params[:filter_type])

    render :json => {:filtered_item_list => filtered_item_list}
  end

  def schedule_delete
    assert_privileges("schedule_delete")
    schedules = []
    if !params[:id] # showing a list
      schedules = find_checked_items
      if schedules.empty?
        add_flash(_("No Schedules were selected for deletion"), :error)
        javascript_flash
      end
      process_schedules(schedules, "destroy") unless schedules.empty?
      schedule_build_list
      settings_get_info("st")
      replace_right_cell(:nodetype => "root", :replace_trees => [:settings])
    else # showing 1 schedule, delete it
      if params[:id].nil? || MiqSchedule.find(params[:id]).nil?
        add_flash(_("Schedule no longer exists"), :error)
        javascript_flash
      else
        schedules.push(params[:id])
      end
      process_schedules(schedules, "destroy") unless schedules.empty?
      self.x_node = "xx-msc"
      get_node_info(x_node)
      replace_right_cell(:nodetype => x_node, :replace_trees => [:settings])
    end
  end

  def schedule_toggle(enable)
    msg = if enable
            _("The selected Schedules were enabled")
          else
            _("The selected Schedules were disabled")
          end
    schedules = find_records_with_rbac(MiqSchedule, checked_or_params)
    schedule_enable_disable(schedules, enable)
    add_flash(msg, :info, true) unless flash_errors?
    schedule_build_list
    settings_get_info("st")
    if x_node == "xx-msc"
      replace_right_cell(:nodetype => "root")
    else
      @selected_schedule = @record = schedules.first
      if @selected_schedule.filter.kind_of?(MiqExpression)
        @exp_table = exp_build_table(@selected_schedule.filter.exp)
      end
      replace_right_cell(:nodetype => x_node)
    end
  end

  def schedule_enable
    assert_privileges("schedule_enable")
    schedule_toggle(true)
  end

  def schedule_disable
    assert_privileges("schedule_disable")
    schedule_toggle(false)
  end

  def log_depot_validate
    if params[:log_password]
      file_depot = FileDepot.new
    else
      id = params[:id] || params[:backup_schedule_type]
      file_depot = MiqSchedule.find(id).file_depot
    end
    uri_settings = build_uri_settings(file_depot)
    begin
      MiqSchedule.new.verify_file_depot(uri_settings)
    rescue => bang
      add_flash(_("Error during 'Validate': %{message}") % {:message => bang.message}, :error)
    else
      add_flash(_('Depot Settings successfuly validated'))
    end
    javascript_flash
  end

  private

  def schedule_check_compliance?(schedule)
    schedule.sched_action && schedule.sched_action[:method] && schedule.sched_action[:method] == "check_compliance"
  end

  def schedule_db_backup?(schedule)
    schedule.sched_action && schedule.sched_action[:method] && schedule.sched_action[:method] == "db_backup"
  end

  def schedule_automation_request?(schedule)
    schedule.sched_action && schedule.sched_action[:method] && schedule.sched_action[:method] == "automation_request"
  end

  def schedule_resource_type_from_params_action
    case params[:action_typ]
    when "db_backup"          then "DatabaseBackup"
    when /check_compliance\z/ then (params[:action_typ].split("_") - params[:action_typ].split("_").last(2)).join("_").classify
    when "emscluster"         then "EmsCluster"
    when "automation_request" then "AutomationRequest"
    else                           params[:action_typ].camelcase
    end
  end

  def schedule_method_from_params_action
    case params[:action_typ]
    when "vm", "miq_template" then "vm_scan" # Default to vm_scan method for now
    when /check_compliance\z/ then "check_compliance"
    when "db_backup"          then "db_backup"
    when "automation_request" then "automation_request"
    else                           "scan"
    end
  end

  def build_filtered_item_list(action_type, filter_type)
    case filter_type
    when "vm"
      filtered_item_list = find_filtered(Vm).sort_by { |vm| vm.name.downcase }.collect(&:name).uniq
    when "miq_template"
      filtered_item_list =
        find_filtered(MiqTemplate).sort_by { |miq_template| miq_template.name.downcase }.collect(&:name).uniq
    when "host"
      filtered_item_list = find_filtered(Host).sort_by { |vm| vm.name.downcase }.collect(&:name).uniq
    when "container_image"
      filtered_item_list = find_filtered(ContainerImage).sort_by { |ci| ci.name.downcase }.collect(&:name).uniq
    when "ems"
      filtered_item_list = if %w[emscluster host host_check_compliance storage].include?(action_type)
                             find_filtered(ExtManagementSystem).collect { |ems| ems.name if ems.number_of(:hosts).positive? }
                                                               .delete_if(&:blank?).sort_by(&:downcase)
                           else
                             find_filtered(ExtManagementSystem).sort_by { |vm| vm.name.downcase }.collect(&:name).uniq
                           end
    when "cluster"
      filtered_item_list = find_filtered(EmsCluster).collect do |cluster|
        [cluster.name + "__" + cluster.v_parent_datacenter, cluster.v_qualified_desc]
      end.sort_by { |cluster| cluster.first.downcase }.uniq
    when "storage"
      filtered_item_list = find_filtered(Storage).sort_by { |ds| ds.name.downcase }.collect(&:name).uniq
    when "global"
      action_type = if action_type == "miq_template"
                      action_type.camelize
                    else
                      action_type.split("_").first.capitalize
                    end
      build_listnav_search_list(action_type)
      filtered_item_list = @def_searches.delete_if { |search| search.id.zero? }.collect { |search| [search.id, search.description] }
    when "my"
      build_listnav_search_list("Vm")
      filtered_item_list = @my_searches.collect { |search| [search.id, search.description] }
    else
      filtered_item_list = []
      DatabaseBackup.supported_depots.each { |depot| filtered_item_list.push(depot[1]) }
    end

    filtered_item_list
  end

  def schedule_db_backup_or_automate(schedule)
    %w[db_backup automation_request].include?(schedule.sched_action[:method])
  end

  def determine_filter_type_and_value(schedule)
    if schedule.sched_action && schedule.sched_action[:method] && !schedule_db_backup_or_automate(schedule)
      if schedule.miq_search # See if a search filter is attached
        filter_type = schedule.miq_search.search_type == "user" ? "my" : "global"
        filter_value = schedule.miq_search.id
      elsif schedule.filter.nil? # Set to All if not set
        filter_type = "all"
        filter_value = nil
      else
        key = schedule.filter.exp.keys.first
        if key == "IS NOT NULL" # All
          filter_type = "all"
          filter_value = nil
        elsif key == "AND" # Cluster name and datacenter
          filter_type = "cluster"
          filter_value = schedule.filter.exp[key][0]["="]["value"] + "__" + schedule.filter.exp[key][1]["="]["value"]
        else
          case schedule.filter.exp[key]["field"]
          when "Vm.ext_management_system-name",
               "MiqTemplate.ext_management_system-name",
               "Storage.ext_management_systems-name",
               "Host.ext_management_system-name",
               "EmsCluster.ext_management_system-name",
               "ContainerImage.ext_management_system-name"
            filter_type = "ems"
          when "Vm.host-name", "MiqTemplate.host-name", "Storage.hosts-name", "Host-name"
            filter_type = "host"
          when "Vm-name"
            filter_type = "vm"
          when "MiqTemplate-name"
            filter_type = "miq_template"
          when "Storage-name"
            filter_type = "storage"
          when "ContainerImage-name"
            filter_type = "container_image"
          end

          filter_value = schedule.filter.exp[key]["value"]
        end
      end
    end

    return filter_type, filter_value
  end

  # Create the view and associated vars for the schedules list
  def schedule_build_list
    @lastaction = "schedules_list"
    @force_no_grid_xml = true
    if params[:ppsetting]                                             # User selected new per page value
      @items_per_page = params[:ppsetting].to_i                       # Set the new per page value
      @settings.store_path(:perpage, @gtl_type.to_sym, @items_per_page) # Set the per page setting for this gtl type
    end
    @sortcol = session[:schedule_sortcol].nil? ? 0 : session[:schedule_sortcol].to_i
    @sortdir = session[:schedule_sortdir].nil? ? "ASC" : session[:schedule_sortdir]

    @view, @pages = get_view(MiqSchedule, :named_scope => [[:with_prod_default_not_in, "system"], :without_adhoc]) # Get the records (into a view) and the paginator

    @current_page = @pages[:current] unless @pages.nil? # save the current page number
    session[:schedule_sortcol] = @sortcol
    session[:schedule_sortdir] = @sortdir
  end

  def schedule_validate?(sched)
    valid = true
    unless %w[db_backup automation_request].include?(params[:action_typ])
      if %w[global my].include?(params[:filter_typ])
        if params[:filter_value].blank? # Check for search filter chosen
          add_flash(_("Filter must be selected"), :error)
          valid = false
        end
      elsif sched.filter.exp.keys.first != "IS NOT NULL" && params[:filter_value].blank? # Check for empty filter value
        add_flash(_("Filter value must be selected"), :error)
        valid = false
      end
    end
    unless flash_errors?
      if sched.run_at[:interval][:unit] == "once" &&
         sched.run_at[:start_time].to_time.utc < Time.now.utc &&
         sched.enabled == true
        add_flash(_("Warning: This 'Run Once' timer is in the past and will never run as currently configured"), :warning)
      end
    end
    valid
  end

  def schedule_build_edit_screen
    @vm_global_filters, @vm_my_filters                     = build_global_and_my_filters("Vm")
    @miq_template_global_filters, @miq_template_my_filters = build_global_and_my_filters("MiqTemplate")
    @host_global_filters, @host_my_filters                 = build_global_and_my_filters("Host")
    @cluster_global_filters, @cluster_my_filters           = build_global_and_my_filters("EmsCluster")
    @storage_global_filters, @storage_my_filters           = build_global_and_my_filters("Storage")

    build_schedule_options_for_select

    one_month_ago = Time.zone.now - 1.month
    @one_month_ago = {
      :year  => one_month_ago.year,
      :month => one_month_ago.month - 1, # Javascript counts months 0-11
      :date  => one_month_ago.day
    }
  end

  def build_global_and_my_filters(type)
    build_listnav_search_list(type)
    global_filters = @def_searches.reject { |s| s.id.zero? }.collect { |s| [s.description, s.id] }
    my_filters = @my_searches.collect { |s| [s.description, s.id] }

    return global_filters, my_filters
  end

  def schedule_set_record_vars(schedule)
    schedule.resource_type = schedule_resource_type_from_params_action
    schedule.sched_action = {:method => schedule_method_from_params_action}

    if params[:action_typ] == "db_backup"
      schedule.filter = nil
      depot = schedule.file_depot
      uri_settings = build_uri_settings(depot)
      uri_settings[:name] = params[:depot_name]
      uri_settings[:save] = true
      schedule.verify_file_depot(uri_settings)
    elsif params[:action_typ] == "automation_request"
      schedule.zone_id = params[:zone_id].presence || MiqServer.my_server.zone_id
      ui_attrs = []
      ApplicationController::AE_MAX_RESOLUTION_FIELDS.times do |i|
        next unless params[:ui_attrs] && params[:ui_attrs][i.to_s]

        ui_attrs[i] = []
        ui_attrs[i][0] = params[:ui_attrs][i.to_s][0]
        ui_attrs[i][1] = params[:ui_attrs][i.to_s][1]
      end
      schedule.filter = {
        :uri_parts  => {
          :namespace => params[:starting_object],
          :instance  => params[:instance_name],
          :message   => params[:object_message]
        },
        :ui         => {:ui_attrs  => ui_attrs,
                        :ui_object => {:target_class => params[:target_class].presence,
                                       :target_id    => params[:target_id]}},
        :parameters => {
          :request        => params[:object_request],
          :instance_name  => params[:instance_name],
          :object_message => params[:object_message],
        }.merge!(ui_attrs.to_h).merge!(build_attrs_from_params(params))
      }
    elsif %w[global my].include?(params[:filter_typ]) # Search filter chosen, set up relationship
      schedule.filter     = nil # Clear out existing filter expression
      schedule.miq_search = params[:filter_value] ? MiqSearch.find(params[:filter_value]) : nil # Set up the search relationship
    else # Build the filter expression
      schedule.filter     = MiqExpression.new(build_search_filter_from_params)
      schedule.miq_search = nil if schedule.miq_search # Clear out any search relationship
    end
  end

  def build_attrs_from_params(params)
    return {} if params[:target_class].empty?

    klass = params[:target_class].constantize
    object = klass.find(params[:target_id])
    { MiqAeEngine.create_automation_attribute_key(object).to_s => MiqAeEngine.create_automation_attribute_value(object) }
  end

  def build_search_filter_from_params
    case params[:action_typ]
    when "storage"
      case params[:filter_typ]
      when "ems"     then {"CONTAINS" => {"field" => "Storage.ext_management_systems-name", "value" => params[:filter_value]}}
      when "host"    then {"CONTAINS" => {"field" => "Storage.hosts-name", "value" => params[:filter_value]}}
      when "storage" then {"=" => {"field" => "Storage-name", "value" => params[:filter_value]}}
      else                {"IS NOT NULL" => {"field" => "Storage-name"}}
      end
    when "host"
      case params[:filter_typ]
      when "cluster"
        if params[:filter_value].present?
          {"AND" => [
            {"=" => {"field" => "Host-v_owning_cluster", "value" => params[:filter_value].split("__").first}},
            {"=" => {"field" => "Host-v_owning_datacenter", "value" => params[:filter_value].split("__").size == 1 ? "" : params[:filter_value].split("__").last}}
          ]}
        end
      when "ems"  then {"=" => {"field" => "Host.ext_management_system-name", "value" => params[:filter_value]}}
      when "host" then {"=" => {"field" => "Host-name", "value" => params[:filter_value]}}
      else             {"IS NOT NULL" => {"field" => "Host-name"}}
      end
    when "container_image", "container_image_check_compliance"
      case params[:filter_typ]
      when "ems" then {"=" => {"field" => "ContainerImage.ext_management_system-name", "value" => params[:filter_value]}}
      when "container_image" then {"=" => {"field" => "ContainerImage-name", "value" => params[:filter_value]}}
      else {"IS NOT NULL" => {"field" => "ContainerImage-name"}}
      end
    when "emscluster"
      case params[:filter_typ]
      when "cluster"
        if params[:filter_value].present?
          {"AND" => [
            {"=" => {"field" => "EmsCluster-name", "value" => params[:filter_value].split("__").first}},
            {"=" => {"field" => "EmsCluster-v_parent_datacenter", "value" => params[:filter_value].split("__").size == 1 ? "" : params[:filter_value].split("__").last}}
          ]}
        end
      when "ems" then {"=" => {"field" => "EmsCluster.ext_management_system-name", "value" => params[:filter_value]}}
      else            {"IS NOT NULL" => {"field" => "EmsCluster-name"}}
      end
    when /check_compliance\z/
      case params[:filter_typ]
      when "cluster"
        if params[:filter_value].present?
          {"AND" => [
            {"=" => {"field" => "#{params[:action_typ].split("_").first.capitalize}-v_owning_cluster", "value" => params[:filter_value].split("__").first}},
            {"=" => {"field" => "#{params[:action_typ].split("_").first.capitalize}-v_owning_datacenter", "value" => params[:filter_value].split("__").size == 1 ? "" : params[:filter_value].split("__").last}}
          ]}
        end
      when "ems"  then {"=" => {"field" => "#{params[:action_typ].split("_").first.capitalize}.ext_management_system-name", "value" => params[:filter_value]}}
      when "host" then {"=" => {"field" => "Host-name", "value" => params[:filter_value]}}
      when "vm"   then {"=" => {"field" => "Vm-name", "value" => params[:filter_value]}}
      else             {"IS NOT NULL" => {"field" => "#{params[:action_typ].split("_").first.capitalize}-name"}}
      end
    else
      model = params[:action_typ].starts_with?("vm") ? "Vm" : "MiqTemplate"
      case params[:filter_typ]
      when "cluster"
        if params[:filter_value].present?
          {"AND" => [
            {"=" => {"field" => "#{model}-v_owning_cluster", "value" => params[:filter_value].split("__").first}},
            {"=" => {"field" => "#{model}-v_owning_datacenter", "value" => params[:filter_value].split("__").size == 1 ? "" : params[:filter_value].split("__").last}}
          ]}
        end
      when "ems"          then {"=" => {"field" => "#{model}.ext_management_system-name", "value" => params[:filter_value]}}
      when "host"         then {"=" => {"field" => "#{model}.host-name", "value" => params[:filter_value]}}
      when "miq_template", "vm", "container_image" then {"=" => {"field" => "#{model}-name", "value" => params[:filter_value]}}
      else {"IS NOT NULL" => {"field" => "#{model}-name"}}
      end
    end
  end

  # Common Schedule button handler routines follow
  def process_schedules(schedules, task)
    process_elements(schedules, MiqSchedule, task)
  end

  def build_schedule_options_for_select
    @action_type_options_for_select = [
      [_("VM Analysis"), "vm"],
      [_("Template Analysis"), "miq_template"],
      [_("Host Analysis"), "host"],
      [_("Container Image Analysis"), "container_image"],
      [_("Cluster Analysis"), "emscluster"],
      [_("Datastore Analysis"), "storage"]
    ]
    if role_allows?(:feature => "vm_check_compliance") || role_allows?(:feature => "miq_template_check_compliance")
      @action_type_options_for_select.push([_("VM Compliance Check"), "vm_check_compliance"])
    end
    if role_allows?(:feature => "host_check_compliance")
      @action_type_options_for_select.push([_("Host Compliance Check"), "host_check_compliance"])
    end
    if role_allows?(:feature => "container_image_check_compliance")
      @action_type_options_for_select.push([_("Container Image Compliance Check"), "container_image_check_compliance"])
    end
    @action_type_options_for_select.push([_("Database Backup"), "db_backup"])

    if role_allows?(:feature => "miq_ae_class_simulation")
      @action_type_options_for_select.push([_("Automation Tasks"), "automation_request"])
    end

    @vm_options_for_select = [
      [_("All VMs"), "all"],
      [_("All VMs for Providers"), "ems"],
      [_("All VMs for Clusters"), "cluster"],
      [_("All VMs for Host"), "host"],
      [_("A single VM"), "vm"]
    ] +
                             (@vm_global_filters.empty? ? [] : [[_("Global Filters"), "global"]]) +
                             (@vm_my_filters.empty? ? [] : [[_("My Filters"), "my"]])

    @template_options_for_select = [
      [_("All Templates"), "all"],
      [_("All Templates for Providers"), "ems"],
      [_("All Templates for Clusters"), "cluster"],
      [_("All Templates for Host"), "host"],
      [_("A single Template"), "miq_template"]
    ] +
                                   (@miq_template_global_filters.empty? ? [] : [[_("Global Filters"), "global"]]) +
                                   (@miq_template_my_filters.empty? ? [] : [[_("My Filters"), "my"]])

    @host_options_for_select = [
      [_("All Hosts"), "all"],
      [_("All Hosts for Infrastructure Provider"), "ems"],
      [_("All Hosts for Clusters"), "cluster"],
      [_("A single Host"), "host"]
    ] +
                               (@host_global_filters.empty? ? [] : [[_("Global Filters"), "global"]]) +
                               (@host_my_filters.empty? ? [] : [[_("My Filters"), "my"]])

    # to do, add scheduling by project
    @container_image_options_for_select = [
      [_("All Container Images"), "all"],
      [_("All Container Images for Containers Provider"), "ems"],
      [_("A single Container Image"), "container_image"]
    ]

    @cluster_options_for_select = [
      [_("All Clusters"), "all"],
      [_("All Clusters for Infrastructure Provider"), "ems"],
      [_("A single Cluster"), "cluster"]
    ] +
                                  (@cluster_global_filters.empty? ? [] : [[_("Global Filters"), "global"]]) +
                                  (@cluster_my_filters.empty? ? [] : [[_("My Filters"), "my"]])

    @storage_options_for_select = [
      [_("All Datastores"), "all"],
      [_("All Datastores for Host"), "host"],
      [_("All Datastores for Infrastructure Provider"), "ems"],
      [_("A single Datastore"), "storage"]
    ] +
                                  (@storage_global_filters.empty? ? [] : [[_("Global Filters"), "global"]]) +
                                  (@storage_my_filters.empty? ? [] : [[_("My Filters"), "my"]])

    build_db_options_for_select
  end

  def build_db_options_for_select
    @protocols_arr = []
    DatabaseBackup.supported_depots.each { |depot| @protocols_arr.push(depot[1]) }
    @database_backup_options_for_select = @protocols_arr.sort
    @regions_options_for_select = retrieve_aws_regions
    @api_versions_options_for_select = retrieve_openstack_api_versions
    @security_protocols_options_for_select = retrieve_security_protocols
  end

  def retrieve_aws_regions
    ManageIQ::Providers::Amazon::Regions.regions.flat_map { |region| [region[1].values_at(:description, :name)] }
  end

  def retrieve_openstack_api_versions
    [['Keystone v2', 'v2'], ['Keystone v3', 'v3']]
  end

  def retrieve_security_protocols
    [[_('SSL without validation'), 'ssl'], [_('SSL'), 'ssl-with-validation'], [_('Non-SSL'), 'non-ssl']]
  end

  def schedule_set_basic_record_vars(schedule)
    schedule.name = params[:name]
    schedule.description = params[:description]
    schedule.enabled = params[:enabled] || "off"
  end

  def schedule_set_timer_record_vars(schedule)
    schedule.run_at ||= {}
    schedule.run_at[:tz] = params[:time_zone]
    schedule_set_start_time_record_vars(schedule)
    schedule_set_interval_record_vars(schedule)
  end

  def schedule_set_start_time_record_vars(schedule)
    run_at = create_time_in_utc("#{Date.parse(params[:start_date])} #{params[:start_hour]}:#{params[:start_min]}:00",
                                params[:time_zone])
    schedule.run_at[:start_time] = "#{run_at} Z"
  end

  def schedule_set_interval_record_vars(schedule)
    schedule.run_at[:interval] ||= {}
    schedule.run_at[:interval][:unit] = params[:timer_typ].downcase
    schedule.run_at[:interval][:value] = params[:timer_value]
  end

  def build_uri_settings(file_depot)
    uri_settings = {}
    type = FileDepot.depot_description_to_class(params[:log_protocol])
    if type.try(:requires_credentials?)
      log_password = params[:log_password] || file_depot.try(:authentication_password)
      uri_settings = {:username => params[:log_userid], :password => log_password}
    end
    uri_settings[:uri]                  = "#{params[:uri_prefix]}://#{params[:uri]}"
    uri_settings[:uri_prefix]           = params[:uri_prefix]
    uri_settings[:log_protocol]         = params[:log_protocol]
    uri_settings[:aws_region]           = params[:log_aws_region]
    uri_settings[:openstack_region]     = params[:openstack_region]
    uri_settings[:keystone_api_version] = params[:keystone_api_version]
    uri_settings[:v3_domain_ident]      = params[:v3_domain_ident]
    uri_settings[:security_protocol]    = params[:security_protocol]
    uri_settings[:swift_api_port]       = params[:swift_api_port]
    uri_settings[:type] = type
    uri_settings
  end
end
