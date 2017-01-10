class TreeBuilderOrchestrationTemplates < TreeBuilder
  private

  def tree_init_options(_tree_name)
    {:full_ids => true,
     :leaf     => 'OrchestrationTemplate'}
  end

  def set_locals_for_render
    locals = super
    locals.merge!(:autoload => 'true')
  end

  def root_options
    {
      :title   => t = _("All Orchestration Templates"),
      :tooltip => t
    }
  end

  def x_get_tree_roots(count_only, _options)
    children = [
      {:id    => 'otcfn',
       :tree  => "otcfn_tree",
       :text  => _("CloudFormation Templates"),
       :icon  => "product product-template",
       :tip   => _("CloudFormation Templates")},
      {:id    => 'othot',
       :tree  => "othot_tree",
       :text  => _("Heat Templates"),
       :icon  => "product product-template",
       :tip   => _("Heat Templates")},
      {:id    => 'otazu',
       :tree  => "otazu_tree",
       :text  => _("Azure Templates"),
       :icon  => "product product-template",
       :tip   => _("Azure Templates")},
      {:id    => 'otvnf',
       :tree  => "otvnf_tree",
       :text  => _("VNF Templates"),
       :icon  => "product product-template",
       :tip   => _("VNF Templates")},
      {:id    => 'otvap',
       :tree  => "otvap_tree",
       :text  => _("vApp Templates"),
       :icon  => "product product-template",
       :tip   => _("vApp Templates")}
    ]
    count_only_or_objects(count_only, children)
  end

  def x_get_tree_custom_kids(object, count_only, _options)
    classes = {
      "otcfn" => OrchestrationTemplateCfn,
      "othot" => OrchestrationTemplateHot,
      "otazu" => OrchestrationTemplateAzure,
      "otvnf" => OrchestrationTemplateVnfd,
      "otvap" => ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate
    }
    count_only_or_objects_filtered(count_only, classes[object[:id]].where(["orderable=?", true]), "name")
  end
end
