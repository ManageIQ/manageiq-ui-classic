class TreeBuilderAlertProfileObj < TreeBuilder
  def initialize(name, sandbox, build = true, **params)
    @assign_to = params[:assign_to]
    @cat = params[:cat]
    @selected = params[:selected_nodes]
    @cat_tree = @assign_to.ends_with?("-tags")
    super(name, sandbox, build, **params)
  end

  def override(node, object)
    node.checked = @selected.try(:include?, object.id)
  end

  def tree_init_options
    {
      :checkboxes => true,
      :oncheck    => "miqOnCheckGeneric",
      :check_url  => "/miq_policy/alert_profile_assign_changed/"
    }
  end

  def root_options
    {
      :text         => @cat_tree ? _("Tags") : ui_lookup(:tables => @assign_to),
      :tooltip      => "",
      :icon         => "pficon pficon-folder-open",
      :hideCheckbox => true,
      :selectable   => false
    }
  end

  def x_get_tree_roots
    obj = if @assign_to.blank? || @assign_to == "enterprise"
            []
          elsif @cat_tree
            @cat ? Classification.find(@cat).entries : []
          elsif @assign_to == "ext_management_system"
            ExtManagementSystem.where.not(:type => "ManageIQ::Providers::EmbeddedAnsible::AutomationManager")
          else
            @assign_to.camelize.constantize.all
          end
    count_only_or_objects(false, obj.sort_by { |o| (o.name.presence || o.description).downcase })
  end
end
