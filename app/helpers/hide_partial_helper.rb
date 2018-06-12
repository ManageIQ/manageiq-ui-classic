module HidePartialHelper
  def hide_x_edit_buttons(action)
    %w(snap_vm).include?(action)
  end
end
