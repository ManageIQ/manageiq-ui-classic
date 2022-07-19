class HostInitiatorGroupController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericButtonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.display_methods
    %w[cloud_volumes]
  end

  def breadcrumb_name(_model)
    _('Host Initiator Groups')
  end

  def new
    assert_privileges("host_initiator_group_new")

    @in_a_form = true
    if params[:storage_manager_id]
      @storage_manager = find_record_with_rbac(ExtManagementSystem, params[:storage_manager_id])
    end
    drop_breadcrumb(:name => _("Add New %{table}") % {:table => ui_lookup(:table => table_name)},
                    :url  => "/#{controller_name}/new")
  end

  def show
    if params[:id].nil?
      @breadcrumbs.clear
    end
    super
  end

  private

  def textual_group_list
    [%i[properties host_initiators san_addresses], %i[tags]]
  end
  helper_method :textual_group_list

  def set_session_data
    session[:layout] = @layout
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Host Initiator Groups"), :url => controller_url},
      ],
    }
  end

  menu_section "host_initiator_group"

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_show_list", :download_data
  feature_for_actions "#{controller_name}_show", :download_summary_pdf

  toolbar :host_initiator_group, :host_initiator_groups

  def specific_buttons(pressed)
    case pressed
    when 'host_initiator_group_new'
      javascript_redirect(:action => 'new')
    else
      return false
    end
    true
  end
end
