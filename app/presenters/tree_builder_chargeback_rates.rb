class TreeBuilderChargebackRates < TreeBuilderChargeback
  private

  def tree_init_options
    super.merge!(:full_ids => false, :click_url => "/chargeback_rate/tree_select/", :onclick => "miqOnClickGeneric")
  end

  # Get root nodes count/array for explorer tree
  def x_get_tree_roots
    super.map { |type| type.merge!(:selectable => false) }
  end

  def root_options
    {
      :text    => t = _("Rates"),
      :tooltip => t
    }
  end

  # Handle custom tree nodes (object is a Hash)
  def x_get_tree_custom_kids(object, count_only)
    objects = ChargebackRate.where(:rate_type => object[:id]).to_a
    count_only_or_objects(count_only, objects, "description")
  end
end
