class ApplicationHelper::Button::ConditionPolicyCopy < ApplicationHelper::Button::Basic
  needs :@sb

  def role_allows_feature?
    role_allows?(:feature => self[:child_id])
  end
end
