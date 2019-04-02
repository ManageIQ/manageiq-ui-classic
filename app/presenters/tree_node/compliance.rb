module TreeNode
  class Compliance < Node
    set_attribute(:text) do
      ViewHelper.capture do
        ViewHelper.concat(ViewHelper.content_tag(:strong, "#{_('Compliance Check on')}: "))
        ViewHelper.concat(format_timezone(@object.timestamp, Time.zone, 'gtl'))
      end
    end
  end
end
