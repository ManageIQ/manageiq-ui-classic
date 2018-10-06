module ApplicationHelper
  include_concern 'ViewsShared'
  include_concern 'Flash'
  include_concern 'Listnav'
  include_concern 'Navbar'
  include_concern 'PageLayouts'
  include_concern 'Tasks'
  include Sandbox
  include JsHelper
  include StiRoutingHelper
  include ToolbarHelper
  include TextualSummaryHelper
  include PlanningHelper
  include NumberHelper
  include PlanningHelper
  include Title
  include ReactjsHelper
  include Webpack

  VALID_PERF_PARENTS = {
    "EmsCluster" => :ems_cluster,
    "Host"       => :host
  }

  # Need to generate paths w/o hostname by default to make proxying work.
  #
  def url_for_only_path(args)
    url_for(:only_path => true, **args)
  end

  def settings(*path)
    @settings ||= {}
    @settings.fetch_path(*path)
  end

  def settings_default(default, *path)
    settings(*path) || default
  end

  def documentation_link(url = nil, documentation_subject = "")
    if url
      link_to(_("For more information, visit the %{subject} documentation.") % {:subject => documentation_subject},
              url, :rel => 'external',
              :class => 'documentation-link', :target => '_blank')
    end
  end

  def websocket_origin
    proto = request.ssl? ? 'wss' : 'ws'
    # Retrieve the host that needs to be explicitly allowed for websocket connections
    host = if request.env['HTTP_X_FORWARDED_HOST']
             # Use the first proxy (production)
             request.env['HTTP_X_FORWARDED_HOST'].split(/,\s*/).first
           else
             # Use the HOST header (development)
             request.env['HTTP_HOST']
           end
    "#{proto}://#{host}"
  end

  # Create a hidden div area based on a condition (using for hiding nav panes)
  def hidden_div_if(condition, options = {}, &block)
    hidden_tag_if(:div, condition, options, &block)
  end

  # Create a hidden span tag based on a condition (using for hiding nav panes)
  def hidden_span_if(condition, options = {}, &block)
    hidden_tag_if(:span, condition, options, &block)
  end

  def hidden_tag_if(tag, condition, options = {}, &block)
    options[:style] = "display: none" if condition
    if block_given?
      content_tag(tag, options, &block)
    else
      # TODO: Remove this old open-tag-only way in favor of block style
      tag(tag, options, true)
    end
  end

  def hover_class(item)
    if item.fetch_path(:link) ||
       item.fetch_path(:value).kind_of?(Array) &&
       item[:value].any? { |val| val[:link] }
      ''
    else
      'no-hover'
    end
  end

  # Check role based authorization for a UI task
  def role_allows?(**options)
    if options[:feature].nil?
      $log.debug("Auth failed - no feature was specified (required)")
      return false
    end

    Rbac.role_allows?(options.merge(:user => User.current_user)) rescue false
  end

  module_function :role_allows?
  public :role_allows?
  alias_method :role_allows, :role_allows?
  Vmdb::Deprecation.deprecate_methods(self, :role_allows => :role_allows?)

  # NB: This differs from controller_for_model; until they're unified,
  # make sure you have the right one.
  def model_to_controller(record)
    record.class.base_model.name.underscore
  end

  def type_has_quadicon(type)
    !%w(
      ConfigurationProfile
      Account
      GuestApplication
      SystemService
      Filesystem
      ChargebackRate
      ServiceTemplateProvisionRequest
      MiqProvisionRequest
      MiqProvisionRequestTemplate
      MiqWebServiceWorker
      CustomizationTemplateSysprep
      CustomizationTemplateCloudInit
      CustomizationTemplateKickstart
      PxeImageType
      IsoDatastore
      MiqTask
      MiqRequest
      PxeServer
    ).include? type
  end

  CONTROLLER_TO_MODEL = {
    "ManageIQ::Providers::CloudManager::Template" => VmOrTemplate,
    "ManageIQ::Providers::CloudManager::Vm"       => VmOrTemplate,
    "ManageIQ::Providers::InfraManager::Template" => VmOrTemplate,
    "ManageIQ::Providers::InfraManager::Vm"       => VmOrTemplate,
    "ManageIQ::Providers::AutomationManager"      => ConfigurationScript
  }.freeze

  def controller_to_model
    model = self.class.model
    CONTROLLER_TO_MODEL[model.to_s] || model
  end

  MODEL_STRING = {
    "all_vms"                                => VmOrTemplate,
    "all_miq_templates"                      => MiqTemplate,
    "based_volumes"                          => CloudVolume,
    "instances"                              => Vm,
    "images"                                 => MiqTemplate,
    "groups"                                 => Account,
    "users"                                  => Account,
    "host_services"                          => SystemService,
    "chargebacks"                            => ChargebackRate,
    "playbooks"                              => ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook,
    "physical_servers_with_host"             => PhysicalServer,
    "manageiq/providers/automation_managers" => ConfigurationScript,
    "vms"                                    => VmOrTemplate,
    "ServiceCatalog"                         => ServiceTemplate
  }.freeze

  HAS_ASSOCATION = {
    "groups"           => "groups",
    "users"            => "users",
    "event_logs"       => "event_logs",
    "OsProcess"        => "processes",
    "scan_histories"   => "scan_histories",
    "based_volumes"    => "based_volumes",
    "PersistentVolume" => "persistent_volumes",
    "PhysicalSwitch"   => "physical_switches"
  }.freeze

  def model_to_report_data
    # @report_data_additional_options[:model] is most important, others can be removed
    return @report_data_additional_options[:model] if @report_data_additional_options && @report_data_additional_options[:model]
    return @display.classify if @display && @display != "main"
    return params[:db].classify if params[:db]
    return params[:display].classify if params[:display]
    controller.class.model.to_s if defined? controller.class.model
  end

  def model_string_to_constant(model_string)
    MODEL_STRING[model_string] || model_string.singularize.classify.constantize
  end

  def restful_routed?(record_or_model)
    model = if record_or_model.kind_of?(Class)
              record_or_model
            else
              record_or_model.class
            end
    model = ui_base_model(model)
    respond_to?("#{model.model_name.route_key}_path")
  end

  def restful_routed_action?(controller = controller_name, action = action_name)
    restful_routed?(("#{controller.camelize}Controller").constantize.model) && !%w(explorer show_list).include?(action)
  rescue
    false
  end

  # Returns whether records support feature or not.
  #
  # Params:
  #   records - an array of record instances or a single instance of a record
  #   feature - symbol, a feature from SupportsFeatureMixin::QUERYABLE_FEATURES
  # Returns:
  #   boolean - true if all records support the feature
  #           - false in case the record (or one of many records) does not
  #             support the feature
  def records_support_feature?(records, feature)
    unsupported_record = Array.wrap(records).find do |record|
      if record.respond_to?("supports_#{feature}?")
        !record.supports?(feature)
      else # TODO: remove with deleting AvailabilityMixin module
        !record.is_available?(feature)
      end
    end
    unsupported_record.nil?
  end

  def url_for_record(record, action = "show") # Default action is show
    @id = record.id
    db  = if controller.kind_of?(VmOrTemplateController)
            "vm_or_template"
          elsif record.kind_of?(VmOrTemplate)
            controller_for_vm(model_for_vm(record))
          elsif record.kind_of?(ManageIQ::Providers::AnsibleTower::AutomationManager) ||
                record.kind_of?(ManageIQ::Providers::ExternalAutomationManager::InventoryRootGroup)
            "automation_manager"
          elsif record.kind_of?(ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook)
            "ansible_playbook"
          elsif record.kind_of?(ManageIQ::Providers::EmbeddedAutomationManager::Authentication)
            "ansible_credential"
          elsif record.kind_of?(ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource)
            "ansible_repository"
          elsif record.kind_of?(ManageIQ::Providers::Foreman::ConfigurationManager)
            "provider_foreman"
          elsif record.class.respond_to?(:db_name)
            record.class.db_name
          else
            record.class.base_class.to_s
          end
    url_for_db(db, action, record)
  end

  # Create a url for a record that links to the proper controller
  def url_for_db(db, action = "show", item = nil) # Default action is show
    if item && restful_routed?(item)
      return polymorphic_path(item)
    end
    if @vm && ["Account", "User", "Group", "Patch", "GuestApplication"].include?(db)
      return url_for_only_path(:controller => "vm_or_template",
                     :action     => @lastaction,
                     :id         => @vm,
                     :show       => @id
                    )
    elsif @host && ["Patch", "GuestApplication"].include?(db)
      return url_for_only_path(:controller => "host", :action => @lastaction, :id => @host, :show => @id)
    elsif %w(ConfiguredSystem ConfigurationProfile).include?(db)
      return url_for_only_path(:controller => "provider_foreman", :action => @lastaction, :id => @record, :show => @id)
    else
      controller, action = db_to_controller(db, action)
      return url_for_only_path(:controller => controller, :action => action, :id => @id)
    end
  end

  TREE_WITH_TAB = {
    "diagnostics_server_list" => "svr",
    "db_details"              => "tb",
    "report_info"             => "msc"
  }.freeze

  # Create a url to show a record from the passed in view
  def view_to_url(view, parent = nil)
    association = view_to_association(view, parent)
    if association.nil?
      controller, action = db_to_controller(view.db)
      if controller == "ems_cloud" && action == "show"
        return ems_clouds_path
      end
      if controller == "ems_infra" && action == "show"
        return ems_infras_path
      end
      if controller == "ems_physical_infra" && action == "show"
        return ems_physical_infras_path
      end
      if controller == "ems_container" && action == "show"
        return ems_containers_path
      end
      if controller == "ems_middleware" && action == "show"
        return ems_middlewares_path
      end
      if controller == "ems_network" && action == "show"
        return ems_networks_path
      end
      if request[:controller] == 'service' && view.db == 'GenericObject'
        action = 'show'
        return url_for_only_path(:action => action, :id => params[:id]) + "?display=generic_objects&generic_object_id="
      end
      # If we do not want to use redirect or any kind of click action
      if %w(Job VmdbDatabaseSetting VmdbDatabaseConnection VmdbIndex).include?(view.db) &&
         %w(ops).include?(params[:controller])
        return false
      end
      if %w(MiqTask).include?(view.db) && %w(miq_task).include?(params[:controller])
        return true
      end
      if @explorer
        # showing a list view of another CI inside vmx
        if %w(SecurityGroup
              FloatingIp
              NetworkRouter
              NetworkPort
              CloudNetwork
              CloudSubnet
              LoadBalancer
              CloudVolume
              ).include?(view.db)
          return url_for_only_path(:controller => controller, :action => "show") + "/"
        elsif ["Vm"].include?(view.db) && parent && request.parameters[:controller] != "vm"
          # this is to handle link to a vm in vm explorer from service explorer
          return url_for_only_path(:controller => "vm_or_template", :action => "show") + "/"
        elsif %w(ConfigurationProfile).include?(view.db) &&
              request.parameters[:controller] == "provider_foreman"
          return url_for_only_path(:action => action, :id => nil) + "/"
        elsif %w(ManageIQ::Providers::AutomationManager::InventoryRootGroup EmsFolder).include?(view.db) &&
              request.parameters[:controller] == "automation_manager"
          return url_for_only_path(:action => action, :id => nil) + "/"
        elsif %w(ConfiguredSystem).include?(view.db) && (request.parameters[:controller] == "provider_foreman" || request.parameters[:controller] == "automation_manager")
          return url_for_only_path(:action => action, :id => nil) + "/"
        elsif %w(MiqWidget
                 ConfigurationScript
                 MiqReportResult).include?(view.db) &&
              %w(report automation_manager).include?(request.parameters[:controller])
          suffix = ''
          if params[:tab_id] == "saved_reports" || params[:pressed] == "miq_report_run" || params[:action] == "reload"
            suffix = x_node
          end
          return "/" + request.parameters[:controller] + "/tree_select?id=" + suffix
        elsif %w(User MiqGroup MiqUserRole Tenant).include?(view.db) &&
              %w(ops).include?(request.parameters[:controller])
          if @tagging
            return false # when tagging Users, Groups, Roles and Tennants, the table is non-clickable
          else
            return "/" + request.parameters[:controller] + "/tree_select/?id=" + x_node.split("-")[1]
          end
        elsif %w(VmdbTableEvm MiqServer).include?(view.db) &&
              %w(ops report).include?(request.parameters[:controller])
          return "/" + request.parameters[:controller] + "/tree_select/?id=" + TREE_WITH_TAB[active_tab]
        elsif %w(MiqAction
                 MiqAlert
                 ScanItemSet
                 MiqSchedule
                 PxeServer
                 PxeImageType
                 IsoDatastore
                 CustomizationTemplate).include?(view.db) &&
              %w(miq_policy ops pxe report).include?(params[:controller])
          return "/#{params[:controller]}/tree_select/?id=#{TreeBuilder.get_prefix_for_model(view.db)}"
        elsif %w(MiqPolicy).include?(view.db) && %w(miq_policy).include?(params[:controller])
          return "/#{params[:controller]}/tree_select/?id=#{x_node}"
        else
          return url_for_only_path(:action => action) + "/" # In explorer, don't jump to other controllers
        end
      else
        controller = "vm_cloud" if controller == "template_cloud"
        controller = "vm_infra" if controller == "template_infra"
        return url_for_only_path(:controller => controller, :action => action, :id => nil) + "/"
      end
    else
      # need to add a check for @explorer while setting controller incase building a link for details screen to show items
      # i.e users list view screen inside explorer needs to point to vm_or_template controller
      return url_for_only_path(:controller => parent.kind_of?(VmOrTemplate) && !@explorer ? parent.class.base_model.to_s.underscore : request.parameters["controller"],
                     :action     => association,
                     :id         => parent.id) + "?#{@explorer ? "x_show" : "show"}="
    end
  end

  def view_to_association(view, parent)
    case view.db
    when "OrchestrationStackOutput"    then "outputs"
    when "OrchestrationStackParameter" then "parameters"
    when "OrchestrationStackResource"  then "resources"
    when 'AdvancedSetting', 'Filesystem', 'FirewallRule', 'GuestApplication', 'Patch',
         'RegistryItem', 'ScanHistory', 'OpenscapRuleResult'
                                       then view.db.tableize
    when "SystemService"
      case parent.class.base_class.to_s.downcase
      when "host" then "host_services"
      when "vm"   then @lastaction
      end
    when "CloudService" then "host_cloud_services"
    else view.scoped_association
    end
  end

  # Convert a db name to a controller name and an action
  def db_to_controller(db, action = "show")
    action = "x_show" if @explorer
    case db
    when "ActionSet"
      controller = "miq_action"
      action = "show_set"
    when "AutomationRequest"
      controller = "miq_request"
      action = "show"
    when "ConditionSet"
      controller = "condition"
    when "ManageIQ::Providers::EmbeddedAutomationManager::ConfigurationScriptSource"
      controller = "ansible_repository"
    when "ScanItemSet"
      controller = "ops"
      action = "ap_show"
    when "MiqEventDefinition"
      controller = "event"
      action = "_none_"
    when "User", "Group", "Patch", "GuestApplication"
      controller = "vm"
      action = @lastaction
    when "Host" && action == 'x_show'
      controller = "infra_networking"
      action = @lastaction
    when "MiqReportResult"
      controller = "report"
      action = "show_saved"
    when "MiqSchedule"
      if request.parameters["controller"] == "report"
        controller = "report"
        action = "show_schedule"
      else
        controller = "ops"
        action = "schedule_show"
      end
    when "MiqAeClass"
      controller = "miq_ae_class"
      action = "show_instances"
    when "MiqAeInstance"
      controller = "miq_ae_class"
      action = "show_details"
    when "SecurityGroup"
      controller = "security_group"
      action = "show"
    when "ServiceResource", "ServiceTemplate"
      controller = "catalog"
    when "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::Playbook"
      controller = "ansible_playbook"
    when "ManageIQ::Providers::EmbeddedAutomationManager::Authentication"
      controller = "ansible_credential"
    when "MiqWorker"
      controller = request.parameters[:controller]
    when "OrchestrationStackOutput", "OrchestrationStackParameter", "OrchestrationStackResource",
        "ManageIQ::Providers::CloudManager::OrchestrationStack",
        "ManageIQ::Providers::AnsibleTower::AutomationManager::Job", "ConfigurationScript"
      controller = request.parameters[:controller]
    when "ContainerVolume"
      controller = "persistent_volume"
    when /^ManageIQ::Providers::(\w+)Manager$/
      controller = "ems_#{$1.underscore}"
    when /^ManageIQ::Providers::(\w+)Manager::(\w+)$/
      controller = "#{$2.underscore}_#{$1.underscore}"
    when "EmsAutomation"
      controller = "automation_manager"
    when "GenericObject" && request.parameters[:controller] == 'service'
      controller = request.parameters[:controller]
      action = 'generic_object'
    else
      controller = db.underscore
    end
    return controller, action
  end

  # Method to create the center toolbar XML
  def build_toolbar(tb_name)
    _toolbar_builder.call(tb_name)
  end

  def _toolbar_builder
    ToolbarBuilder.new(
      self,
      binding,
      :active           => @active,
      :changed          => @changed,
      :condition        => @condition,
      :condition_policy => @condition_policy,
      :db               => @db,
      :display          => @display,
      :edit             => @edit,
      :explorer         => @explorer,
      :ght_type         => @ght_type,
      :gtl_buttons      => @gtl_buttons,
      :gtl_type         => @gtl_type,
      :html             => @html,
      :lastaction       => @lastaction,
      :layout           => @layout,
      :miq_request      => @miq_request,
      :msg_title        => @msg_title,
      :perf_options     => @perf_options,
      :policy           => @policy,
      :record           => @record,
      :report           => @report,
      :report_result_id => @report_result_id,
      :request_tab      => @request_tab,
      :resolve          => @resolve,
      :sb               => @sb,
      :selected_zone    => @selected_zone,
      :settings         => @settings,
      :showtype         => @showtype,
      :tabform          => @tabform,
      :widget_running   => @widget_running,
      :widgetsets       => @widgetsets,
      :render_chart     => @render_chart,
    )
  end

  # Convert a field (Vm.hardware.disks-size) to a col (disks.size)
  def field_to_col(field)
    dbs, fld = field.split("-")
    (dbs.include?(".") ? "#{dbs.split(".").last}.#{fld}" : fld)
  end

  def controller_model_name(controller)
    ui_lookup(:model => (controller.camelize + "Controller").constantize.model.name)
  end

  def is_browser_ie?
    browser_info(:name) == "explorer"
  end

  def is_browser_ie7?
    is_browser_ie? && browser_info(:version).starts_with?("7")
  end

  def is_browser?(name)
    browser_name = browser_info(:name)
    name.kind_of?(Array) ? name.include?(browser_name) : (browser_name == name)
  end

  def is_browser_os?(os)
    browser_os = browser_info(:os)
    os.kind_of?(Array) ? os.include?(browser_os) : (browser_os == os)
  end

  def browser_info(typ)
    session.fetch_path(:browser, typ).to_s
  end

  ############# Following methods generate JS lines for render page blocks
  def javascript_for_timer_type(timer_type)
    case timer_type
    when "Monthly"
      [
        javascript_hide("weekly_span"),
        javascript_hide("daily_span"),
        javascript_hide("hourly_span"),
        javascript_show("monthly_span")
      ]
    when "Weekly"
      [
        javascript_hide("daily_span"),
        javascript_hide("hourly_span"),
        javascript_hide("monthly_span"),
        javascript_show("weekly_span")
      ]
    when "Daily"
      [
        javascript_hide("hourly_span"),
        javascript_hide("monthly_span"),
        javascript_hide("weekly_span"),
        javascript_show("daily_span")
      ]
    when "Hourly"
      [
        javascript_hide("daily_span"),
        javascript_hide("monthly_span"),
        javascript_hide("weekly_span"),
        javascript_show("hourly_span")
      ]
    when nil
      []
    else
      [
        javascript_hide("daily_span"),
        javascript_hide("hourly_span"),
        javascript_hide("monthly_span"),
        javascript_hide("weekly_span")
      ]
    end
  end

  # Show/hide the Save and Reset buttons based on whether changes have been made
  def javascript_for_miq_button_visibility(display, prefix = nil)
    if prefix
      "miqButtons('#{display ? 'show' : 'hide'}', '#{prefix}');".html_safe
    else
      "miqButtons('#{display ? 'show' : 'hide'}');".html_safe
    end
  end

  def javascript_for_miq_button_visibility_changed(changed)
    return "" if changed == session[:changed]
    session[:changed] = changed
    javascript_for_miq_button_visibility(changed)
  end

  # reload all toolbars
  def javascript_reload_toolbars
    "sendDataWithRx({redrawToolbar: #{toolbar_from_hash.to_json}});"
  end

  def set_edit_timer_from_schedule(schedule)
    @edit[:new][:timer] ||= ReportHelper::Timer.new
    if schedule.run_at.nil?
      t = Time.now.in_time_zone(@edit[:tz]) + 1.day # Default date/time to tomorrow in selected time zone
      @edit[:new][:timer].typ = 'Once'
      @edit[:new][:timer].start_date = "#{t.month}/#{t.day}/#{t.year}"
    else
      @edit[:new][:timer].update_from_miq_schedule(schedule.run_at, @edit[:tz])
    end
  end

  # Check if a parent chart has been selected and applies
  def perf_parent?
    @perf_options[:model] == "VmOrTemplate" &&
      @perf_options[:typ] != "realtime" &&
      VALID_PERF_PARENTS.keys.include?(@perf_options[:parent])
  end

  # Determine the type of report (performance/trend/chargeback) based on the model
  def model_report_type(model)
    if model
      if model.ends_with?("Performance", "MetricsRollup")
        return :performance
      elsif model == ApplicationController::TREND_MODEL
        return :trend
      elsif model.starts_with?("Chargeback")
        return model.downcase.to_sym
      end
    end
    nil
  end

  def show_taskbar_in_header?
    return false if @explorer
    return false if controller.action_name.end_with?("tagging_edit")

    hide_actions = %w(
      auth_error
      change_tab
      show
    )
    return false if @layout == "" && hide_actions.include?(controller.action_name)

    hide_layouts = %w(
      about
      chargeback
      container_dashboard
      ems_infra_dashboard
      exception
      miq_ae_automate_button
      miq_ae_class
      miq_ae_export
      miq_ae_tools
      miq_policy
      miq_policy_export
      miq_policy_rsop
      monitor_alerts_list
      monitor_alerts_most_recent
      monitor_alerts_overview
      ops
      pxe
      report
      rss
      server_build
    )
    return false if hide_layouts.include?(@layout)

    return false if @layout == "configuration" && @tabform != "ui_4"

    true
  end

  def taskbar_in_header?
    # this is just @show_taskbar ||= show_taskbar_in_header? .. but nil
    if @show_taskbar.nil?
      @show_taskbar = show_taskbar_in_header?
    else
      @show_taskbar
    end
  end

  # checking if any of the toolbar is visible
  def toolbars_visible?
    (@toolbars['history_tb'] || @toolbars['center_tb'] || @toolbars['view_tb']) &&
    (@toolbars['history_tb'] != 'blank_view_tb' && @toolbars['history_tb'] != 'blank_view_tb' && @toolbars['view_tb'] != 'blank_view_tb')
  end

  # Format a column in a report view for display on the screen
  def format_col_for_display(view, row, col, tz = nil)
    tz ||= ["miqschedule"].include?(view.db.downcase) ? MiqServer.my_server.server_timezone : Time.zone
    celltext = view.format(col,
                           row[col],
                           :tz => tz
                          ).gsub(/\\/, '\&')    # Call format, then escape any backslashes
    celltext
  end

  def check_if_button_is_implemented
    if !@flash_array && !@refresh_partial # if no button handler ran, show not implemented msg
      add_flash(_("Button not yet implemented"), :error)
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    elsif @flash_array && @lastaction == "show"
      @ems = @record = identify_record(params[:id])
      @refresh_partial = "layouts/flash_msg"
      @refresh_div = "flash_msg_div"
    end
  end

  # Return a blank tb if a placeholder is needed for AJAX explorer screens, return nil if no center toolbar to be shown
  def center_toolbar_filename
    _toolbar_chooser.center_toolbar_filename
  end

  def history_toolbar_filename
    _toolbar_chooser.history_toolbar_filename
  end

  def x_view_toolbar_filename
    _toolbar_chooser.x_view_toolbar_filename
  end

  def view_toolbar_filename
    _toolbar_chooser.view_toolbar_filename
  end

  def _toolbar_chooser
    ToolbarChooser.new(
      self,
      binding,
      :alert_profiles => @alert_profiles,
      :conditions     => @conditions,
      :dialog         => @dialog,
      :display        => @display,
      :explorer       => @explorer,
      :in_a_form      => @in_a_form,
      :lastaction     => @lastaction,
      :layout         => @layout,
      :nodetype       => @nodetype,
      :policies       => @policies,
      :record         => @record,
      :report         => @report,
      :sb             => @sb,
      :showtype       => @showtype,
      :tabform        => @tabform,
      :view           => @view,
      :center_toolbar => @center_toolbar
    )
  end

  # Calculate hash of toolbars to render
  #
  # keys are toolbar <div> names and values are toobar identifiers (now YAML files)
  #
  def calculate_toolbars
    toolbars = {}
    if inner_layout_present? # x_taskbar branch
      toolbars['history_tb'] = history_toolbar_filename
    elsif display_back_button? # taskbar branch
      toolbars['summary_center_tb'] = controller.restful? ? "summary_center_restful_tb" : "summary_center_tb"
    end

    # FIXME: singular vs plural for controller.class.toolbar_singular
    toolbars['center_tb'] = if controller.class.toolbar_plural.present? && params[:action] == 'show_list'
                              "#{controller.class.toolbar_plural}_center_tb"
                            elsif controller.class.toolbar_singular.present?
                              "#{controller.class.toolbar_singular}_center_tb"
                            elsif controller.try(:toolbar)
                              controller.toolbar.to_s
                            else
                              center_toolbar_filename
                            end
    toolbars['custom_tb'] = controller.custom_toolbar

    toolbars['view_tb'] = inner_layout_present? ? x_view_toolbar_filename : view_toolbar_filename
    toolbars
  end

  # check if back to summary button needs to be show
  def display_back_button?
    # don't need to back button if @record is not there or @record doesnt have name or
    # evm_display_name column, i.e MiqProvisionRequest
    return false if @display == "dashboard"

    if (@lastaction != "show" || (@lastaction == "show" && @display != "main")) &&
       @record &&
       (@record.respond_to?('name') && !@record.name.nil?)
      return true
    else
      return false
    end
  end

  def display_adv_search?
    %w(auth_key_pair_cloud
       availability_zone
       automation_manager
       cloud_network
       cloud_object_store_container
       cloud_object_store_object
       cloud_subnet
       cloud_tenant
       cloud_volume
       cloud_volume_backup
       cloud_volume_snapshot
       cloud_volume_type
       configuration_job
       configuration_scripts
       container
       container_build
       container_group
       container_image
       container_image_registry
       container_node
       container_project
       container_replicator
       container_route
       container_service
       container_template
       ems_cloud
       ems_cluster
       ems_container
       ems_infra
       ems_middleware
       ems_network
       ems_physical_infra
       ems_storage
       flavor
       floating_ip
       generic_object_definition
       host
       host_aggregate
       load_balancer
       middleware_deployment
       middleware_domain
       middleware_server
       miq_template
       network_port
       network_router
       offline
       orchestration_stack
       persistent_volume
       physical_server
       provider_foreman
       resource_pool
       retired
       security_group
       service
       services
       storage
       templates
       vm
      ).include?(@layout)
  end

  # Do we show or hide the clear_search link in the list view title
  def clear_search_status
    !!(@edit && @edit.fetch_path(:adv_search_applied, :text))
  end

  # Should we allow the user input checkbox be shown for an atom in the expression editor
  QS_VALID_USER_INPUT_OPERATORS = ["=", "!=", ">", ">=", "<", "<=", "INCLUDES", "STARTS WITH", "ENDS WITH", "CONTAINS"]
  QS_VALID_FIELD_TYPES = [:string, :boolean, :integer, :float, :percent, :bytes, :megabytes]
  def qs_show_user_input_checkbox?
    return true if @edit[:expression_method]
    return false unless @edit[:adv_search_open]  # Only allow user input for advanced searches
    return false unless QS_VALID_USER_INPUT_OPERATORS.include?(@edit[@expkey][:exp_key])
    val = (@edit[@expkey][:exp_typ] == "field" && # Field atoms with certain field types return true
           QS_VALID_FIELD_TYPES.include?(@edit[@expkey][:val1][:type])) ||
          (@edit[@expkey][:exp_typ] == "tag" && # Tag atoms with a tag category chosen return true
           @edit[@expkey][:exp_tag]) ||
          (@edit[@expkey][:exp_typ] == "count" && # Count atoms with a count col chosen return true
              @edit[@expkey][:exp_count])
    val
  end

  # Should we allow the field alias checkbox to be shown for an atom in the expression editor
  def adv_search_show_alias_checkbox?
    @edit[:adv_search_open]  # Only allow field aliases for advanced searches
  end

  def pressed2model_action(pressed)
    pressed =~ /^(ems_cluster|miq_template|infra_networking|automation_manager_provider|configuration_manager_provider)_(.*)$/ ? [$1, $2] : pressed.split('_', 2)
  end

  def model_for_ems(record)
    raise _("Record is not ExtManagementSystem class") unless record.kind_of?(ExtManagementSystem)
    if record.kind_of?(ManageIQ::Providers::CloudManager)
      ManageIQ::Providers::CloudManager
    elsif record.kind_of?(ManageIQ::Providers::ContainerManager)
      ManageIQ::Providers::ContainerManager
    else
      ManageIQ::Providers::InfraManager
    end
  end

  def model_for_vm(record)
    raise _("Record is not VmOrTemplate class") unless record.kind_of?(VmOrTemplate)
    if record.kind_of?(ManageIQ::Providers::CloudManager::Vm)
      ManageIQ::Providers::CloudManager::Vm
    elsif record.kind_of?(ManageIQ::Providers::InfraManager::Vm)
      ManageIQ::Providers::InfraManager::Vm
    elsif record.kind_of?(ManageIQ::Providers::CloudManager::Template)
      ManageIQ::Providers::CloudManager::Template
    elsif record.kind_of?(ManageIQ::Providers::InfraManager::Template)
      ManageIQ::Providers::InfraManager::Template
    end
  end

  def controller_for_vm(model)
    case model.to_s
    when "ManageIQ::Providers::CloudManager::Template", "ManageIQ::Providers::CloudManager::Vm"
      "vm_cloud"
    when "ManageIQ::Providers::InfraManager::Template", "ManageIQ::Providers::InfraManager::Vm"
      "vm_infra"
    else
      "vm_or_template"
    end
  end

  def controller_for_stack(model)
    case model.to_s
    when "ManageIQ::Providers::AnsibleTower::AutomationManager::Job"
      "configuration_job"
    else
      model.name.underscore
    end
  end

  def model_from_active_tree(tree)
    case tree
    when :automation_manager_cs_filter_tree
      "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem"
    when :configuration_manager_cs_filter_tree
      "ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem"
    when :configuration_manager_providers_tree
      "ManageIQ::Providers::Foreman::ConfigurationManager" if x_node.include?("fr")
      "ManageIQ::Providers::ConfigurationManager" if x_node == "root"
    when :instances_filter_tree
      "ManageIQ::Providers::CloudManager::Vm"
    when :images_filter_tree
      "ManageIQ::Providers::CloudManager::Template"
    when :svcs_tree
      "Service"
    when :vms_filter_tree
      "ManageIQ::Providers::InfraManager::Vm"
    when :templates_filter_tree
      "ManageIQ::Providers::InfraManager::Template"
    when :templates_images_filter_tree
      "MiqTemplate"
    when :vms_instances_filter_tree
      "Vm"
    end
  end

  def configuration_manager_scripts_tree(tree)
    case tree
    when :automation_manager_cs_filter_tree
      "ManageIQ::Providers::AnsibleTower::AutomationManager::ConfiguredSystem"
    when :configuration_manager_cs_filter_tree
      "ManageIQ::Providers::Foreman::ConfigurationManager::ConfiguredSystem"
    when :configuration_scripts_tree
      "ConfigurationScript"
    end
  end

  def object_types_for_flash_message(klass, record_ids)
    if klass == VmOrTemplate
      object_ary = klass.where(:id => record_ids).collect { |rec| ui_lookup(:model => model_for_vm(rec).to_s) }
      obj_hash = object_ary.each.with_object(Hash.new(0)) { |obj, h| h[obj] += 1 }
      obj_hash.collect { |k, v| v == 1 ? k : k.pluralize }.sort.to_sentence
    else
      object = ui_lookup(:model => klass.to_s)
      record_ids.length == 1 ? object : object.pluralize
    end
  end

  # FIXME: params[:type] is used in multiple contexts, we should rename it to
  # :gtl_type or remove it as we move to the Angular GTL component
  def pagination_or_gtl_request?
    %i(ppsetting searchtag entry sortby sort_choice type page).find { |k| params[k] }
  end

  def update_gtl_div(action_url = 'explorer', button_div = 'center_tb')
    render :update do |page|
      page << javascript_prologue
      page.replace("gtl_div",
                   :partial => "layouts/x_gtl",
                   :locals  => {:action_url => action_url, :button_div => button_div})
      page << "miqSparkle(false)"
    end
  end

  def perfmenu_click?
    return false unless params[:menu_click]
    perf_menu_click
    true
  end

  def javascript_process_redirect_args(args)
    # there's no model for ResourceController - defaulting to traditional routing
    begin
      model = self.class.model
    rescue => _err
      model = nil
    end
    if model && args.class == Hash && args[:action] == 'show' && restful_routed?(model)
      args.delete(:action)
      polymorphic_path_redirect(model, args)
    else
      args
    end
  end

  def javascript_redirect(args)
    render :update do |page|
      page << javascript_prologue
      page.redirect_to args
    end
  end

  def polymorphic_path_redirect(model, args)
    record = args[:record] ? args[:record] : model.find(args[:id] || params[:id])
    args.delete(:record)
    args.delete(:id)
    polymorphic_path(record, args)
  end

  def javascript_open_window(url)
    ex = ExplorerPresenter.open_window(url)
    ex.spinner_off
    render :json => ex.for_render
  end

  # this keeps the main_div wrapping tag, replaces only the inside
  def replace_main_div(args, options = {})
    ex = ExplorerPresenter.main_div.update('main_div', render_to_string(args))

    ex.replace("flash_msg_div", render_to_string(:partial => "layouts/flash_msg")) if options[:flash]
    ex.spinner_off if options[:spinner_off]

    render :json => ex.for_render
  end

  def javascript_miq_button_visibility(changed)
    render :json => ExplorerPresenter.buttons(changed).for_render
  end

  def record_no_longer_exists?(what, model = nil)
    return false unless what.nil?

    if !@bang || @flash_array.empty?
      # We already added a better flash message in 'identify_record'
      # in that case we keep that flash message
      # otherwise we make a new one.
      # FIXME: a refactoring of identify_record and related is needed
      add_flash(
        if model.present?
          _("%{model} no longer exists") % {:model => ui_lookup(:model => model)}
        else
          _("Error: Record no longer exists in the database")
        end,
        :error, true)
      session[:flash_msgs] = @flash_array
    end

    # Error message is displayed in 'show_list' action if such action exists
    # otherwise we assume that the 'explorer' action must exist that will display it.
    redirect_to(:action => respond_to?(:show_list) ? 'show_list' : 'explorer')
  end

  def pdf_page_size_style
    "#{@options[:page_size].sub(/^US-/i, '') || "legal"} #{@options[:page_layout]}"
  end

  GTL_VIEW_LAYOUTS = %w(action
                        auth_key_pair_cloud
                        availability_zone
                        alerts_overview
                        alerts_list
                        alerts_most_recent
                        cloud_network
                        cloud_object_store_container
                        cloud_object_store_object
                        cloud_subnet
                        cloud_tenant
                        cloud_topology
                        cloud_volume
                        cloud_volume_backup
                        cloud_volume_snapshot
                        cloud_volume_type
                        condition
                        configuration_job
                        configuration_script_source
                        container
                        container_build
                        container_dashboard
                        container_group
                        container_image
                        container_image_registry
                        container_node
                        container_project
                        container_replicator
                        container_route
                        container_service
                        container_template
                        container_topology
                        ems_block_storage
                        ems_cloud
                        ems_cluster
                        ems_container
                        ems_infra
                        ems_infra_dashboard
                        ems_middleware
                        ems_network
                        ems_object_storage
                        ems_physical_infra
                        ems_storage
                        infra_topology
                        event
                        flavor
                        floating_ip
                        generic_object
                        generic_object_definition
                        guest_device
                        host
                        host_aggregate
                        load_balancer
                        manageiq/providers/embedded_ansible/automation_manager/playbook
                        manageiq/providers/embedded_automation_manager/authentication
                        manageiq/providers/embedded_automation_manager/configuration_script_source
                        middleware_deployment
                        middleware_domain
                        middleware_server
                        middleware_server_group
                        miq_schedule
                        miq_template
                        monitor_alerts_overview
                        monitor_alerts_list
                        monitor_alerts_most_recent
                        network_port
                        network_router
                        network_topology
                        offline
                        orchestration_stack
                        physical_infra_topology
                        physical_rack
                        physical_chassis
                        physical_switch
                        physical_storage
                        physical_server
                        persistent_volume
                        policy
                        policy_group
                        policy_profile
                        resource_pool
                        retired
                        scan_profile
                        security_group
                        services
                        storage
                        templates
                      )

  def render_gtl_view_tb?
    GTL_VIEW_LAYOUTS.include?(@layout) && @gtl_type && !@tagitems &&
      !@ownershipitems && !@retireitems && !@politems && !@in_a_form &&
      %w(show show_list).include?(params[:action]) && @display != "custom_button_events"
  end

  def update_paging_url_parms(action_url, parameter_to_update = {}, post = false)
    url = update_query_string_params(parameter_to_update)
    action, an_id = action_url.split("/", 2)
    if !post && controller.restful? && action == 'show'
      polymorphic_path(@record, url)
    else
      url[:action] = action
      url[:id] = an_id unless an_id.nil?
      url_for_only_path(url)
    end
  end

  def update_query_string_params(update_this_param)
    exclude_params = %w(button flash_msg page ppsetting pressed sortby sort_choice type)
    query_string = Rack::Utils.parse_query URI("?#{request.query_string}").query
    updated_query_string = query_string.symbolize_keys
    updated_query_string.delete_if { |k, _v| exclude_params.include? k.to_s }
    updated_query_string.merge!(update_this_param)
  end

  def placeholder_if_present(password)
    password.present? ? "\u25cf" * 8 : ''
  end

  def title_for_host_record(record)
    record.openstack_host? ? _("Node") : _("Host")
    record.telefonica_host? ? _("Node") : _("Host")
  end

  def title_for_cluster_record(record)
    record.openstack_cluster? ? _("Deployment Role") : _("Cluster")
    record.telefonica_cluster? ? _("Deployment Role") : _("Cluster")
  end

  def miq_tab_header(id, active = nil, options = {}, &_block)
    tag_options = {:class => "#{options[:class]} #{active == id ? 'active' : ''}",
                   :id    => "#{id}_tab"}.merge!(options)

    content_tag(:li, tag_options) do
      content_tag(:a, :href => "##{id}", 'data-toggle' => 'tab') do
        yield
      end
    end
  end

  def miq_tab_content(id, active = nil, options = {}, &_block)
    lazy = options[:lazy] && active != id

    classname = %w(tab-pane)
    classname << options[:class] if options[:class]
    classname << 'active' if active == id
    classname << 'lazy' if lazy

    options.delete(:lazy)
    options.delete(:class)

    content_tag(:div, :id => id, :class => classname.join(' '), **options) do
      yield unless lazy
    end
  end

  def tree_with_advanced_search?
    %i(automation_manager_providers
       automation_manager_cs_filter
       configuration_manager_cs_filter
       configuration_scripts
       configuration_manager_providers
       images
       images_filter
       instances
       instances_filter
       providers
       storage
       svcs
       templates_filter
       templates_images_filter
       vandt
       vms_filter
       vms_instances_filter
      ).include?(x_tree[:type])
  end

  def fonticon_or_fileicon(item)
    return nil unless item
    decorated = item.decorate
    [
      decorated.try(:fonticon),
      decorated.try(:secondary_icon),
      decorated.try(:fileicon)
    ]
  end
  private :fonticon_or_fileicon

  CONTENT_TYPE_ID = {
    "report" => "r",
    "menu"   => "m",
    "rss"    => "rf",
    "chart"  => "c"
  }.freeze

  LIST_ICON_FOR = %w(
    MiqReportResult
    MiqSchedule
    MiqUserRole
    MiqWidget
  ).freeze

  def process_show_list_options(options, curr_model = nil)
    @report_data_additional_options = ApplicationController::ReportDataAdditionalOptions.from_options(options)
    @report_data_additional_options.with_quadicon_options(
      :embedded   => @embedded,
      :showlinks  => @showlinks,
      :policy_sim => @policy_sim,
      :lastaction => @lastaction,
      :in_a_form  => @in_a_form,
      :display    => @display
    )
    @report_data_additional_options.with_row_button(@row_button) if @row_button
    @report_data_additional_options.with_menu_click(params[:menu_click]) if params[:menu_click]
    @report_data_additional_options.with_sb_controller(params[:sb_controller]) if params[:sb_controller]
    @report_data_additional_options.with_model(curr_model) if curr_model
    @report_data_additional_options.with_no_checkboxes(@no_checkboxes) if @no_checkboxes
    # FIXME: we would like to freeze here, but the @gtl_type is calculated no sooner than in view templates.
    # So until that if fixed we cannot freeze.
    # @report_data_additional_options.freeze
  end

  def from_additional_options(additional_options)
    if additional_options[:match_via_descendants].present?
      additional_options[:match_via_descendants] = additional_options[:match_via_descendants].constantize
    end
    if additional_options[:parent_id].present? && additional_options[:parent_class_name].present?
      parent_id = additional_options[:parent_id]
      parent_class = additional_options[:parent_class_name].constantize
      additional_options[:parent] = parent_class.find(parent_id) if parent_class < ActiveRecord::Base
    end

    @row_button = additional_options[:row_button]
    @no_checkboxes = additional_options[:no_checkboxes]

    additional_options
  end

  # Restore instance variables necessary for proper rendering of quadicons.
  # This is a temporary solution that is ot be replaced by proper
  # parametrization of an ancessor class of QuadiconHelper.
  def restore_quadicon_options(quadicon_options)
    @embedded = quadicon_options[:embedded]
    @showlinks = quadicon_options[:showlinks]
    @policy_sim = quadicon_options[:policy_sim]
    # @explorer
    # @view.db
    # @parent
    @lastaction = quadicon_options[:lastaction]

    # we also need to pass the @display because @display passed throught the
    # session does not persist the null value
    @display = quadicon_options[:display]

    # need to pass @in_a_form so get_view does not set advanced search options
    # in the forms that render gtl that mess up @edit
    @in_a_form = quadicon_options[:in_a_form]

    # take GTL type from the component
    @gtl_type = quadicon_options[:gtl_type]
  end

  # Wrapper around jquery-rjs' remote_function which adds an extra .html_safe()
  # Remove if merged: https://github.com/amatsuda/jquery-rjs/pull/3
  def remote_function(options)
    super(options).to_str
  end

  def appliance_name
    MiqServer.my_server.name
  end

  def vmdb_build_info(key)
    case key
    when :version then Vmdb::Appliance.VERSION
    when :build then Vmdb::Appliance.BUILD
    end
  end

  def plugin_name(engine)
    engine.respond_to?(:plugin_name) ? engine.plugin_name : engine.to_s.gsub(/ManageIQ::|::Engine/, '')
  end

  def vmdb_plugins_sha
    Vmdb::Plugins.versions
  end

  def user_role_name
    User.current_user.miq_user_role_name
  end

  def rbac_common_feature_for_buttons(pressed)
    # return feature that should be checked for the button that came in
    case pressed
    when "rbac_project_add", "rbac_tenant_add"
      "rbac_tenant_add"
    else
      pressed
    end
  end

  def action_url_for_views
    if @lastaction == "scan_history"
      "scan_history"
    elsif %w(all_jobs jobs ui_jobs all_ui_jobs).include?(@lastaction)
      "jobs"
    else
      @lastaction && @lastaction != "get_node_info" ? @lastaction : "show_list"
    end
  end

  def route_exists?(hash)
    begin
      url_for_only_path(hash)
    rescue
      return false
    end
    true
  end

  def translate_header_text(text)
    if text == "Region"
      Vmdb::Appliance.PRODUCT_NAME + " " + _(text)
    else
     _(text)
    end
  end

  def parse_nodetype_and_id(x_node)
    x_node.split('_').last.split('-')
  end

  def r
    @r ||= proc { |opts| render_to_string(opts) }
  end

  # Test if just succesfully deleted an entity that was being displayed
  def single_delete_test(any_button = false)
    @flash_array.present? && @single_delete &&
      (any_button || params[:pressed] == "#{table_name}_delete")
  end

  # redirect to show_list (after succesfully deleted the entity being displayed)
  def single_delete_redirect
    javascript_redirect :action      => 'show_list',
                        :flash_msg   => @flash_array[0][:message],
                        :flash_error => @flash_array[0][:level] == :error
  end

  def accessible_select_event_types
    ApplicationController::Timelines::SELECT_EVENT_TYPE.map {|key, value| [_(key), value]}
  end

  def unique_html_id(prefix = 'unknown')
    "#{prefix}-#{rand(36**8).to_s(36)}"
  end
end
