module TreeNode
  class ComplianceDetail < Node
    set_attribute(:title) do
      ViewHelper.capture do
        ViewHelper.concat ViewHelper.content_tag(:strong, "#{_('Policy')}: ")
        ViewHelper.concat @object.miq_policy_desc
      end
    end

    set_attribute(:image) { "100/#{@object.miq_policy_result ? "check" : "x"}.png" }
  end
end
