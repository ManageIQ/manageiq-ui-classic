class ApplicationHelper::Button::ChargebackRates < ApplicationHelper::Button::ButtonNewDiscover
  def role_allows_feature?
    role_allows?(:feature => 'chargeback_rates')
  end
end
