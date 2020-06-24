module HidePartialHelper
  def hide_x_edit_buttons(action)
    %w[snap_vm pre_prov].include?(action)
  end
end
