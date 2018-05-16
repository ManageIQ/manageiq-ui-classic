module TreeNode
  class MiqScsiTarget < Node
    set_attributes(:text, :tooltip) do
      text = if @object.iscsi_name.blank?
               _("SCSI Target %{target}") % {:target => @object.target}
             else
               _("SCSI Target %{target} (%{name})") % {:target => @object.target, :name => @object.iscsi_name}
             end
      [text, _("Target: %{text}") % {:text => text}]
    end
  end
end
