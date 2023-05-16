class ApplicationHelper::Button::MiqRequest < ApplicationHelper::Button::GenericFeatureButton
  needs :@record, :@request_tab

  def role_allows_feature?
    prefix = case @request_tab
             when 'ae', 'host'
               "#{@request_tab}_"
             else
               ""
             end
    # check RBAC on separate button
    role_allows?(:feature => "#{prefix}#{@feature}")
  end

  def visible?
    return false if @record.resource_type == "AutomationRequest" &&
                    %w[miq_request_approval miq_request_delete].exclude?(@feature)

    true
  end

  # need to add this method here to handle reload button on list view,
  # on list view @record is not set so parent skipped method always returns true that makes button not visible.
  def skipped?
    return false if @feature == 'miq_request_reload' && role_allows_feature?

    super
  end
end
