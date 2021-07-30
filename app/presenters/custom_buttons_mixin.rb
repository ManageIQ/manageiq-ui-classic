module CustomButtonsMixin
  extend ActiveSupport::Concern
  def get_tree_aset_kids_for_nil_id(object, count_only)
    count_only ? get_custom_buttons(object).count : get_custom_buttons(object).sort_by { |a| a.name.downcase }
  end

  def buttons_ordered?(object)
    !!(object[:set_data] && object[:set_data][:button_order])
  end

  def get_custom_buttons(object)
    # FIXME: don't we have a method for the splits?
    # FIXME: cannot we ask for the null parent using Arel?
    button_name = object.name.split('|').last.split('-').last
    CustomButton.buttons_for(button_name).includes(:custom_button_sets).select do |uri|
      uri.custom_button_sets.blank?
    end
  end

  def x_get_tree_aset_kids(object, count_only)
    if object.id.nil?
      get_tree_aset_kids_for_nil_id(object, count_only)
    elsif count_only
      object.members.count
    else
      button_order = buttons_ordered?(object) ? object[:set_data][:button_order] : nil
      Array(button_order).each_with_object([]) do |bidx, arr|
        object.members.each { |b| arr.push(b) if bidx == b.id && !arr.include?(b) }
      end
    end
  end
end
