module TreeNode
  class ServiceTemplateCatalog < Node
    set_attribute(:text) do
      if @object.tenant.present? && @object.tenant.ancestors.present?
        "#{@object.name} (#{@object.tenant.name})"
      else
        @object.name
      end
    end
  end
end
