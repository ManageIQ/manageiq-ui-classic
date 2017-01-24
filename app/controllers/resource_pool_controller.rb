class ResourcePoolController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericShowMixin

  def self.display_methods
    %w(vms descendant_vms all_vms resource_pools)
  end

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    copy_sub_item_display_value_to_params

    if button_sub_item_display_values.include?(@display) # Need to check, since RPs contain RPs
      handle_sub_item_presses(params[:pressed]) do |pfx|
        process_vm_buttons(pfx)

        return if button_control_transferred?(params[:pressed])

        unless button_has_redirect_suffix?(params[:pressed])
          set_refresh_and_show
        end
      end
    else
      set_default_refresh_div

      case params[:pressed]
      when "resource_pool_delete"
        deleteresourcepools
        if !@flash_array.nil? && @single_delete
          javascript_redirect :action => 'show_list', :flash_msg => @flash_array[0][:message] # redirect to build the retire screen
        end
      when "resource_pool_tag"
        tag(ResourcePool)
        return if @flash_array.nil?
      when "resource_pool_protect"
        assign_policies(ResourcePool)
        return if @flash_array.nil?
      end
    end

    check_if_button_is_implemented

    if button_has_redirect_suffix?(params[:pressed])
      render_or_redirect_partial_for(params[:pressed])
    elsif button_replace_gtl_main?
      replace_gtl_main_div
    else
      render_flash
    end
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(configuration smart_management)]
  end
  helper_method :textual_group_list

  def button_sub_item_display_values
    %w(all_vms vms resource_pools)
  end

  menu_section :inf
end
