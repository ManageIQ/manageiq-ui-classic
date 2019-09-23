class ResourcePoolController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

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
    if %w[all_vms vms resource_pools].include?(@display) # Need to check, since RPs contain RPs

      if params[:pressed].starts_with?("vm_", # Handle buttons from sub-items screen
                                       "miq_template_",
                                       "guest_")

        pfx = pfx_for_vm_button_pressed(params[:pressed])
        process_vm_buttons(pfx)

        return if ["#{pfx}_policy_sim", "#{pfx}_compare", "#{pfx}_tag", "#{pfx}_protect",
                   "#{pfx}_retire", "#{pfx}_right_size", "#{pfx}_ownership",
                   "#{pfx}_reconfigure"].include?(params[:pressed]) &&
                  @flash_array.nil? # Some other screen is showing, so return

        unless ["#{pfx}_edit", "#{pfx}_miq_request_new", "#{pfx}_clone",
                "#{pfx}_migrate", "#{pfx}_publish", 'vm_rename'].include?(params[:pressed])
          @refresh_div = "main_div"
          @refresh_partial = "layouts/gtl"
          show
        end
      end
    else
      @refresh_div = "main_div" # Default div for button.rjs to refresh
      tag(ResourcePool) if params[:pressed] == "resource_pool_tag"
      deleteresourcepools if params[:pressed] == "resource_pool_delete"
      assign_policies(ResourcePool) if params[:pressed] == "resource_pool_protect"
    end

    return if %w[resource_pool_tag resource_pool_protect].include?(params[:pressed]) && @flash_array.nil? # Tag screen showing, so return

    check_if_button_is_implemented

    if single_delete_test
      single_delete_redirect
    elsif ["#{pfx}_miq_request_new", "#{pfx}_migrate", "#{pfx}_clone",
           "#{pfx}_migrate", "#{pfx}_publish"].include?(params[:pressed]) ||
          params[:pressed] == 'vm_rename' && @flash_array.nil?
      render_or_redirect_partial(pfx)
    elsif @refresh_div == "main_div" && @lastaction == "show_list"
      replace_gtl_main_div
    else
      render_flash unless performed?
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
