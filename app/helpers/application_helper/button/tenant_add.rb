class ApplicationHelper::Button::TenantAdd < ApplicationHelper::Button::GenericFeatureButton
  needs :@record
  delegate :rbac_common_feature_for_buttons, :to => :@view_context

  def role_allows_feature?
    role_allows?(:feature => rbac_common_feature_for_buttons(@feature))
  end

  def visible?
    !@record.project?
  end
end
