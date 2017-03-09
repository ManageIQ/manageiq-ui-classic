class ApplicationHelper::Button::MiqCheckCompliance < ApplicationHelper::Button::Basic
  needs :@record
  delegate :model_for_vm, :to => :@view_context

  def disabled?
    unless @record.has_compliance_policies?
      @error_message = _('No Compliance Policies assigned to this %{vm}') %
                       {:vm => ui_lookup(:model => model_for_vm(@record).to_s)}
    end
    @error_message.present?
  end
end
