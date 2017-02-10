class ContainerReplicatorController < ApplicationController
  include ContainersCommonMixin

  before_action :check_privileges
  before_action :get_session_data
  after_action :cleanup_action
  after_action :set_session_data

  menu_section :cnt

  private

  def textual_group_list
    [%i(properties container_labels container_selectors compliance), %i(relationships smart_management)]
  end
  helper_method :textual_group_list

  def handled_buttons
    %(
      container_replicator_protect
      container_replicator_check_compliance
    )
  end

  def handle_container_replicator_protect
    assign_policies(ContainerReplicator)
  end

  def handle_container_replicator_check_compliance
    check_compliance(ContainerReplicator)
  end
end
