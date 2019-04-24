class TreeBuilderAutomateInlineMethod < TreeBuilderAutomateEntrypoint
  def x_get_tree_class_kids(object, count_only)
    count_only_or_objects(count_only, object.ae_methods.where(:location => 'inline'), %i[display_name name])
  end
end
