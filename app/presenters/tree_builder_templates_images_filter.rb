class TreeBuilderTemplatesImagesFilter < TreeBuilderVmsFilter
  def tree_init_options
    super.update(:leaf => 'MiqTemplate')
  end

  def root_options
    {
      :text    => _("All Templates & Images"),
      :tooltip => _("All of the Templates & Images that I can see")
    }
  end
end
