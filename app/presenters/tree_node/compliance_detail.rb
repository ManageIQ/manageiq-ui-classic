module TreeNode
  class ComplianceDetail < Node
    set_attribute(:title) do
      ViewHelper.capture do
        ViewHelper.concat ViewHelper.content_tag(:strong, "#{_('Policy')}: ")
        ViewHelper.concat @object.miq_policy_desc
      end
    end

  end
end
