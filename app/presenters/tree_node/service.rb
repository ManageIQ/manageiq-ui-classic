module TreeNode
  class Service < Node
    set_attributes(:image, :icon) do
      if @object.picture
        image = @object.decorate.fileicon
      else
        icon = @object.decorate.fonticon
      end
      [image, icon]
    end
  end
end
