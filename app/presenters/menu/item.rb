module Menu
  Item = Struct.new(:id, :name, :feature, :rbac_feature, :href, :type, :parent_id, :defaults, :icon) do
    extend ActiveModel::Naming

    def self.base_class
      Menu::Item
    end

    def self.base_model
      model_name
    end

    def initialize(an_id, a_name, features, rbac_feature, href, type = :default, parent_id = nil, defaults = nil, icon = nil)
      super
      @parent = nil
      @name = a_name.kind_of?(Proc) ? a_name : -> { a_name }
      @href = href.kind_of?(Proc) ? href : -> { href }
      @type = type.kind_of?(Proc) ? type : -> { type }
    end

    attr_accessor :parent

    def name
      @name.call
    end

    def href
      @href.call
    end

    def type
      @type.call
    end

    def visible?
      return true if rbac_feature.nil?

      rbac_feature.nil? || ApplicationHelper.role_allows?(rbac_feature)
    end

    def leaf?
      true
    end

    def parent_path
      @parent.parent_path
    end

    def item(item_id)
      item_id == id ? self : nil
    end

    def placement
      @parent&.placement || :default
    end

    def contains_item_id?(item_id)
      item_id == id
    end

    def subsection?
      false
    end

    def items
      []
    end
  end
end
