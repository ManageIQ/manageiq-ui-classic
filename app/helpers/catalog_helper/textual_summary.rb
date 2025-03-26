module CatalogHelper::TextualSummary
  def tags_from_record
    tags = []
    tag_categories = Hash.new { |h, k| h[k] = [] }
    @record.tags.each do |tag|
      values = tag.name.split('/')
      p = tags.find { |x| x[:label] == values[2].humanize }
      value = Classification.find_by(:tag_id => tag.id).description
      if p.present?
        p[:value].push(value)
      else
        name = Classification.find_by(:id => Classification.find_by(:tag_id => tag.id).parent_id).description
        tag_categories[name] << value
      end
    end
    tag_categories.each do |tag_category, tag_values|
      tags.push(:icon => "fa fa-tag", :label => tag_category, :value => tag_values)
    end
    tags
  end

  def textual_tags
    label = _("%{name} Tags") % {:name => session[:customer_name]}
    tags = {:label => label}
    if @record.tags.blank?
      tags[:icon] = "fa fa-tag"
      tags[:value] = _("No %{label} have been assigned") % {:label => label}
    else
      tags[:value] = tags_from_record
      tags[:value].each { |value| value[:value].sort! }
      tags[:value].sort_by! { |x| x[:label] }
    end
    tags
  end

  def textual_group_smart_management
    TextualTags.new(_("Smart Management"), %i[tags])
  end
end
