class CloudSubnetController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericFormMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[instances cloud_subnets network_ports security_groups custom_button_events]
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[vms instances images].include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    @refresh_div = "main_div"

    case params[:pressed]
    when 'cloud_subnet_delete'
      delete_subnets
    when "cloud_subnet_edit"
      javascript_redirect(:action => "edit", :id => checked_item_id)
    when "cloud_subnet_new"
      javascript_redirect(:action => "new")
    else
      super
    end
  end

  def new
    assert_privileges("cloud_subnet_new")
    assert_privileges("ems_network_show_list")
    assert_privileges("cloud_tenant_show_list")
    assert_privileges("cloud_network_show_list")

    @in_a_form = true
    drop_breadcrumb(:name => _("Add New Subnet"), :url => "/cloud_subnet/new")
  end

  def create
    assert_privileges("cloud_subnet_new")
    case params[:button]
    when "cancel"
      javascript_redirect(:action    => 'show_list',
                          :flash_msg => _("Creation of a Cloud Subnet was cancelled by the user"))

    when "add"
      @subnet = CloudSubnet.new
      begin
        options = new_form_params
        ems = ExtManagementSystem.find(options[:ems_id])
        if CloudSubnet.class_by_ems(ems).supports_create?
          options.delete(:ems_id)
          task_id = ems.create_cloud_subnet_queue(session[:userid], options)

          if task_id.kind_of?(Integer)
            initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
          else
            javascript_flash(
              :text        => _("Cloud Subnet creation: Task start failed"),
              :severity    => :error,
              :spinner_off => true
            )
          end
        else
          @in_a_form = true
          add_flash(_(CloudSubnet.unsupported_reason(:create)), :error)
          drop_breadcrumb(:name => _("Add new Cloud Subnet "), :url => "/subnet/new")
          javascript_flash
        end
      rescue ArgumentError => err
        javascript_flash(
          :text        => _("Parameter Error: %{error_message}") % {:error_message => err.message},
          :severity    => :error,
          :spinner_off => true
        )
      end
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    subnet_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Cloud Subnet \"%{name}\" created") % {:name => subnet_name})
    else
      add_flash(_("Unable to create Cloud Subnet: %{details}") %
                { :name => subnet_name, :details => task.message }, :error)
    end

    @breadcrumbs&.pop
    session[:edit] = nil
    flash_to_session
    javascript_redirect(:action => "show_list")
  end

  def delete_subnets
    assert_privileges("cloud_subnet_delete")
    subnets = find_records_with_rbac(CloudSubnet, checked_or_params)

    subnets_to_delete = []
    subnets.each do |subnet|
      if subnet.nil?
        add_flash(_("Cloud Subnet no longer exists."), :error)
      elsif subnet.supports_delete?
        subnets_to_delete.push(subnet)
      end
    end
    unless subnets_to_delete.empty?
      process_cloud_subnets(subnets_to_delete, "destroy")
    end

    # refresh the list if applicable
    if @lastaction == "show_list"
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "cloud_subnet"
      @single_delete = true unless flash_errors?
      if @flash_array.nil?
        add_flash(_("The selected Cloud Subnet was deleted"))
      end
      flash_to_session
      javascript_redirect(:action => 'show_list')
    else
      drop_breadcrumb(:name => 'dummy', :url => " ") # missing a bc to get correctly back so here's a dummy
      flash_to_session
      redirect_to(previous_breadcrumb_url)
    end
  end

  def edit
    params[:id] = checked_item_id if params[:id].blank?
    assert_privileges("cloud_subnet_edit")
    @subnet = find_record_with_rbac(CloudSubnet, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit Subnet \"%{name}\"") % {:name => @subnet.name},
      :url  => "/cloud_subnet/edit/#{@subnet.id}"
    )
  end

  def update
    assert_privileges("cloud_subnet_edit")
    @subnet = find_record_with_rbac(CloudSubnet, params[:id])
    case params[:button]
    when "cancel"
      cancel_action(_("Edit of Subnet \"%{name}\" was cancelled by the user") % {:name => @subnet.name})

    when "save"
      if @subnet.supports_create?
        begin
          options = changed_form_params
          task_id = @subnet.update_cloud_subnet_queue(session[:userid], options)

          if task_id.kind_of?(Integer)
            initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
          else
            javascript_flash(
              :text        => _("Cloud Subnet update failed: Task start failed"),
              :severity    => :error,
              :spinner_off => true
            )
          end
        rescue ArgumentError => err
          javascript_flash(
            :text        => _("Parameter Error: %{error_message}") % {:error_message => err.message},
            :severity    => :error,
            :spinner_off => true
          )
        end
      else
        add_flash(_("Couldn't initiate update of Cloud Subnet \"%{name}\": %{details}") % {
          :name    => @subnet.name,
          :details => @subnet.unsupported_reason(:update)
        }, :error)
      end
    end
  end

  def update_finished
    task_id = session[:async][:params][:task_id]
    subnet_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Cloud Subnet \"%{name}\" updated") % {:name => subnet_name })
    else
      add_flash(_("Unable to update Cloud Subnet \"%{name}\": %{details}") % {:name    => subnet_name,
                                                                              :details => task.message}, :error)
    end

    session[:edit] = nil
    flash_to_session
    javascript_redirect(previous_breadcrumb_url)
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def switch_to_bol(option)
    if option && option =~ /on|true/i
      true
    else
      false
    end
  end

  def parse_allocation_pools(option)
    return [] unless option

    option.lines.map do |pool|
      start_addr, end_addr, extra_entry = pool.split(",")
      raise ArgumentError, _("Too few addresses in line. Proper format is start_ip_address,end_ip_address (one Allocation Pool per line)") unless end_addr
      raise ArgumentError, _("Too many addresses in line. Proper format is start_ip_address,end_ip_address (one Allocation Pool per line)") if extra_entry

      {"start" => start_addr.strip, "end" => end_addr.strip}
    end
  end

  def parse_host_routes(option)
    return [] unless option

    option.lines.map do |route|
      dest_addr, nexthop_addr, extra_entry = route.split(",")
      raise ArgumentError, _("Too few entries in line. Proper format is destination_cidr,nexthop (one Host Route per line)") unless nexthop_addr
      raise ArgumentError, _("Too many entries in line. Proper format is destination_cidr,nexthop (one Host Route per line)") if extra_entry

      {"destination" => dest_addr.strip, "nexthop" => nexthop_addr.strip}
    end
  end

  def parse_dns_nameservers(option)
    return [] unless option

    option.lines.map do |nameserver|
      one_nameserver, extra_entry = nameserver.strip.split(/\s+|,/)
      raise ArgumentError, _("One DNS Name Server per line is required.") if !one_nameserver || extra_entry

      one_nameserver
    end
  end

  def changed_form_params
    # Allowed fields for update: name, enable_dhcp, dns_nameservers, allocation_pools, host_routes, gateway_ip
    options = {}
    options[:name] = params[:name] unless @subnet.name == params[:name]

    # Provider to automatically assign gateway address unless provided
    unless @subnet.gateway == params[:gateway]
      options[:gateway_ip] = params[:gateway].presence
    end

    unless @subnet.dhcp_enabled == switch_to_bol(params[:dhcp_enabled])
      options[:enable_dhcp] = switch_to_bol(params[:dhcp_enabled])
    end
    unless @subnet.allocation_pools == (pools = parse_allocation_pools(params[:allocation_pools])) || (@subnet.allocation_pools.blank? && pools.blank?)
      options[:allocation_pools] = pools
    end
    unless @subnet.host_routes == (routes = parse_host_routes(params[:host_routes])) || (@subnet.host_routes.blank? && routes.blank?)
      options[:host_routes] = routes
    end
    unless @subnet.dns_nameservers == (nameservers = parse_dns_nameservers(params[:dns_nameservers])) || (@subnet.dns_nameservers.blank? && nameservers.blank?)
      options[:dns_nameservers] = nameservers
    end
    options
  end

  def new_form_params
    params[:network_protocol] ||= "ipv4"
    params[:dhcp_enabled] ||= false
    options = {}
    copy_params_if_present(options, params, %i[name ems_id cidr network_id availability_zone_id ipv6_router_advertisement_mode ipv6_address_mode network_group_id parent_cloud_subnet_id])
    # Provider to automatically assign gateway address unless provided
    if params[:gateway]
      options[:gateway_ip] = params[:gateway].presence
    end
    options[:ip_version] = /4/.match?(params[:network_protocol]) ? 4 : 6
    options[:cloud_tenant] = find_record_with_rbac(CloudTenant, params[:cloud_tenant][:id]) if params.fetch_path(:cloud_tenant, :id)
    options[:enable_dhcp] = params[:dhcp_enabled]
    # TODO: Add dns_nameservers, allocation_pools, host_routes
    options[:allocation_pools] = parse_allocation_pools(params[:allocation_pools]) if params[:allocation_pools].present?
    options[:dns_nameservers] = parse_dns_nameservers(params[:dns_nameservers]) if params[:dns_nameservers].present?
    options[:host_routes] = parse_host_routes(params[:host_routes]) if params[:host_routes].present?
    options
  end

  # dispatches operations to multiple subnets
  def process_cloud_subnets(subnets, operation)
    return if subnets.empty?

    if operation == "destroy"
      subnets.each do |subnet|
        audit = {
          :event        => "cloud_subnet_record_delete_initiated",
          :message      => "[#{subnet.name}] Record delete initiated",
          :target_id    => subnet.id,
          :target_class => "CloudSubnet",
          :userid       => session[:userid]
        }
        AuditEvent.success(audit)
        subnet.delete_cloud_subnet_queue(session[:userid])
      end
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Networks")},
        {:title => _("Subnets"), :url => controller_url},
      ],
    }
  end

  menu_section :net

  has_custom_buttons
end
