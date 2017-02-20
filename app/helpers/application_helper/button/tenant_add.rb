class ApplicationHelper::Button::TenantAdd < ApplicationHelper::Button::RbacCommonFeatureButton
  needs :@record

  def visible?
    !@record.project?
  end
end
