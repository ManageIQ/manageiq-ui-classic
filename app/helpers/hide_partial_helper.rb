module HidePartialHelper
  def hide_x_edit_buttons(action)
    ["snap_vm"].include?(action)
  end
end
