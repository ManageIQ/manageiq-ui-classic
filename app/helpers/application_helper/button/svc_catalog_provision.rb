class ApplicationHelper::Button::SvcCatalogProvision < ApplicationHelper::Button::Basic
  needs :@record

  def disabled?
    @error_message = _('No Ordering Dialog is available') unless ordering_dialog_available?
    @error_message.present?
  end

  private

  def ordering_dialog_available?
    @record.resource_actions.any? { |ra| ra.action.downcase == 'provision' }
  end
end
