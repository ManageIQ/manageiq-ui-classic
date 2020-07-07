class PhysicalStorageController < ApplicationController
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
    @table_name ||= "physical_storages"
  end

  def session_data
    @title  = _("Physical Storages")
    @layout = "physical_storage"
    @lastaction = session[:physical_storage_lastaction]
  end

  def set_session_data
    session[:layout] = @layout
    session[:physical_storage_lastaction] = @lastaction
  end

  def show_list
    process_show_list
  end

  def textual_group_list
    [
      %i[properties relationships asset_details],
    ]
  end
  helper_method(:textual_group_list)

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Physical Infrastructure")},
        {:title => _("Storages"), :url => controller_url},
      ],
    }
  end

  def download_data
    assert_privileges('physical_storage_show_list')
    super
  end
end
