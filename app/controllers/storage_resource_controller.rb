class StorageResourceController < ApplicationController
  include Mixins::GenericListMixin
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
