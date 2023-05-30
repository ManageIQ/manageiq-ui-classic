class ContainerImageRegistryController < ApplicationController
  include Mixins::ContainersCommonMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  def download_data
    assert_privileges('container_image_registry_show_list')
    super
  end

  def download_summary_pdf
    assert_privileges('container_image_registry_show')
    super
  end

  private

  def textual_group_list
    [%i[properties], %i[relationships smart_management]]
  end
  helper_method :textual_group_list

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Image Registries"), :url => controller_url},
      ],
    }
  end
end
