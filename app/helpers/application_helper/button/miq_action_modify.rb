class ApplicationHelper::Button::MiqActionModify < ApplicationHelper::Button::Basic
  needs :@record
  def role_allows_feature?
    super && role_allows?(:feature => 'miq_policy_event_edit')
  end

  def visible?
    @record.kind_of?(MiqPolicy)
  end

  def disabled?
    @error_message = _('This Event belongs to a read only Policy and cannot be modified') if any_policy_read_only?
    @error_message.present?
  end

  private

  def any_policy_read_only?
    MiqPolicy.find_by(:id => @record.id).try(:read_only)
  end
end
