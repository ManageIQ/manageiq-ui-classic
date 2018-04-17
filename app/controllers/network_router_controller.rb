class NetworkRouterController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericFormMixin

  def self.display_methods
    %w(instances cloud_subnets)
  end

  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w(vms instances images).include?(@display)
    params[:page] = @current_page unless @current_page.nil? # Save current page for list refresh

    @refresh_div = "main_div"

    case params[:pressed]
    when "cloud_subnet_tag"
      return tag("CloudSubnet")
    when "custom_button"
      custom_buttons
    when "instance_tag"
      return tag("VmOrTemplate")
    when "network_router_add_interface"
      javascript_redirect(:action => "add_interface_select", :id => checked_item_id)
    when "network_router_delete"
      delete_network_routers
    when "network_router_edit"
      javascript_redirect(:action => "edit", :id => checked_item_id)
    when "network_router_new"
      javascript_redirect(:action => "new")
    when "network_router_remove_interface"
      javascript_redirect(:action => "remove_interface_select", :id => checked_item_id)
    when "network_router_tag"
      return tag("NetworkRouter")
    else
      render_flash
    end
  end

  def network_router_form_fields
    assert_privileges("network_router_edit")
    router = find_record_with_rbac(NetworkRouter, params[:id])
    available_networks = get_networks_by_ems(router.ems_id)
    network_id = nil
    subnet_id = nil
    external_gateway = false
    enable_snat = true
    available_subnets = {}

    unless router.external_gateway_info.nil? || router.external_gateway_info.empty?
      external_gateway = true
      cloud_network_ref = router.external_gateway_info["network_id"]
      enable_snat = router.external_gateway_info["enable_snat"]
      network = CloudNetwork.where(:ems_ref => cloud_network_ref).first
      network_id = network.id
      available_subnets = get_subnets_by_network(network_id)
      external_fixed_ips = router.external_gateway_info["external_fixed_ips"]
      unless external_fixed_ips.nil? || external_fixed_ips.empty?
        # TODO: Replace with array/table
        subnet = CloudSubnet.where(:ems_ref => external_fixed_ips[0]["subnet_id"]).first
        subnet_id = subnet.id
      end
    end

    render :json => {
      :name               => router.name,
      :ems_id             => router.ems_id,
      :cloud_network_id   => network_id,
      :cloud_subnet_id    => subnet_id,
      :external_gateway   => external_gateway,
      :enable_snat        => enable_snat,
      :available_networks => available_networks,
      :available_subnets  => available_subnets
    }
  end

  def network_router_networks_by_ems
    assert_privileges("network_router_new")
    render :json => {
      :available_networks => get_networks_by_ems(params[:id])
    }
  end

  def network_router_subnets_by_network
    assert_privileges("network_router_new")
    render :json => {
      :available_subnets => get_subnets_by_network(params[:id])
    }
  end

  def new
    @router = NetworkRouter.new
    assert_privileges("network_router_new")
    assert_privileges("ems_network_show_list")
    assert_privileges("cloud_tenant_show_list")

    @in_a_form = true
    drop_breadcrumb(
      :name => _("Add New Network Router"),
      :url  => "/network_router/new"
    )
  end

  def create
    assert_privileges("network_router_new")
    case params[:button]
    when "cancel"
      javascript_redirect :action    => 'show_list',
                          :flash_msg => _("Add of new Network Router was cancelled by the user")

    when "add"
      @router = NetworkRouter.new
      options = form_params(params)
      options.merge!(form_external_gateway(params)) if switch_to_bool(params[:external_gateway])
      ems = ExtManagementSystem.find(options[:ems_id])
      options.delete(:ems_id)
      task_id = ems.create_network_router_queue(session[:userid], options)

      add_flash(_("Network Router creation failed: Task start failed: ID [%{id}]") %
                {:id => task_id.to_s}, :error) unless task_id.kind_of?(Integer)

      if @flash_array
        javascript_flash(:spinner_off => true)
      else
        initiate_wait_for_task(:task_id => task_id, :action => "create_finished")
      end
    end
  end

  def create_finished
    task_id = session[:async][:params][:task_id]
    router_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Network Router \"%{name}\" created") % {:name => router_name})
    else
      add_flash(_("Unable to create Network Router \"%{name}\": %{details}") %
                {:name => router_name, :details => task.message}, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    flash_to_session
    javascript_redirect :action => "show_list"
  end

  def delete_network_routers
    assert_privileges("network_router_delete")

    routers = if @lastaction == "show_list" ||
                 (@lastaction == "show" && @layout != "network_router") ||
                 @lastaction.nil?
                find_checked_ids_with_rbac(NetworkRouter)
              else
                [find_id_with_rbac(NetworkRouter, params[:id])]
              end

    add_flash(_("No routers were selected for deletion."), :error) if routers.empty?

    routers_to_delete = []
    routers.each do |s|
      router = NetworkRouter.find_by(:id => s)
      if router.nil?
        add_flash(_("Router no longer exists."), :error)
      elsif !router.supports?(:delete)
        add_flash(_(router.unsupported_reason(:delete)), :error)
      else
        routers_to_delete.push(router)
      end
    end
    process_network_routers(routers_to_delete, "destroy") unless routers_to_delete.empty?

    # refresh the list if applicable
    if @lastaction == "show_list" && @breadcrumbs.last[:url].include?(@lastaction)
      show_list
      @refresh_partial = "layouts/gtl"
    elsif @lastaction == "show" && @layout == "network_router"
      @single_delete = true unless flash_errors?
      add_flash(_("The selected Router was deleted")) if @flash_array.nil?
    else
      drop_breadcrumb(:name => 'dummy', :url => " ") # missing a bc to get correctly back so here's a dummy
      flash_to_session
      redirect_to(previous_breadcrumb_url)
    end
  end

  def edit
    params[:id] = checked_item_id unless params[:id].present?
    assert_privileges("network_router_edit")
    @router = find_record_with_rbac(NetworkRouter, params[:id])
    @in_a_form = true
    # needs to be initializes for haml
    drop_breadcrumb(
      :name => _("Edit Router \"%{name}\"") % {:name => @router.name},
      :url  => "/network_router/edit/#{@router.id}"
    )
  end

  def update
    assert_privileges("network_router_edit")
    @router = find_record_with_rbac(NetworkRouter, params[:id])
    options = form_params(params)
    if switch_to_bool(params[:external_gateway])
      options.merge!(form_external_gateway(params))
    else
      options.merge!(form_external_gateway({}))
    end

    case params[:button]
    when "cancel"
      cancel_action(_("Edit of Router \"%{name}\" was cancelled by the user") % {:name => @router.name})

    when "save"
      task_id = @router.update_network_router_queue(session[:userid], options)

      add_flash(_("Router update failed: Task start failed: ID [%{id}]") %
                {:id => task_id.to_s}, :error) unless task_id.kind_of?(Integer)

      if @flash_array
        javascript_flash(:spinner_off => true)
      else
        initiate_wait_for_task(:task_id => task_id, :action => "update_finished")
      end
    end
  end

  def update_finished
    task_id = session[:async][:params][:task_id]
    router_name = session[:async][:params][:name]
    task = MiqTask.find(task_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Network Router \"%{name}\" updated") % {:name => router_name})
    else
      add_flash(_("Unable to update Network Router \"%{name}\": %{details}") %
                {:name => router_name, :details => task.message}, :error)
    end

    session[:edit] = nil
    flash_to_session
    javascript_redirect previous_breadcrumb_url
  end

  def add_interface_select
    assert_privileges("network_router_add_interface")
    @router = find_record_with_rbac(NetworkRouter, params[:id])
    @in_a_form = true
    @subnet_choices = {}

    Rbac::Filterer.filtered(@router.ext_management_system.cloud_subnets - @router.cloud_subnets).each do |subnet|
      @subnet_choices[subnet.name] = subnet.id
    end
    if @subnet_choices.empty?
      add_flash(_("No subnets available to add interfaces to Router \"%{name}\"") % {
        :name => @router.name
      }, :error)
      session[:flash_msgs] = @flash_array
      @in_a_form = false
      if @lastaction == "show_list"
        redirect_to(:action => "show_list")
      else
        redirect_to(:action => "show", :id => params[:id])
      end
    else
      drop_breadcrumb(
        :name => _("Add Interface to Router \"%{name}\"") % {:name => @router.name},
        :url  => "/network_router/add_interface/#{@router.id}"
      )
    end
  end

  def add_interface
    assert_privileges("network_router_add_interface")
    @router = find_record_with_rbac(NetworkRouter, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Add Interface on Subnet to Router \"%{name}\" was cancelled by the user") % {
        :name => @router.name
      })

    when "add"
      options = form_params(params)
      cloud_subnet = find_record_with_rbac(CloudSubnet, options[:cloud_subnet_id])

      if @router.supports?(:add_interface)
        task_id = @router.add_interface_queue(session[:userid], cloud_subnet)

        unless task_id.kind_of?(Integer)
          add_flash(_("Add Interface on Subnet to Router \"%{name}\" failed: Task start failed: ID [%{id}]") % {
            :name => @router.name,
            :id   => task_id.inspect
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "add_interface_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Add Interface not supported by Router \"%{name}\"") % {
          :name => @router.name
        }, :error)
        @breadcrumbs.pop if @breadcrumbs
        javascript_flash
      end
    end
  end

  def add_interface_finished
    task_id = session[:async][:params][:task_id]
    router_id = session[:async][:params][:id]
    router_name = session[:async][:params][:name]
    cloud_subnet_id = session[:async][:params][:cloud_subnet_id]

    task = MiqTask.find(task_id)
    cloud_subnet = CloudSubnet.find(cloud_subnet_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Subnet \"%{subnetname}\" added to Router \"%{name}\"") % {
        :subnetname => cloud_subnet.name,
        :name       => router_name
      })
    else
      add_flash(_("Unable to add Subnet \"%{name}\": %{details}") % {
        :name    => router_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    flash_to_session
    javascript_redirect :action => "show", :id => router_id
  end

  def remove_interface_select
    assert_privileges("network_router_remove_interface")
    @router = find_record_with_rbac(NetworkRouter, params[:id])
    @in_a_form = true
    @subnet_choices = {}

    @router.cloud_subnets.each do |subnet|
      @subnet_choices[subnet.name] = subnet.id
    end
    if @subnet_choices.empty?
      add_flash(_("No subnets to remove interfaces to Router \"%{name}\"") % {
        :name => @router.name
      }, :error)
      session[:flash_msgs] = @flash_array
      @in_a_form = false
      if @lastaction == "show_list"
        redirect_to(:action => "show_list")
      else
        redirect_to(:action => "show", :id => params[:id])
      end
    else
      drop_breadcrumb(
        :name => _("Remove Interface from Router \"%{name}\"") % {:name => @router.name},
        :url  => "/network_router/remove_interface/#{@router.id}"
      )
    end
  end

  def remove_interface
    assert_privileges("network_router_remove_interface")
    @router = find_record_with_rbac(NetworkRouter, params[:id])

    case params[:button]
    when "cancel"
      cancel_action(_("Remove Interface on Subnet from Router \"%{name}\" was cancelled by the user") % {
        :name => @router.name
      })

    when "remove"
      options = form_params(params)
      cloud_subnet = find_record_with_rbac(CloudSubnet, options[:cloud_subnet_id])

      if @router.supports?(:remove_interface)
        task_id = @router.remove_interface_queue(session[:userid], cloud_subnet)

        unless task_id.kind_of?(Integer)
          add_flash(_("Remove Interface on Subnet from Router \"%{name}\" failed: Task start failed: ID [%{id}]") % {
            :name => @router.name,
            :id   => task_id.inspect
          }, :error)
        end

        if @flash_array
          javascript_flash(:spinner_off => true)
        else
          initiate_wait_for_task(:task_id => task_id, :action => "remove_interface_finished")
        end
      else
        @in_a_form = true
        add_flash(_("Remove Interface not supported by Router \"%{name}\"") % {
          :name => @router.name
        }, :error)
        @breadcrumbs.pop if @breadcrumbs
        javascript_flash
      end
    end
  end

  def remove_interface_finished
    task_id = session[:async][:params][:task_id]
    router_id = session[:async][:params][:id]
    router_name = session[:async][:params][:name]
    cloud_subnet_id = session[:async][:params][:cloud_subnet_id]

    task = MiqTask.find(task_id)
    cloud_subnet = CloudSubnet.find(cloud_subnet_id)
    if MiqTask.status_ok?(task.status)
      add_flash(_("Subnet \"%{subnetname}\" removed from Router \"%{name}\"") % {
        :subnetname => cloud_subnet.name,
        :name       => router_name
      })
    else
      add_flash(_("Unable to remove Subnet \"%{name}\": %{details}") % {
        :name    => router_name,
        :details => task.message
      }, :error)
    end

    @breadcrumbs.pop if @breadcrumbs
    session[:edit] = nil
    flash_to_session
    javascript_redirect :action => "show", :id => router_id
  end

  private

  def get_networks_by_ems(id)
    Rbac::Filterer.filtered(CloudNetwork.where(:ems_id => id)).select(:id, :name).as_json
  end

  def get_subnets_by_network(id)
    Rbac::Filterer.filtered(CloudSubnet.where(:cloud_network_id => id)).select(:id, :name).as_json
  end

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  def form_external_gateway(params)
    options = {:external_gateway_info => {}}
    if params[:cloud_network_id] && !params[:cloud_network_id].empty?
      network = find_record_with_rbac(CloudNetwork, params[:cloud_network_id])
      options[:external_gateway_info][:network_id] = network.ems_ref
      if params[:cloud_subnet_id] && !params[:cloud_subnet_id].empty?
        subnet = find_record_with_rbac(CloudSubnet, params[:cloud_subnet_id])
        options[:external_gateway_info][:external_fixed_ips] = [{:subnet_id => subnet.ems_ref}]
      end
      options[:external_gateway_info][:enable_snat] = switch_to_bool(params[:enable_snat])
    end
    options
  end

  def form_params(params)
    options = %i(name ems_id admin_state_up cloud_group_id cloud_subnet_id
      cloud_network_id).each_with_object({}) do |param, opt|
      opt[param] = params[param] if params[param]
    end

    options[:cloud_network_id].gsub!(/number:/, '') if options[:cloud_network_id]
    if params[:cloud_tenant_id]
      options[:cloud_tenant] = find_record_with_rbac(CloudTenant, params[:cloud_tenant_id])
    end
    options
  end

  # dispatches operations to multiple routers
  def process_network_routers(routers, operation)
    return if routers.empty?

    if operation == "destroy"
      routers.each do |router|
        audit = {
          :event        => "network_router_record_delete_initiated",
          :message      => "[#{router.name}] Record delete initiated",
          :target_id    => router.id,
          :target_class => "NetworkRouter",
          :userid       => session[:userid]
        }
        AuditEvent.success(audit)
        router.delete_network_router_queue(session[:userid])
      end
      add_flash(n_("Delete initiated for %{number} Network Router.",
                   "Delete initiated for %{number} Network Routers.",
                   routers.length) % {:number => routers.length})
    end
  end

  menu_section :net

  def switch_to_bool(option)
    option && option =~ /on|true/i
  end

  has_custom_buttons
end
