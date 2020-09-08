module GtlHelper
  def gtl_selected_records
    records = params.try(:[], :rec_ids) || @edit.try(:[], :pol_items) ||
              @edit.try(:[], :object_ids) || @targets_hash.try(:keys) || @selected_ids

    if records.present?
      records = records.map(&:to_i) if records.first.kind_of?(String)
      records = records.map(&:id) unless records.first.kind_of?(Integer)
    end

    records
  end

  # This method collects all the data coming from side channels
  # so that `render_gtl` can be a pure function.
  #
  def render_gtl_outer(no_flash_div)
    parent_id = @report_data_additional_options.try(:[], :parent_id)

    options = {
      :model_name                     => model_to_report_data,
      :no_flash_div                   => no_flash_div || false,
      :active_tree                    => (x_active_tree unless params[:display]),
      :parent_id                      => parent_id,
      :selected_records               => gtl_selected_records,

      :display                        => @display,
      :sort_col                       => @sortcol,
      :sort_dir                       => @sortdir,
      :explorer                       => @explorer,
      :view                           => @view,
      :db                             => @db,
      :parent                         => @parent,
      :pages                          => @pages,
      :flash_messages                 => @flash_array,
      :report_data_additional_options => @report_data_additional_options,
    }

    render_gtl(options)
  end

  def render_gtl(options)
    react 'GtlView', {
      flashMessages:      options[:flash_messages],
      additionalOptions: options[:report_data_additional_options],
      modelName:         options[:model_name],
      activeTree:        options[:active_tree],
      parentId:          options[:display].nil? ? nil : options[:parent_id],
      isAscending:       options[:is_ascending],
      sortColIdx:        options[:sort_col],
      isExplorer:        options[:explorer],
      records:           !options[:selected_records].nil? ? options[:selected_records] : [],
      hideSelect:        options[:selected_records].kind_of?(Array),
      showUrl:           gtl_show_url(options),
      pages:             options[:pages],
    }
  end

  def gtl_show_url(options)
    # FIXME: fetch_path doesn't work on structs in a hash
    if options[:report_data_additional_options].present?
      # only false, nil is true
      return false if options[:report_data_additional_options].clickable == false
    end

    # TODO: the "what happens on nil" logic should probably live here, not in ReportDataController.prototype.initObjects

    view_to_url(options[:view], options[:parent]) if options[:view].present? && options[:view].db.present?
  end
end
