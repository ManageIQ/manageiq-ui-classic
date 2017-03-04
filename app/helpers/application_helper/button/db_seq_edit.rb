class ApplicationHelper::Button::DbSeqEdit < ApplicationHelper::Button::Basic
  def disabled?
    @error_message = _('There should be at least 2 Dashboards to Edit Sequence') if @widgetsets.length <= 1
    @error_message.present?
  end
end
