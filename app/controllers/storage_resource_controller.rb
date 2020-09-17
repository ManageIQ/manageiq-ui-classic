class StorageResourceController < ApplicationController
  include Mixins::GenericListMixin
  # include Mixins::MenuUpdateMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericButtonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show
    if params[:id].nil?
      @breadcrumbs.clear
    end
    super
  end

  # def ems_path(*args)
  #   storage_resource_path(*args)
  # end
  #
  # def new_ems_path
  #   storage_resource_path
  # end

  # def aggregate_status_data
  #   render :json => {:data => aggregate_status(params[:id])}
  # end
  #
  # def recent_servers_data
  #   render :json => {:data => recent_servers(params[:id])}
  # end
  #
  # def servers_group_data
  #   render :json => {:data => servers_group(params[:id])}
  # end

  #
  # def title
  #   _("Storage Resources")
  # end
  #
  # def self.session_key_prefix
  #   "storage_resources"
  # end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end
  helper_method :textual_group_list

  def get_session_data
    @layout = "storage_resource"
  end

  def set_session_data
    session[:layout] = @layout
  end

  # needed to highlight the selected menu section
  menu_section "storage_resource"
end
