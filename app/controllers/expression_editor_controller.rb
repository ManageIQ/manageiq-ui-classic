class ExpressionEditorController < ApplicationController
  before_action :check_privileges

  feature_for_actions %w[condition_edit condition_new miq_policy_edit miq_alert_edit],
                      :metadata, :operators, :tag_values, :find_check_fields, :expression_update

  # POST /expression_editor/expression_update
  # Generic endpoint — persists a MiqExpression JSON into any session edit slot.
  # Used by every React ExpressionEditor instance regardless of context.
  #
  # Body (JSON):
  #   edit_key:   string   e.g. "condition_edit__42" or "condition_edit__new"
  #   field_path: [string] e.g. ["new", "applies_to_exp"]
  #   expression: object   MiqExpression hash
  def expression_update
    payload    = JSON.parse(request.body.read)
    edit_key   = payload['edit_key'].to_s
    field_path = Array(payload['field_path']).map(&:to_sym)
    expression = payload['expression']

    return render_bad_request('edit_key is required')   if edit_key.blank?
    return render_bad_request('field_path is required') if field_path.empty?
    return render :json => {:success => false, :error => 'Session expired'}, :status => 422 unless load_edit(edit_key)

    @edit.store_path(field_path, expression)
    session[:changed] = (@edit[:new] != @edit[:current])
    session[:edit]    = @edit

    render :json => {:success => true}
  rescue JSON::ParserError => e
    render_bad_request(e.message)
  rescue => e
    render :json => {:success => false, :error => e.message}, :status => 500
  end

  # GET /expression_editor/metadata?model=Vm
  # Returns available fields, counts, tags, and find fields for a model.
  # Also returns the list of expression types the UI should offer.
  #
  # Each entry in :fields is [label, name, { col_type: "string"|"integer"|... }]
  # so the JS field-config can set the right valueEditorType without a second
  # round-trip to the operators endpoint.
  def metadata
    model = params[:model].to_s.strip
    return render_bad_request("model parameter is required") if model.blank?

    begin
      raw_finds  = MiqExpression.miq_adv_search_lists(model, :exp_available_finds)
      find_names = raw_finds.to_set(&:last)

      raw_fields = MiqExpression.miq_adv_search_lists(model, :exp_available_fields)
      fields_with_type = raw_fields.filter_map do |entry|
        label, name = entry

        # Fields that are also in exp_available_finds belong in the Find group only.
        # The FIND compound editor is the only correct UI for them; a plain Field
        # atom would silently produce an invalid expression.
        next if find_names.include?(name)

        parsed    = MiqExpression.parse_field_or_tag(name)
        col_type  = parsed.try(:column_type).to_s.presence || "string"
        sub_type  = parsed.try(:sub_type).to_s.presence

        # Mirror the logic in update_from_expression_editor: fields on a plural
        # (has_many) association that are not date/datetime/integer are only
        # valid with CONTAINS — the operator selector should not be shown.
        plural_non_date = model != '_display_filter_' &&
                          MiqExpression::Field.parse(name).plural? &&
                          %w[date datetime integer].exclude?(col_type)
        operators = plural_non_date ? ["CONTAINS"] : MiqExpression.get_col_operators(name)

        col_meta = {:col_type => col_type, :operators => operators}
        col_meta[:sub_type] = sub_type if sub_type.present? && sub_type != col_type
        [label, name, col_meta]
      end

      result = {
        :fields           => fields_with_type,
        :counts           => MiqExpression.miq_adv_search_lists(model, :exp_available_counts),
        :finds            => raw_finds,
        :tags             => MiqExpression.model_details(
          model,
          :typ             => 'tag',
          :include_model   => true,
          :include_my_tags => false,
          :userid          => current_user.userid
        ),
        :expression_types => ExpAtomHelper.expression_types_for_primary_filter(model)
      }
    rescue ArgumentError, NameError => e
      return render_bad_request(e.message)
    end

    render :json => result
  end

  # GET /expression_editor/operators?field=Vm-name
  # Returns the list of valid operators and the column type for a given field path.
  def operators
    field = params[:field].to_s.strip
    return render_bad_request("field parameter is required") if field.blank?

    begin
      ops, col_type = if field == "count"
                        [MiqExpression.get_col_operators(:count), "integer"]
                      elsif field == "regkey"
                        [MiqExpression.get_col_operators(:regkey), "string"]
                      else
                        col_type = MiqExpression.parse_field_or_tag(field).try(:column_type).to_s
                        [MiqExpression.get_col_operators(field), col_type]
                      end
    rescue ArgumentError => e
      return render_bad_request(e.message)
    end

    render :json => {:operators => ops, :col_type => col_type}
  end

  # GET /expression_editor/tag_values?tag=managed/location
  # Returns the list of valid tag values for a given tag path.
  def tag_values
    tag = params[:tag].to_s.strip
    return render_bad_request("tag parameter is required") if tag.blank?

    values = MiqExpression.get_entry_details(tag).sort_by { |a| a.first.downcase }
    render :json => {:tag_values => values}
  end

  # GET /expression_editor/find_check_fields?model=Vm&field=Vm-hardware-disks-filename
  # Returns the sub-fields available for the "check" part of a FIND expression,
  # each with its col_type so the UI can render the right value editor.
  def find_check_fields
    model = params[:model].to_s.strip
    field = params[:field].to_s.strip
    return render_bad_request("model and field parameters are required") if model.blank? || field.blank?

    available = MiqExpression.miq_adv_search_lists(model, :exp_available_finds).each_with_object([]) do |af, res|
      next if af.last == field
      next unless af.last.split('-').first == field.split('-').first

      col_type = MiqExpression.parse_field_or_tag(af.last).try(:column_type).to_s
      res.push({:label => af.first.split(':').last, :name => af.last, :col_type => col_type})
    end

    render :json => {:fields => available}
  end

  private

  def render_bad_request(message)
    render :json => {:error => message}, :status => 400
  end
end
