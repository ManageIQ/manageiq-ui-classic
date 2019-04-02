module TreeNode
  class Zone < Node
    set_attributes(:text, :tooltip) do
      if @options[:is_current]
        tooltip = "#{ui_lookup(:model => @object.class.to_s)}: #{@object.description} (#{_('current')})"
        text   = ViewHelper.content_tag(:strong, ERB::Util.html_escape(tooltip))
      else
        text   = "#{ui_lookup(:model => @object.class.to_s)}: #{@object.description}"
        tooltip = text
      end
      [text, tooltip]
    end
  end
end
