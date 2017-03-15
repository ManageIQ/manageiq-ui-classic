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

    if node.ipaddress
      javascript_open_window(node.cockpit_url.to_s)
    else
      javascript_flash(:text => node.unsupported_reason(:launch_cockpit), :severity => :error, :spinner_off => true)
    end
  end

  def handled_buttons
    %(
      container_node_tag
      container_node_protect
      container_node_check_compliance
    )
  end

  def handle_container_node_protect
    assign_policies(ContainerNode)
  end

  def handle_container_node_check_compliance
    check_compliance(ContainerNode)
  end

  menu_section :cnt
end
