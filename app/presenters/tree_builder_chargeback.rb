class TreeBuilderChargeback < TreeBuilder
  private

  def tree_init_options
    {:open_all => true, :full_ids => true}
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots(count_only)
    rate_types = ChargebackRate::VALID_CB_RATE_TYPES
    return rate_types.length if count_only

    rate_types.map do |type|
      {
        :id   => type,
        :text => type,
        :icon => type.downcase == "compute" ? "pficon pficon-cpu" : "fa fa-hdd-o",
        :tip  => type
      }
    end
  end
end
