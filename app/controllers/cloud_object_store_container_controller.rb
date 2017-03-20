class CloudObjectStoreContainerController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericButtonMixin
  include Mixins::GenericSessionMixin

  def breadcrumb_name(_model)
    ui_lookup(:tables => "cloud_object_store_container")
  end

  def button
    restore_edit_for_search
    save_current_page_for_refresh

    # FIXME: Handle this in GenericButtonMixin
    process_cloud_object_storage_buttons(params[:pressed])

    @single_delete = params[:pressed].ends_with?("delete")

    redirect_to_retire_screen_if_single_delete

    if !performed? && @flash_array.present?
      render_flash
    end
  end

  def self.display_methods
    %w(cloud_object_store_objects)
  end

  private

  def textual_group_list
    [%i(properties relationships), %i(tags)]
  end
  helper_method :textual_group_list

  menu_section :ost
end
