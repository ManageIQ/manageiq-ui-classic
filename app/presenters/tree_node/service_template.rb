module TreeNode
  class ServiceTemplate < Node
    set_attributes(:image, :icon) do
      if @object.picture
        image = @object.decorate.fileicon
      else
        icon = @object.decorate.fonticon
      end
      [image, icon]
    end

    set_attribute(:title) do
      if @object.tenant.ancestors.empty?
        @object.name
      else
        "#{@object.name} (#{@object.tenant.name})"
      end
    end
  end
end
