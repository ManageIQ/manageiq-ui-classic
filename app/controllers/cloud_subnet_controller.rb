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
    @in_a_form = true
    drop_breadcrumb(:name => _("Add New Subnet"), :url => "/cloud_subnet/new")
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
    @subnet = find_record_with_rbac(CloudSubnet, params[:id])
    @in_a_form = true
    drop_breadcrumb(
      :name => _("Edit Subnet \"%{name}\"") % {:name => @subnet.name},
      :url  => "/cloud_subnet/edit/#{@subnet.id}"
    )
  end

  def download_data
    assert_privileges('cloud_subnet_view')
    super
  end

  def download_summary_pdf
    assert_privileges('cloud_subnet_view')
    super
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
        breadcrumbs_menu_section,
        {:title => _("Subnets"), :url => controller_url},
      ],
    }
  end

  menu_section :net
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons
end
