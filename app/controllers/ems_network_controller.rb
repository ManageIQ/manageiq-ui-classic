class EmsNetworkController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon
  include Mixins::EmsCommon::Angular
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    ManageIQ::Providers::NetworkManager
  end

  def self.table_name
    @table_name ||= "ems_network"
  end

  def ems_path(*args)
    ems_network_path(*args)
  end

  def new_ems_path
    {:action => 'new'}
  end

  def ems_network_form_fields
    ems_form_fields
  end

  def restful?
    true
  end

  def model_feature_for_action(action)
    case action
    when :edit
      :ems_network_new
    end
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        breadcrumbs_menu_section,
        {:title => _("Providers"), :url => controller_url},
      ],
      :record_info => @ems,
    }.compact
  end

  def download_data
    assert_privileges('ems_network_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('ems_network_show')
    super
  end

  private

  def textual_group_list
    [
      %i[properties status],
      %i[relationships topology smart_management]
    ]
  end
  helper_method :textual_group_list

  menu_section :net
  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  has_custom_buttons
end
