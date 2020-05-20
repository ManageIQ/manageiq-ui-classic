class ApplicationHelper::Button::ChargebackReportDownload < ApplicationHelper::Button::Basic
    def role_allows_feature?
      role_allows?(:feature => 'chargeback_reports')
    end
end
