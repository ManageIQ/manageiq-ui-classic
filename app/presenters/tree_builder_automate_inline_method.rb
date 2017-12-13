class TreeBuilderAutomateInlineMethod < TreeBuilderAutomateEntrypoint
  def x_get_tree_class_kids(object, count_only, _type)
    count_only_or_objects(count_only, object.ae_methods.where(:location => 'inline'), [:display_name, :name])
  end
end
