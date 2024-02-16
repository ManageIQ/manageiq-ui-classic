module MiqAeCustomizationHelper
  include Mixins::AutomationMixin
  include SharedHelper::AbListHelper

  def editor_automation_types
    AUTOMATION_TYPES.to_json
  end

  def dialog_id_action
    url = request.parameters
    if url[:id].present?
      {:id => @record.id.to_s, :action => 'edit'}
    elsif url[:copy].present?
      {:id => url[:copy], :action => 'copy'}
    else
      {:id => '', :action => 'new'}
    end
  end
end
