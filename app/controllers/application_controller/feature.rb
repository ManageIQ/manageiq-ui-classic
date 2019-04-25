class ApplicationController
  Feature = Struct.new(:role, :role_any, :name, :title) do
    def self.new_with_hash(hash)
      new(*members.collect { |m| hash[m] })
    end

    def accord_hash
      {
        :name      => name.to_s,
        :title     => title,
        :container => "#{name}_accord"
      }
    end

    def accord_name
      name.to_s
    end

    def tree_name
      "#{name}_tree"
    end

    def build_tree(sandbox)
      builder = TreeBuilder.class_for_type(name)
      raise _("No TreeBuilder found for feature '%{name}'") % {:name => name} unless builder
      builder.new(tree_name.to_sym, sandbox)
    end

    def self.allowed_features(features)
      features.select do |f|
        ApplicationHelper.role_allows?(:feature => f.role, :any => f.role_any)
      end
    end
  end
end
