module ApplicationHelper::Dialogs
  # miq_ae_customization/_dialog_sample
  def dialog_dropdown_select_values(field)
    values = field.values
    if field.type.include?("DropDown")
      values.collect!(&:reverse)
    elsif field.type.include?("TagControl")
      values.map! { |category| [category[:description], category[:id]] }
    end
    values
  end

  # miq_ae_customization/_tag_field_values
  def category_tags(category_id)
    classification = Classification.find_by(:id => category_id)
    return [] if classification.nil?

    available_tags = classification.entries.collect do |category|
      {:name => category.name, :description => category.description}
    end
    available_tags
  end
end
