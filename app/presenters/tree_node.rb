module TreeNode
  class << self
    # Options used:
    #   :type       -- Type of tree, i.e. :handc, :vandt, :filtered, etc
    #   :open_nodes -- Tree node ids of currently open nodes
    #   FIXME: fill in missing docs
    #
    def new(object, parent_id = nil, tree = nil)
      subclass(object).new(object, parent_id, tree)
    end

    def exists?(object)
      !subclass(object).nil?
    end

    private

    def subclass(object)
      klass = "#{self}::#{object.class}".safe_constantize
      klass ||= "#{self}::#{object.class.base_class}".safe_constantize if object.kind_of?(ApplicationRecord)
      klass
    end
  end
end
