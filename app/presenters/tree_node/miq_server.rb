module TreeNode
  class MiqServer < Node
    set_attribute(:expand, true)

    set_attributes(:text, :tooltip) do
      if @options[:is_current]
        tooltip  = _("%{server}: %{server_name} [%{server_id}] (current)") %
                   {:server => ui_lookup(:model => @object.class.to_s), :server_name => @object.name, :server_id => @object.id}
        tooltip += " (#{@object.status})" if @options[:tree] == :roles_by_server_tree
        text = ViewHelper.content_tag(:strong, ERB::Util.html_escape(tooltip))
      else
        tooltip  = "#{ui_lookup(:model => @object.class.to_s)}: #{@object.name} [#{@object.id}]"
        tooltip += " (#{@object.status})" if @options[:tree] == :roles_by_server_tree
        text = tooltip
      end
      [text, tooltip]
    end
  end
end
