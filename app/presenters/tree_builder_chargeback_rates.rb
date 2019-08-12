class TreeBuilderChargebackRates < TreeBuilderChargeback
  private

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
