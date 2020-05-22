module Menu
  Section = Struct.new(:id, :name, :icon, :items, :placement, :before, :type, :href, :parent_id) do
    extend ActiveModel::Naming

    def self.base_class
      Menu::Section
    end

    def self.base_model
      model_name
    end

    def initialize(an_id, name, icon, *args)
      super
      self.items ||= []
      self.placement ||= :default
      self.type ||= :default

      self.items.compact!

      @parent = nil
      items.each { |el| el.parent = self }
    end

    attr_accessor :parent

    def features
      Array(items).collect { |el| el.try(:feature) }.compact
    end

    def features_recursive
      Array(items).flat_map { |el| el.try(:feature) || el.try(:features) }.compact
    end

    def visible?
      userid = User.current_userid
      store = Vmdb::PermissionStores.instance
      auth  = store.can?(id) && User.current_user.role_allows_any?(:identifiers => features_recursive)
      $log.debug("Role Authorization #{auth ? "successful" : "failed"} for: userid [#{userid}], main tab [#{id}]")
      auth
    end

    def subsection?
      @subsection ||= Array(items).detect { |el| el.kind_of?(Section) }
    end

    def href
      case type
      when :big_iframe
        "/dashboard/iframe?sid=#{id}"
      else
        "/dashboard/maintab/?tab=#{id}"
      end
    end

    def leaf?
      false
    end

    def contains_item_id?(item_id)
      items.detect do |el|
        el.id == item_id || (el.kind_of?(Section) && el.contains_item_id?(item_id))
      end.present?
    end

    def item(item_id)
      return self if item_id == id
      items.each do |el|
        child_match = el.item(item_id)
        return child_match if child_match.present?
      end
      nil
    end

    def default_redirect_url
      items.each do |item|
        next unless item.visible?
        if item.kind_of?(Item)
          return item.href
        else
          section_result = item.default_redirect_url
          return section_result if section_result
        end
      end
      false
    end

    def preprocess_sections(section_hash)
      items.each do |el|
        if el.kind_of?(Section)
          section_hash[el.id] = el
          el.preprocess_sections(section_hash)
        end
      end
    end

    def parent_path(acc = [])
      acc << id
      @parent.present? ? @parent.parent_path(acc) : acc
    end
  end
end
