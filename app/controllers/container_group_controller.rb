class ContainerGroupController < ApplicationController
  include Mixins::ContainersCommonMixin
  include Mixins::BreadcrumbsMixin
  include Mixins::PodRemoteMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:named_scope => :active)
  end

  def button
    case params[:pressed]
    when "container_group_console"
      javascript_redirect(
        :action => "console",
        :id     => params[:id]
      )
    else
      super
    end
  end

  def console
    assert_privileges("container_group_console")
    @record = identify_record(params[:id], ContainerGroup)
    drop_breadcrumb(
      :name => _("Container Group Console"),
      :url  => "/container_group/console/#{@record.id}"
    )
  end

  private

  def textual_group_list
    [
      %i[properties container_labels container_node_selectors volumes],
      %i[relationships conditions smart_management annotations]
    ]
  end
  helper_method :textual_group_list

  def display_name
    _("Pods")
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Pods"), :url => controller_url},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS
  feature_for_actions "#{controller_name}_timeline", :tl_chooser
  feature_for_actions "#{controller_name}_perf", :perf_top_chart

  has_custom_buttons
end
