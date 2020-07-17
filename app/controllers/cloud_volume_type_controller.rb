class CloudVolumeTypeController < ApplicationController
  before_action :check_privileges
  before_action :get_session_data

  after_action :cleanup_action
  after_action :set_session_data

  include Mixins::GenericShowMixin
  include Mixins::GenericListMixin
  include Mixins::GenericSessionMixin
  include Mixins::GenericButtonMixin
  include Mixins::BreadcrumbsMixin

  def download_data
    assert_privileges('cloud_volume_type_view')
    super
  end

  private

  def textual_group_list
    [%i[properties relationships], %i[tags]]
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Block Storage")},
        {:title => _("Volume Types"), :url => controller_url},
      ],
    }
  end

  helper_method :textual_group_list

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  menu_section :bst
end
