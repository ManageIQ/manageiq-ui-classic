class GuestDeviceController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::MoreShowActions
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  def title
    _('Guest Devices')
  end

  def model
    self.class.model
  end

  def download_summary_pdf
    assert_privileges('embedded_automation_manager_credentials_view')

    super
  end

  def self.table_name
    @table_name ||= "guest_device"
  end

  def set_session_data
    super
    session[:layout] = @layout
  end

  def textual_group_list
    [
      %i[properties physical_network_ports firmware],
    ]
  end
  helper_method(:textual_group_list)

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Guest Devices"), :url => controller_url},
      ],
    }
  end
end
