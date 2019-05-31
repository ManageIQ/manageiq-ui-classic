class TreeBuilderTemplatesImagesFilter < TreeBuilderVmsFilter
  private

  def root_options
    {
      :text    => _("All Templates & Images"),
      :tooltip => _("All of the Templates & Images that I can see")
    }
  end

  def filter_root_class
    'MiqTemplate'
  end
end
