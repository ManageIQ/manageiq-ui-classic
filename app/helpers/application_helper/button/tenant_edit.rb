class ApplicationHelper::Button::TenantEdit < ApplicationHelper::Button::RbacCommonFeatureButton
  def disabled?
    @record.try!(:source)
  end
end
