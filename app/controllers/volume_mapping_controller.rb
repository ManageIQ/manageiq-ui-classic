class VolumeMappingController < ApplicationController
  include Mixins::GenericListMixin
  include Mixins::GenericShowMixin
  include Mixins::GenericSessionMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::GenericFormMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def new
    assert_privileges("volume_mapping_new")

    @in_a_form = true
    drop_breadcrumb(:name => _("Define New %{table}") % {:table => ui_lookup(:table => table_name)},
                    :url  => "/#{controller_name}/new")
  end

  private

  def textual_group_list
    [%i[properties], %i[tags]]
  end
  helper_method :textual_group_list

  def set_session_data
    session[:layout] = @layout
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Storage")},
        {:title => _("Block Storage")},
        {:title => _("Volume Mappings"), :url => controller_url},
      ],
    }
  end

  menu_section "volume_mapping"

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_show_list", :download_data
  feature_for_actions "#{controller_name}_show", :download_summary_pdf

  toolbar :volume_mapping, :volume_mappings
end
