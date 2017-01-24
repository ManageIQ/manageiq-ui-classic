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

  # handle buttons pressed on the button bar
  def button
    restore_edit_for_search
    save_current_page_for_refresh

    return tag("CloudObjectStoreContainer") if params[:pressed] == 'cloud_object_store_container_tag'
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
