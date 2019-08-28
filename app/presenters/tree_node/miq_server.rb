module TreeNode
  class MiqServer < Node
    set_attribute(:expanded, true)

    set_attributes(:text, :tooltip) do
      if ::MiqServer.my_server.id == @object.id
        tooltip  = _("%{server}: %{server_name} [%{server_id}] (current)") %
                   {:server => ui_lookup(:model => @object.class.to_s), :server_name => @object.name, :server_id => @object.id}
        tooltip += " (#{@object.status})" if @tree.instance_of?(TreeBuilderRolesByServer)
        text = ViewHelper.content_tag(:strong, ERB::Util.html_escape(tooltip))
      else
        tooltip  = "#{ui_lookup(:model => @object.class.to_s)}: #{@object.name} [#{@object.id}]"
        tooltip += " (#{@object.status})" if @tree.instance_of?(TreeBuilderRolesByServer)
        text = tooltip
      end
      [text, tooltip]
    end
  end
end
