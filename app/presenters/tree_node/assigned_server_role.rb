module TreeNode
  class AssignedServerRole < Node
    set_attributes(:text, :icon, :icon_background, :klass) do
      text = ViewHelper.content_tag(:strong) do
        if @tree.instance_of?(TreeBuilderServersByRole)
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
        state = QuadiconHelper.machine_state('on')
        text += _(" (%{priority}active, PID=%{number})") % {:priority => priority, :number => @object.miq_server.pid}
      else
        if @object.miq_server.started?
          state = QuadiconHelper.machine_state('suspended')
          text += _(" (%{priority}available, PID=%{number})") % {:priority => priority, :number => @object.miq_server.pid}
        else
          state = QuadiconHelper.machine_state('off')
          text += _(" (%{priority}unavailable)") % {:priority => priority}
        end
        klass = "red" if @object.priority == 1
      end
      if @tree.root.kind_of?(::Zone) && @object.server_role.regional_role?
        klass = "opacity"
      end

      icon, bg = state.values_at(:fonticon, :background)

      [text, icon, bg, klass]
    end
  end
end
