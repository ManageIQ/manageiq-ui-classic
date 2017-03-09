module TreeNode
  class << self
    # Options used:
    #   :type       -- Type of tree, i.e. :handc, :vandt, :filtered, etc
    #   :open_nodes -- Tree node ids of currently open nodes
    #   FIXME: fill in missing docs
    #
    def new(object, parent_id = nil, options = {})
      subclass(object).new(object, parent_id, options)
    end

    def exists?(object)
      !subclass(object).nil?
    end

    private

    def subclass(object)
      klass = "#{self}::#{object.class}"
      node = object.kind_of?(Hash) || Object.const_defined?(klass) ? klass : "#{self}::#{object.class.base_class}"
      node.safe_constantize
    end
  end
end
