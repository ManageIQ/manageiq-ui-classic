module TreeNode
  class Compliance < Node
    set_attribute(:title) do
      ViewHelper.capture do
        ViewHelper.concat ViewHelper.content_tag(:strong, "#{_('Compliance Check on')}: ")
        ViewHelper.concat format_timezone(@object.timestamp, Time.zone, 'gtl')
      end
    end

    set_attribute(:icon) { "pficon #{@object.compliant ? 'pficon-ok' : 'pficon-error-circle-o'}" }
  end
end
