class TreeBuilderPolicyProfile < TreeBuilder
  has_kids_for MiqPolicySet, [:x_get_tree_pp_kids]
  has_kids_for MiqPolicy, [:x_get_tree_po_kids]
  has_kids_for MiqEventDefinition, %i[x_get_tree_ev_kids parents]

  private

  def tree_init_options
    {:full_ids => true}
  end

  # level 0 - root
  def root_options
    {
      :text    => t = _("All Policy Profiles"),
      :tooltip => t
    }
  end

  # level 1 - policy profiles
  def x_get_tree_roots
    count_only_or_objects(false, MiqPolicySet.all, :description)
  end

  # level 2 - policies
  def x_get_tree_pp_kids(parent, count_only)
    count_only_or_objects(count_only,
                          parent.miq_policies,
                          ->(a) { a.towhat + a.mode + a.description.downcase })
  end

  # level 3 - conditions & events for policy
  def x_get_tree_po_kids(parent, count_only)
    conditions = count_only_or_objects(count_only, parent.conditions, :description)
    miq_events = count_only_or_objects(count_only, parent.miq_event_definitions, :description)
    conditions + miq_events
  end

  # level 4 - actions under events
  def x_get_tree_ev_kids(parent, count_only, parents)
    # the policy from level 2
    pol_rec = node_by_tree_id(parents.last)

    success = count_only_or_objects(count_only, pol_rec ? pol_rec.actions_for_event(parent, :success) : [])
    failure = count_only_or_objects(count_only, pol_rec ? pol_rec.actions_for_event(parent, :failure) : [])
    unless count_only
      add_flag_to(success, :success) unless success.empty?
      add_flag_to(failure, :failure) unless failure.empty?
    end
    success + failure
  end

  def add_flag_to(array, flag)
    array.each do |i|
      i.instance_variable_set(:@flag, flag)
    end
  end
end
