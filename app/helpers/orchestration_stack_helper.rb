module OrchestrationStackHelper
  include TextualSummary

  def stack_orchestration_template_basic_info(template)
    rows = [
      row_data(_('Name'), template.name),
      row_data(_('Description'), template.description),
      row_data(_('Draft'), template.draft ? _("True") : _("False")),
      row_data(_('Read Only'), template.in_use? ? _("True") : _("False")),
      row_data(_('Orderable'), template.supports?(:order) ? _("True") : _("False")),
      row_data(_('Created On'), template.created_at),
      row_data(_('Updated On'), template.updated_at),
    ]
    miq_structured_list({
                          :title => _('Details'),
                          :mode  => "stack_orchestration_template_details",
                          :rows  => rows
                        })
  end

  def template_content(template)
    rows = [
      row_data('', {:input => 'code_mirror', :props => {:mode => 'ruby', :payload => template}})
    ]
    miq_structured_list({
                          :title => _('Content'),
                          :mode  => "template_data",
                          :rows  => rows
                        })
  end

  private

  def row_data(label, value)
    {:cells => {:label => label, :value => value}}
  end
end
