module TreeNode
  class MiqPolicy < Node
    set_attribute(:text) do
      if @tree.instance_of?(TreeBuilderPolicyProfile)
        ViewHelper.capture do
          ViewHelper.concat(ViewHelper.content_tag(:strong, "#{ui_lookup(:model => @object.target_class_name)} #{@object.mode.titleize}: "))
          ViewHelper.concat(ERB::Util.html_escape(@object.description))
        end
      else
        @object.description
      end
    end
  end
end
