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

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Storage Resources"), :url => controller_url},
      ],
    }
  end

  def download_summary_pdf
    assert_privileges('storage_resource_view')
    super
  end

  def download_data
    assert_privileges('storage_resource_view')
    super
  end

  private

  def textual_group_list
    [%i[properties relationships capabilities storage_services cloud_volumes], %i[tags]]
  end
  helper_method :textual_group_list

  def get_session_data
    @layout = "storage_resource"
  end

  def set_session_data
    session[:layout] = @layout
  end

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  # needed to highlight the selected menu section
  menu_section "storage_resource"
end
