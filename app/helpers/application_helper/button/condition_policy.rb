class ApplicationHelper::Button::ConditionPolicy < ApplicationHelper::Button::ReadOnly
  needs :@sb

  def role_allows_feature?
    role_allows?(:feature => self[:child_id])
  end
end
