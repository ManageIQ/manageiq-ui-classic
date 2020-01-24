class ResourcePoolController < ApplicationController
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
    when 'resource_pool_delete'
      deleteresourcepools
      if @refresh_div == 'main_div' && @lastaction == 'show_list'
        replace_gtl_main_div
      else
        render_flash unless performed?
      end
    when 'resource_pool_protect'
      assign_policies(ResourcePool)
    else
      super
    end
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
        {:title => _("Infrastructure")},
        {:title => _("Resource Pools"), :url => controller_url},
      ],
    }
  end

  menu_section :inf
end
