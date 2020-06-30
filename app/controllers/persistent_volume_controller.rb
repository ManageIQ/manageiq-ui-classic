class PersistentVolumeController < ApplicationController
  include ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def download_data
    assert_privileges('persistent_volume_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('persistent_volume_show')
    super
  end

  private

  def textual_group_list
    [%i[properties claim_properties], %i[relationships smart_management capacity]]
  end
  helper_method :textual_group_list

  def display_name
    _("Volumes")
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Volumes"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  has_custom_buttons
end
