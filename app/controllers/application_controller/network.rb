module ApplicationController::Network
  extend ActiveSupport::Concern

  def network_managers
    ManageIQ::Providers::Openstack::NetworkManager.all
  end
end
