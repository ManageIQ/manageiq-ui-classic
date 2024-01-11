module CatalogHelper::OrchestrationTemplateHelper
  private

  def orchestration_template_summary(record)
    summary = [
      orchestration_template_basic_info(record),
      orchestration_template_tags(record),
      orchestration_template_content(record),
    ]
    safe_join(summary)
  end

  def orchestration_template_basic_info(record)
    rows = [
      row_data(_('Name'), record.name),
      row_data(_('Description'), record.description),
      row_data(_('Draft'), record.draft ? _("True") : _("False")),
      row_data(_('Read Only'), record.in_use? ? _("True") : _("False")),
      row_data(_('Created On'), record.created_at),
      row_data(_('Updated On'), record.updated_at),
    ]
    miq_structured_list({
                          :title => _('Basic Information'),
                          :mode  => "orchestration_template_summary",
                          :rows  => rows
                        })
  end

  def orchestration_template_tags(record)
    smart_mgnt = textual_tags_render_data(record)
    data = {:title => smart_mgnt[:title], :mode => "orchestration_template_tags"}
    rows = []
    smart_mgnt[:items].each do |item|
      row = row_data(item[:label], item[:value])
      row[:cells][:icon] = item[:icon] if item[:icon]
      rows.push(row)
    end
    data[:rows] = rows
    miq_structured_list(data)
  end

  def orchestration_template_content(record)
    rows = [
      row_data('', {:input => 'code_mirror', :props => {:mode => 'yaml', :payload => record.content}})
    ]
    miq_structured_list({
                          :title => _('Content'),
                          :mode  => "method_built_in_data",
                          :rows  => rows
                        })
  end
end
