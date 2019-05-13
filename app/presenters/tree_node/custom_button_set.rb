module TreeNode
  class CustomButtonSet < Node
    set_attribute(:text) do
      if %i[sandt_tree generic_object_definitions_tree].include?(@options[:tree])
        _("%{button_group_name} (Group)") % {:button_group_name => @object.name.split("|").first}
      else
        @object.name.split("|").first
      end
    end

    set_attribute(:tooltip) do
      if @object.description
        _("Button Group: %{button_group_description}") % {:button_group_description => @object.description}
      else
        @object.name.split("|").first
      end
    end

    set_attribute(:color) { @object.set_data.try(:[], :button_color) }
  end
end
