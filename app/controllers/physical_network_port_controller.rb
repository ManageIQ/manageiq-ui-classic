class PhysicalNetworkPortController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.model
    @model ||= "PhysicalNetworkPort".safe_constantize
  end

  def title
    _('Network Ports')
  end

  def model
    self.class.model
  end

  def self.table_name
    @table_name ||= "physical_network_ports"
  end

  def show
    assert_privileges('physical_switch_show')
    super
  end

  def show_list
    assert_privileges('physical_switch_show')
    super
  end

  def download_data
    assert_privileges('physical_switch_show')
    super
  end

  def download_summary_pdf
    assert_privileges('physical_switch_show')
    super
  end

  def textual_group_list
    [
      %i[properties],
    ]
  end
  helper_method(:textual_group_list)
end
