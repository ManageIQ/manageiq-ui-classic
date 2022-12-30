class SecurityGroupController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[instances network_ports network_routers cloud_subnets security_policy_rules_as_source security_policy_rules_as_destination custom_button_events]
  end

  menu_section :net
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  def display_security_policy_rules_as_source
    nested_list(SecurityPolicyRule, :association => :security_policy_rules_as_source, :breadcrumb_title => _("Source of Security Policy Rules"))
  end

  def display_security_policy_rules_as_destination
    nested_list(SecurityPolicyRule, :association => :security_policy_rules_as_destination, :breadcrumb_title => _("Destination of Security Policy Rules"))
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[vms instances images].include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    @refresh_div = "main_div"

    case params[:pressed]
    when "security_group_delete"
      delete_security_groups
    when "security_group_edit"
      javascript_redirect(:action => "edit", :id => checked_item_id(params))
    when 'security_group_new'
      javascript_redirect(:action => "new")
    else
      super
    end
  end

  def create
    assert_privileges("security_group_new")
    case params[:button]
    when "cancel"
      javascript_redirect(:action    => 'show_list',
                          :flash_msg => _('Add of new Security Group was cancelled by the user'))
    when "add"
      @security_group = SecurityGroup.new
      options = form_params
      ems = ExtManagementSystem.find(options[:ems_id])
      if SecurityGroup.class_by_ems(ems)&.supports?(:create)
        options.delete(:ems_id)
        task_id = ems.create_security_group_queue(session[:userid], options)

        add_flash(_("Security Group creation: Task start failed"), :error) unless task_id.kind_of?(Integer)

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
        end
      else
        @in_a_form = true
        add_flash(_(SecurityGroup.unsupported_reason(:create)), :error)
        drop_breadcrumb(:name => _("Add New Security Group "), :url => "/security_group/new")
        javascript_flash
      end
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    security_group_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      flash_and_redirect(_("Security Group \"%{name}\" created") % {:name => security_group_name})
    else
      flash_and_redirect(_("Unable to create Security Group \"%{name}\": %{details}") % {
        :name    => security_group_name,
        :details => task.message
      }, :error)
    end
  end

  def delete_security_groups
    assert_privileges("security_group_delete")
    security_groups = find_records_with_rbac(SecurityGroup, checked_or_params)
    if security_groups.empty?
      add_flash(_("No Security Group were selected for deletion."), :error)
    end

    security_groups_to_delete = []
    security_groups.each do |security_group|
      if security_group.supports?(:delete)
        security_groups_to_delete.push(security_group)
      else
        add_flash(_("Couldn't initiate deletion of Security Group \"%{name}\": %{details}") % {
          :name    => security_group.name,
          :details => security_group.unsupported_reason(:delete)
        }, :error)
      end
    end
    process_security_groups(security_groups_to_delete, "destroy") unless security_groups_to_delete.empty?

    flash_to_session
    # refresh the list if applicable
    if @lastaction == "show" && @layout == "security_group" # Textual Summary of Security Group
      @single_delete = true unless flash_errors?
      javascript_redirect(previous_breadcrumb_url)
    else # list of Security Groups - we probably don't need this because deleting is actually not available from the list
      @refresh_partial = "layouts/gtl" if @lastaction == "show_list"
      javascript_redirect(last_screen_url)
    end
  end

  def edit
    assert_privileges("security_group_edit")
    @security_group = find_record_with_rbac(SecurityGroup, params[:id])
    @in_a_form = true
    drop_breadcrumb(:name => _("Edit Security Group \"%{name}\"") % { :name => @security_group.name},
                    :url  => "/security_group/edit/#{@security_group.id}")
  end

  def new
    assert_privileges("security_group_new")
    @security_group = SecurityGroup.new
    @in_a_form = true
    drop_breadcrumb(:name => _("Add New Security Group"), :url => "/security_group/new")
  end

  def update
    assert_privileges("security_group_edit")
    @security_group = find_record_with_rbac(SecurityGroup, params[:id])

    case params[:button]
    when "cancel"
      flash_and_redirect(_("Edit of Security Group \"%{name}\" was cancelled by the user") % {
        :name => @security_group.name
      })

    when "save"
      if @security_group.supports?(:update)
        @tasks = []
        sg_params = form_params

        if sg_changed?(sg_params)
          task_id = @security_group.update_security_group_queue(session[:userid], sg_params)
          if task_started(task_id, "Security Group Update")
            @tasks << {:id => task_id, :resource => "Security Group #{@security_group.name}", :action => :update}
          end
        end

        params["firewall_rules"].each do |_key, rule|
          if rule["id"] && rule["id"].empty?
            create_rule(rule)
          elsif rule["deleted"]
            delete_rule(rule["ems_ref"])
          elsif rule_changed?(rule)
            delete_rule(rule["ems_ref"])
            create_rule(rule)
          end
        end
        task = @tasks.shift
        session[:security_group] = {:tasks => @tasks}
        session[:security_group][:task] = task
        initiate_wait_for_task(:task_id => task[:id], :action => "update_finished")
      else
        add_flash(_("Couldn't initiate update of Security Group \"%{name}\": %{details}") % {
          :name    => @security_group.name,
          :details => @security_group.unsupported_reason(:delete)
        }, :error)
      end
    end
  end

  def update_finished
    security_group_id = session[:async][:params][:id]

    td = session[:security_group][:task]
    task = MiqTask.find(td[:id])
    if MiqTask.status_ok?(task.status)
      add_flash("#{td[:resource]} #{td[:action]}d")
    else
      add_flash(_("Unable to %{action} %{resource}: %{details}") % {
        :action   => td[:action],
        :resource => td[:resource],
        :details  => task.message
      }, :error)
    end

    flash_to_session
    if !session[:security_group][:tasks].empty?
      task = session[:security_group][:tasks].shift
      session[:security_group][:task] = task
      initiate_wait_for_task(:task_id => task[:id], :action => "update_finished")
    else
      @breadcrumbs.pop if @breadcrumbs
      session[:edit] = nil
      javascript_redirect(:action => "show", :id => security_group_id)
    end
  end

  def download_data
    assert_privileges('security_group_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('security_group_show')
    super
  end

  private

  def create_rule(rule)
    rule_data = @security_group.class.parse_security_group_rule(rule)
    task_id = @security_group.create_security_group_rule_queue(session[:userid], @security_group.ems_ref,
                                                               rule["direction"], rule_data)
    if task_started(task_id, "Security Group Rule Create")
      @tasks << {:id => task_id, :resource => "Security Group #{@security_group.name} Update: Rule", :action => :create}
    end
  end

  def delete_rule(id)
    task_id = @security_group.delete_security_group_rule_queue(session[:userid], id)
    if task_started(task_id, "Security Group Rule Delete")
      @tasks << {:id => task_id, :resource => "Security Group #{@security_group.name} Update: Rule", :action => :delete}
    end
  end

  def rule_changed?(params)
    sg_rule = @security_group.firewall_rules.find(params["id"])
    return true if changed?(params["direction"], sg_rule.direction)
    return true if changed?(params["end_port"], sg_rule.end_port)
    return true if changed?(params["host_protocol"], sg_rule.host_protocol)
    return true if changed?(params["network_protocol"], sg_rule.network_protocol)
    return true if changed?(params["port"], sg_rule.port)
    return true if changed?(params["source_ip_range"], sg_rule.source_ip_range)
    return true if changed?(params["source_security_group_id"], sg_rule.source_security_group_id)
  end

  def changed?(param, field)
    param.present? && field != param
  end

  def sg_changed?(params)
    return true if params[:name] && @security_group.name != params[:name]
    return true if params[:description] && @security_group.description != params[:description]
  end

  def task_started(task_id, message)
    unless task_id.kind_of?(Integer)
      add_flash(_("%{message}: Task start failed") % {:message => message}, :error)
      return nil
    end
    true
  end

  def textual_group_list
    [%i[properties relationships], %i[firewall security_policy_rules tags]]
  end
  helper_method :textual_group_list

  def form_params
    options = {}
    options[:name] = params[:name] if params[:name]
    options[:description] = params[:description] if params[:description]
    options[:ems_id] = params[:ems_id] if params[:ems_id]
    options[:cloud_tenant] = find_record_with_rbac(CloudTenant, params[:cloud_tenant_id]) if params[:cloud_tenant_id]
    options
  end

  # dispatches operations to multiple security_groups
  def process_security_groups(security_groups, operation)
    return if security_groups.empty?

    if operation == "destroy"
      security_groups.each do |security_group|
        audit = {
          :event        => "security_group_record_delete_initiated",
          :message      => "[#{security_group.name}] Record delete initiated",
          :target_id    => security_group.id,
          :target_class => "SecurityGroup",
          :userid       => session[:userid]
        }
        AuditEvent.success(audit)
        security_group.delete_security_group_queue(session[:userid])
      end
      add_flash(n_("Delete initiated for %{number} Security Group.",
                   "Delete initiated for %{number} Security Groups.",
                   security_groups.length) % {:number => security_groups.length})
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        breadcrumbs_menu_section,
        {:title => _("Security Groups"), :url => controller_url},
      ],
    }
  end

  has_custom_buttons
end
