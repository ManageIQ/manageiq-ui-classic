class AvailabilityZoneController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::MoreShowActions
  include Mixins::GenericShowMixin
  include Mixins::EmsCommon
  include Mixins::BreadcrumbsMixin

  def self.display_methods
    %w[ems_cloud instances cloud_volumes custom_button_events]
  end

  def download_data
    assert_privileges('availability_zone_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('availability_zone_show')
    super
  end

  def perf_top_chart
    assert_privileges('availability_zone_perf')
    super
  end

  def tl_chooser
    assert_privileges('availability_zone_timeline')
    super
  end

  private

  def textual_group_list
    [%i[relationships], %i[availability_zone_totals tags]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Clouds")},
        {:title => _("Availability Zones"), :url => controller_url},
      ],
    }
  end

  menu_section :clo

  has_custom_buttons
end
