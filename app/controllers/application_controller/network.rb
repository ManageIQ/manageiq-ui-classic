module ApplicationController::Network
  extend ActiveSupport::Concern

  def network_managers
    ExtManagementSystem.where(:type => "ManageIQ::Providers::Openstack::CloudManager").collect { |ems|
      if ems.respond_to?(:network_manager) && ems.network_manager
        ems.network_manager
      end
    }.compact
  end
end
