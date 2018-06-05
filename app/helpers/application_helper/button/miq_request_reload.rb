class ApplicationHelper::Button::MiqRequestReload < ApplicationHelper::Button::MiqRequest
  needs :@showtype, :@record, :@request_tab

  def role_allows_feature?
    prefix = case @request_tab
             when 'ae', 'host'
               "#{@request_tab}_"
             else
               ""
             end
    # check RBAC on separate button
    role_allows?(:feature => "#{prefix}miq_request_reload")
  end

  def visible?
    return false unless super
    true
  end
end
