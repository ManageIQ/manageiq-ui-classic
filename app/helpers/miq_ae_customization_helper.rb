module MiqAeCustomizationHelper
  def dialog_id_action
    url = request.parameters
    if url[:id].present?
      {:id => @record.id, :action => 'edit'}
    elsif url[:copy].present?
      {:id => url[:copy], :action => 'copy'}
    else
      {:id => '', :action => 'new'}
    end
  end
end
