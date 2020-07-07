class PhysicalSwitchController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :session_data
  after_action :cleanup_action
  after_action :set_session_data

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  def self.table_name
    @table_name ||= "switches"
  end

  def session_data
    @title      = _("Physical Switches")
    @layout     = "physical_switch"
    @lastaction = session[:physical_switch_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_switch_lastaction] = @lastaction
  end

  def show_list
    process_show_list
  end

  def textual_group_list
    [
      %i[properties management_networks relationships],
      %i[power_management firmware_details],
    ]
  end
  helper_method(:textual_group_list)

  def self.display_methods
    %w[physical_switches physical_network_ports physical_servers]
  end

  def display_physical_network_ports
    nested_list(PhysicalNetworkPort, :breadcrumb_title => _("Physical Ports"))
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Switches"), :url => controller_url},
      ],
    }
  end

  def download_data
    assert_privileges('physical_switch_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('physical_switch_show')
    super
  end

end
