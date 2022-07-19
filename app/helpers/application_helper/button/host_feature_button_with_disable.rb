class ApplicationHelper::Button::HostFeatureButtonWithDisable < ApplicationHelper::Button::GenericFeatureButtonWithDisable
  def visible?
    # TODO: @feature.nil? || @record.nil? || !@record.kind_of?(Host) || @record.supports?(@feature.to_sym)
    unless @feature.nil? || @record.nil?
      return false if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager)
      return @record.supports?(@feature.to_sym) if @record.kind_of?(ManageIQ::Providers::Openstack::InfraManager::Host)
    end
    true
  end

  def disabled?
    false
  end
end
