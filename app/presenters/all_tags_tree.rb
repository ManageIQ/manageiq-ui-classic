class AllTagsTree < TreeBuilder

  def initialize(name, type, sandbox, build, params) # all_tags
    @workflow = params[:workflow]
    @tags = params[:tags]
    @edit_mode = params[:edit_mode]
    super(name, type, sandbox, build)
  end

  def tree_init_options(_tree_name)
    {:full_ids             => true,
     :add_root             => false,
     :lazy                 => false,
     :checkable_checkboxes => @edit_mode,
     :selected             => @selected}
  end

  def set_locals_for_render
    super.merge!(:id_prefix         => 'all_tags_',
                 :check_url         => "/miq_request/prov_field_changed/#{check}", #TODO check
                 :oncheck           => @edit ? "miqOnCheckProvTags" : nil,
                 :checkboxes        => true,
                 :highlight_changes => true,
                 :onclick           => false)
  end

  def root_options
    {}
  end

  def x_get_tree_roots(count_only, _options)
    # TODO
  end
end
