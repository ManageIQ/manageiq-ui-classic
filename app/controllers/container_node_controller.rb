class ContainerNodeController < ApplicationController
  include ContainersCommonMixin
  include ContainersExternalLoggingSupportMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  def textual_group_list
    [
      %i(properties container_labels compliance miq_custom_attributes),
      %i(relationships conditions smart_management)
    ]
  end
  helper_method :textual_group_list

  def launch_cockpit
    node = identify_record(params[:id], ContainerNode)

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
      redirect_to polymorphic_path(ems, :display => "ad_hoc_metrics", :tags => tags)
    end
  end

  def self.custom_display_modes
    %w(ad_hoc_metrics)
  end

  menu_section :cnt
end
