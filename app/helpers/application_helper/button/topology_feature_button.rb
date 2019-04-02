class ApplicationHelper::Button::TopologyFeatureButton < ApplicationHelper::Button::Basic
  needs :@record

  def visible?
    return false if [ManageIQ::Providers::InfraManager,
                     ManageIQ::Providers::PhysicalInfraManager,].any? { |klass| @record.kind_of?(klass) }
    super
  end
end
