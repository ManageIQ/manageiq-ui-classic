module TreeNode
  class AssignedServerRole < Node
    set_attributes(:title, :image, :klass) do
      title = ViewHelper.content_tag(:strong) do
        if @options[:tree] == :servers_by_role_tree
          "#{_('Server')}: #{ERB::Util.html_escape(@object.name)} [#{@object.id}]"
        else
          "Role: #{ERB::Util.html_escape(@object.server_role.description)}"
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
        title += _(" (%{priority}active, PID=%{number})") % {:priority => priority, :number => @object.miq_server.pid}
      else
        if @object.miq_server.started?
          image = 'svg/currentstate-suspended.svg'
          title += _(" (%{priority}available, PID=%{number})") % {:priority => priority, :number => @object.miq_server.pid}
        else
          image = 'svg/currentstate-off.svg'
          title += _(" (%{priority}unavailable)") % {:priority => priority}
        end
        klass = "red" if @object.priority == 1
      end
      if @options[:parent_kls] == "Zone" && @object.server_role.regional_role?
        klass = "opacity"
      end

      [title, image, klass]
    end
  end
end
