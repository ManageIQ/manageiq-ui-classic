class ApplicationHelper::Button::SummaryReload < ApplicationHelper::Button::ButtonWithoutRbacCheck
  def visible?
    @explorer && !monitoring_page? && ((@record && proper_layout? && proper_showtype?) || @lastaction == 'show_list')
  end

  private

  def proper_layout?
    @layout != 'miq_policy_rsop'
  end

  def monitoring_page?
    @lastaction == "show_timeline" || @sb[:action] == "chargeback" || @showtype == "performance"
  end

  def proper_showtype?
    %w[details item].exclude?(@showtype)
  end
end
