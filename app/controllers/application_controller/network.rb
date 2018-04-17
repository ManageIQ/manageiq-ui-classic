module ApplicationController::Network
  extend ActiveSupport::Concern

  def network_managers
    ::ManageIQ::Providers::NetworkManager.select(:id, :name, :parent_ems_id)
  end
end
