class ApplicationHelper::Button::ChargebackRateRemove < ApplicationHelper::Button::ChargebackRates
  needs :@record

  def disabled?
    @error_message = _('Default Chargeback Rate cannot be removed.') if @record.default?
    @error_message.present?
  end
end
