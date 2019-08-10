class TreeBuilderProtect < TreeBuilder
  has_kids_for Hash, [:x_get_tree_hash_kids]

  def initialize(name, sandbox, build = true, **params)
    @data = params[:data]
    super(name, sandbox, build)
  end

  private

  def tree_init_options
    {
      :full_ids   => false,
      :checkboxes => true,
      :oncheck    => "miqOnCheckProtect",
      :check_url  => "/#{@data[:controller_name]}/protect/"
    }
  end

  def x_get_tree_roots(count_only)
    nodes = MiqPolicySet.all.sort_by { |profile| profile.description.downcase }.map do |profile|
      { :id         => "policy_profile_#{profile.id}",
        :text       => profile.description,
        :icon       => profile.active? ? "fa fa-shield" : "fa fa-inactive fa-shield",
        :tip        => profile.description,
        :select     => @data[:new][profile.id] == @data[:pol_items].length,
        :nodes      => profile.members,
        :selectable => false}
    end
    count_only_or_objects(count_only, nodes)
  end

  def x_get_tree_hash_kids(parent, count_only)
    nodes = parent[:nodes].map do |policy|
      icon = policy.towhat.safe_constantize.try(:decorate).try(:fonticon)
      {
        :id           => "policy_#{policy.id}",
        :text         => prefixed_title("#{ui_lookup(:model => policy.towhat)} #{policy.mode.capitalize}", policy.description),
        :icon         => "#{icon}#{policy.active ? '' : ' fa-inactive'}",
        :tip          => policy.description,
        :hideCheckbox => true,
        :nodes        => [],
        :selectable   => false
      }
    end
    count_only_or_objects(count_only, nodes)
  end
end
