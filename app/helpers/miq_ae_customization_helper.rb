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

  # Build a plain-Ruby hash suitable for JSON-serialisation and passing to the
  # ServiceDialogDetails React component.  Mirrors what _dialog_details.haml
  # (and its sub-partials) previously rendered server-side.
  def dialog_details_data(record)
    {
      :id          => record.id,
      :label       => record.label,
      :description => record.description,
      :created_at  => format_timezone(record.created_at, Time.zone, 'gtl'),
      :updated_at  => format_timezone(record.updated_at, Time.zone, 'gtl'),
      :buttons     => record.buttons.to_s.split(',').map(&:strip).reject(&:blank?),
      :dialog_tabs => (record.dialog_tabs || []).map do |tab|
        {
          :id     => tab.id,
          :label  => tab.label,
          :groups => (tab.dialog_groups || []).map do |group|
            {
              :id          => group.id,
              :label       => group.label,
              :description => group.description,
              :fields      => (group.dialog_fields || []).select(&:visible).map do |field|
                field_data = {
                  :id            => field.id,
                  :type          => field.type,
                  :name          => field.name,
                  :label         => field.label,
                  :description   => field.description,
                  :required      => field.required,
                  :read_only     => field.read_only,
                  :dynamic       => field.dynamic,
                  :default_value => field.default_value,
                }

                # Add type-specific extras
                case field.type
                when 'DialogFieldDropDownList', 'DialogFieldRadioButton'
                  field_data[:values] = field.values.map { |v, t| {:value => v, :text => t} }
                when 'DialogFieldTagControl'
                  field_data[:category_name] = field.options[:category_name]
                when 'DialogFieldCheckBox'
                  field_data[:checked] = field.default_value == 't' || field.default_value == true
                end

                field_data
              end,
            }
          end,
        }
      end,
    }
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
                          :mode  => "method_inline_data",
                          :rows  => rows
                        })
  end
end
