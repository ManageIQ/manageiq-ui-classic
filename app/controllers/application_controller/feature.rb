class ApplicationController
  Feature = Struct.new(:role, :role_any, :name, :accord_name, :title, :container) do
    def self.new_with_hash(hash)
      feature = new(*members.collect { |m| hash[m] })
      feature.autocomplete
      feature
    end

    def autocomplete
      self.accord_name = name.to_s unless accord_name
      self.container   = "#{accord_name}_accord" unless container
    end

    def accord_hash
      {:name      => accord_name,
       :title     => title,
       :container => container}
    end

    def tree_name
      "#{name}_tree"
    end

    def build_tree(sandbox)
      builder = TreeBuilder.class_for_type(name)
      raise _("No TreeBuilder found for feature '%{name}'") % {:name => name} unless builder
      builder.new(tree_name.to_sym, name, sandbox)
    end

    def self.allowed_features(features)
      features.select do |f|
        ApplicationHelper.role_allows?(:feature => f.role, :any => f.role_any)
      end
    end
  end
end
