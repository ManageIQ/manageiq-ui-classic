module ApplicationController::Network
  extend ActiveSupport::Concern

  def network_managers
    ems_clouds = ManageIQ::Providers::Openstack::NetworkManager.joins(:parent_manager).where(:parent_managers_ext_management_systems=>{:type=>'ManageIQ::Providers::Openstack::CloudManager'})
    openstack_network_manager = Rbac::Filterer.filtered(ems_clouds).select(:id, :name, :parent_ems_id)
    redhat_network_manager = Rbac::Filterer.filtered(ManageIQ::Providers::Redhat::NetworkManager).select(:id, :name, :parent_ems_id)
    openstack_network_manager + redhat_network_manager
  end
end
