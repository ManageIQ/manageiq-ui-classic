module ApplicationController::Network
  extend ActiveSupport::Concern

  def network_managers
    openstack_network_manager = Rbac::Filterer.filtered(ManageIQ::Providers::Openstack::NetworkManager).select(:id, :name, :parent_ems_id)
    redhat_network_manager = Rbac::Filterer.filtered(ManageIQ::Providers::Redhat::NetworkManager).select(:id, :name, :parent_ems_id)
    openstack_network_manager + redhat_network_manager
  end
end
