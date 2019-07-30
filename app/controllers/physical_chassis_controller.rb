class PhysicalChassisController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def self.table_name
    @table_name ||= "physical_chassis"
  end

  def show_list
    disable_client_cache
    process_show_list
  end

  def textual_group_list
    [
      %i[properties relationships],
      %i[management_network slots]
    ]
  end
  helper_method(:textual_group_list)
  toolbar('physical_chassis_summary', 'physical_chassis_list')

  def self.display_methods
    %w[physical_storages physical_servers]
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Chassis"), :url => controller_url},
      ],
    }
  end
end
