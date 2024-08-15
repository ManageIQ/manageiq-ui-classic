module MiqAeCustomizationHelper
  include Mixins::AutomationMixin
  include SharedHelper::AbShowHelper
  include SharedHelper::AbListHelper

  def editor_automation_types
    AUTOMATION_TYPES.to_json
  end

  def dialog_id_action
    url = request.parameters
    if url[:id].present?
      {:id => @record.id.to_s, :action => 'edit'}
    elsif url[:copy].present?
      {:id => url[:copy], :action => 'copy'}
    else
      {:id => '', :action => 'new'}
    end
  end

  def miq_ae_customization_summary(record)
    summary = [
      miq_ae_customization_basic_info(record),
      miq_ae_customization_content(record),
    ]
    safe_join(summary)
  end

  def miq_ae_customization_basic_info(record)
    rows = [
      row_data(_('Name'), record.name),
      row_data(_('Description'), record.description),
    ]
    miq_structured_list({
                          :title => _('Basic Information'),
                          :mode  => "miq_ae_customization_summary",
                          :rows  => rows
                        })
  end

  def miq_ae_customization_content(record)
    rows = [
      row_data('', {:input => 'code_mirror', :props => {:mode => 'yaml', :payload => YAML.dump(record.content)}})
    ]
    miq_structured_list({
                          :title => _('Content'),
                          :mode  => "method_built_in_data",
                          :rows  => rows
                        })
  end
end
