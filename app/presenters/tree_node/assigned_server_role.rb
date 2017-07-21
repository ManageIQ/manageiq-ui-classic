module TreeNode
  class AssignedServerRole < Node
    set_attributes(:text, :image, :klass) do
      text = ViewHelper.content_tag(:strong) do
        if @options[:tree] == :servers_by_role_tree
          "#{_('Server')}: #{@object.name} [#{@object.id}]"
        else
          "Role: #{@object.server_role.description}"
        end
      end

      if @object.master_supported?
        priority = case @object.priority
                   when 1
                     _("primary, ")
                   when 2
                     _("secondary, ")
                   else
                     ""
                   end
      end
      if @object.active? && @object.miq_server.started?
        image = 'svg/currentstate-on.svg'
        text += _(" (%{priority}active, PID=%{number})") % {:priority => priority, :number => @object.miq_server.pid}
      else
        if @object.miq_server.started?
          image = 'svg/currentstate-suspended.svg'
          text += _(" (%{priority}available, PID=%{number})") % {:priority => priority, :number => @object.miq_server.pid}
        else
          image = 'svg/currentstate-off.svg'
          text += _(" (%{priority}unavailable)") % {:priority => priority}
        end
        klass = "red" if @object.priority == 1
      end
      if @options[:parent_kls] == "Zone" && @object.server_role.regional_role?
        klass = "opacity"
      end

      [text, image, klass]
    end
  end
end
