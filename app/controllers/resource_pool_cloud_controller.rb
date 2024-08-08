class ResourcePoolCloudController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericButtonMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[vms all_vms resource_pools]
  end

  # handle buttons pressed on the button bar
  def button
    @edit = session[:edit] # Restore @edit for adv search box
    params[:display] = @display if %w[all_vms vms resource_pools].include?(@display) # Were we displaying sub-items

    @refresh_div = 'main_div' unless @display # Default div for button.rjs to refresh
    case params[:pressed]
    when 'resource_pool_cloud_delete'
      deletecloudresourcepools
      if @refresh_div == 'main_div' && @lastaction == 'show_list'
        replace_gtl_main_div
      else
        render_flash unless performed?
      end
    when 'resource_pool_cloud_protect'
      assign_policies(ResourcePool)
    when 'resource_pool_cloud_tag'
      tag(self.class.model)
    else
      super
    end
  end

  def self.model
    ManageIQ::Providers::CloudManager::ResourcePool
  end

  def download_data
    assert_privileges('resource_pool_cloud_view')
    super
  end

  def download_summary_pdf
    assert_privileges('resource_pool_cloud_view')
    super
  end

  def breadcrumb_name(_model)
    _("Cloud Resource Pools")
  end

  def self.table_name
    @table_name ||= "resource_pool"
  end

  def index
    redirect_to(:action => 'show_list')
  end

  def show_list
    assert_privileges('resource_pool_cloud_show_list')
    @center_toolbar = "resource_pool_clouds"
    super
  end

  def show
    assert_privileges('resource_pool_cloud_show')
    @center_toolbar = "resource_pool_cloud"
    super
  end

  private

  def record_class
    %w[all_vms vms].include?(params[:display]) ? VmOrTemplate : ResourcePool
  end

  def textual_group_list
    [%i[properties relationships], %i[configuration smart_management]]
  end

  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Resource Pools"), :url => controller_url},
      ],
    }
  end

  menu_section :resource_pool_cloud
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
end
