class TreeBuilderAutomateEntrypoint < TreeBuilderAutomateCatalog
  def override(node, _object)
    node.delete(:selectable)
  end

  def root_options
    root = super
    root.delete(:selectable)
    root
  end
end
