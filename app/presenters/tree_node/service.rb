module TreeNode
  class Service < Node
    set_attributes(:image, :icon) do
      if @object.picture
        image = @object.decorate.listicon_image
      else
        icon = 'product product-service'
      end
      [image, icon]
    end
  end
end
