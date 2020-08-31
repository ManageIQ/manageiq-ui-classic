class ContainerNodeController < ApplicationController
  include ContainersCommonMixin
  include ContainersExternalLoggingSupportMixin
  include Mixins::BreadcrumbsMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def show_list
    process_show_list(:named_scope => :active)
  end

  def textual_group_list
    [
      %i[properties container_labels compliance miq_custom_attributes],
      %i[relationships conditions smart_management]
    ]
  end
  helper_method :textual_group_list

  def launch_cockpit
    node = identify_record(params[:id], ContainerNode)

    disable_client_cache

    if node.kubernetes_hostname
      javascript_open_window(node.cockpit_url.to_s)
    else
      javascript_flash(:text => node.unsupported_reason(:launch_cockpit), :severity => :error, :spinner_off => true)
    end
  end

  def show_ad_hoc_metrics
    if @record && @record.try(:ems_id)
      ems = find_record_with_rbac(ExtManagementSystem, @record.ems_id)
      tags = {:type => "node", :hostname => @record.name}.to_json
      redirect_to(polymorphic_path(ems, :display => "ad_hoc_metrics", :tags => tags))
    end
  end

  def self.custom_display_modes
    %w[ad_hoc_metrics]
  end

  def breadcrumbs_options
    {
      :breadcrumbs => [
        {:title => _("Compute")},
        {:title => _("Containers")},
        {:title => _("Nodes")},
        {:url   => controller_url, :title => _("Container Nodes")},
      ],
    }
  end

  menu_section :cnt

  feature_for_actions "#{controller_name}_show_list", *ADV_SEARCH_ACTIONS

  has_custom_buttons
end
