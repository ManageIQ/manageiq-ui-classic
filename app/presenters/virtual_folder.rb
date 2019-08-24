# Not all TreeNode objects can be mapped to database objects, some serve presentation purposes only. These nodes are
# hardcoded in our codebase as hashes. The purpose of this VirtualFolder is to bridge together the non-persistent
# nodes with the persistent ones by faking some ActiveRecord behavior.
class VirtualFolder
  extend ActiveModel::Naming

  def self.base_class
    self
  end

  def self.base_model
    model_name
  end

  # Decorator support
  if defined?(ManageIQ::Decorators::Engine)
    extend MiqDecorator::Klass
    include MiqDecorator::Instance
  end

  # We're using the singleton class as an ActiveRecord-like store for storing all instances of the VirtualFolder.
  # The storage is a simple hash indexed by the ID of each VirtualFolder. If you try to create a new instance with
  # an existing ID, the already existing object will be returned from the registry. This means that all folders
  # require a unique ID upon creation.
  class << self
    def new(id, *params)
      if exists?(id) # If the instance with the given ID already exists, return it.
        find(id)
      else # Otherwise create a new one and register it.
        create(super(id, *params))
      end
    end

    def create(folder)
      registry[folder.id] = folder
    end

    def find(id)
      registry[id]
    end

    def exists?(id)
      registry.key?(id)
    end

    def delete(id)
      @registry.delete(id)
    end

    private

    def registry
      @registry ||= {}
    end
  end

  # These two attributes are always required for building the tree node
  attr_reader :id, :title

  def initialize(id, title, **node_overrides)
    @id = id
    @title = title
    @node_overrides = node_overrides
  end
end
