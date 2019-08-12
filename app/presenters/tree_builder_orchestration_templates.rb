class TreeBuilderOrchestrationTemplates < TreeBuilder
  private

  def tree_init_options
    {:full_ids => true, :lazy => true}
  end

  def root_options
    {
      :text    => t = _("All Orchestration Templates"),
      :tooltip => t
    }
  end

  def x_get_tree_roots(count_only)
    nodes = [
      {:id   => 'otcfn',
       :tree => "otcfn_tree",
       :text => _("CloudFormation Templates"),
       :icon => "pficon pficon-template",
       :tip  => _("CloudFormation Templates")},
      {:id   => 'othot',
       :tree => "othot_tree",
       :text => _("Heat Templates"),
       :icon => "pficon pficon-template",
       :tip  => _("Heat Templates")},
      {:id   => 'otazu',
       :tree => "otazu_tree",
       :text => _("Azure Templates"),
       :icon => "pficon pficon-template",
       :tip  => _("Azure Templates")},
      {:id   => 'otazs',
       :tree => "otazs_tree",
       :text => _("AzureStack Templates"),
       :icon => "pficon pficon-template",
       :tip  => _("AzureStack Templates")},
      {:id   => 'otvnf',
       :tree => "otvnf_tree",
       :text => _("VNF Templates"),
       :icon => "pficon pficon-template",
       :tip  => _("VNF Templates")},
      {:id   => 'otvap',
       :tree => "otvap_tree",
       :text => _("vApp Templates"),
       :icon => "pficon pficon-template",
       :tip  => _("vApp Templates")}
    ]
    count_only_or_objects(count_only, nodes)
  end

  def x_get_tree_custom_kids(object, count_only)
    classes = {
      "otcfn" => ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate,
      "othot" => ManageIQ::Providers::Openstack::CloudManager::OrchestrationTemplate,
      "otazu" => ManageIQ::Providers::Azure::CloudManager::OrchestrationTemplate,
      "otazs" => ManageIQ::Providers::AzureStack::CloudManager::OrchestrationTemplate,
      "otvnf" => ManageIQ::Providers::Openstack::CloudManager::VnfdTemplate,
      "otvap" => ManageIQ::Providers::Vmware::CloudManager::OrchestrationTemplate
    }
    count_only_or_objects_filtered(count_only, classes[object[:id]].where(:orderable => true), "name")
  end
end
