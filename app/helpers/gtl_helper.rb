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

  def miq_data_table
    content_tag(
      'miq-data-table', '',
      "ng-class"         => "{'no-action': dataCtrl.initObject.showUrl === false}",
      "settings"         => "dataCtrl.settings",
      "per-page"         => "dataCtrl.perPage",
      "rows"             => "dataCtrl.gtlData.rows",
      "on-row-click"     => "dataCtrl.onItemClicked(item, event)",
      "on-sort"          => "dataCtrl.onSort(headerId, isAscending)",
      "load-more-items"  => "dataCtrl.onLoadNext(start, perPage)",
      "on-item-selected" => "dataCtrl.onItemSelect(item, isSelected)",
      "columns"          => "dataCtrl.gtlData.cols"
    )
  end

  # This method collects all the data comming from side channels
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

      :report_data_additional_options => @report_data_additional_options,
    }

    render_gtl(options)
  end

  # This is a pure function. All the generated markup depends only and fully on the `options`.
  # Assert about this function calls in your controller specs.
  #
  def render_gtl(options)
    capture do
      concat(render_gtl_markup(options[:no_flash_div]))
      concat(render_gtl_javascripts(options))
    end
  end

  def render_gtl_react(options)
    # TODO:
    # => check escapement
    # => add flash_div
    # => handle empty data
    #
    react 'GtlView', {
      additionalOptions: options[:report_data_additional_options],
      modelName:         options[:model_name],
      activeTree:        options[:active_tree],
      gtlType:           options[:gtl_type_string],
      parentId:          options[:display].nil? ? nil : options[:parent_id],
      sortColIdx:        options[:sort_col],
      sortDir:           options[:sort_dir],
      isExplorer:        options[:explorer] === 'true',
      records:           !options[:selected_records].nil? ? options[:selected_records] : '',
      hideSelect:        options[:selected_records].kind_of?(Array),
      showUrl:           gtl_show_url(options),
      pages:             options[:pages],
    }
  end

  def render_gtl_markup(no_flash_div)
    content_tag('div', :id => 'miq-gtl-view', "ng-controller" => "reportDataController as dataCtrl") do
      capture do
        concat(render(:partial => 'layouts/flash_msg')) unless no_flash_div
        concat(miq_data_table)
        concat(
          content_tag(
            'div',
            render(:partial => "layouts/info_msg", :locals => {:message => _("No Records Found.")}),
            :class    => 'no-record',
            "ng-show" => "!dataCtrl.settings.isLoading && dataCtrl.gtlData.rows.length === 0"
          )
        )
      end
    end
  end

  def render_gtl_javascripts(options)
    parent_id_escaped = (h(j_str(options[:parent_id])) unless options[:display].nil?)

    javascript_tag(<<EOJ)
      ManageIQ.gtl.loading = true;
      sendDataWithRx({unsubscribe: 'reportDataController'});
      miq_bootstrap('#miq-gtl-view');
      sendDataWithRx({initController: {
        name: 'reportDataController',
        data: {
          additionalOptions: #{options[:report_data_additional_options].to_json},
          modelName: '#{h(j_str(options[:model_name]))}',
          activeTree: '#{options[:active_tree]}',
          parentId: '#{parent_id_escaped}',
          sortColIdx: '#{options[:sort_col]}',
          sortDir: '#{options[:sort_dir]}',
          isExplorer: '#{options[:explorer]}' === 'true' ? true : false,
          records: #{!options[:selected_records].nil? ? h(j_str(options[:selected_records].to_json)) : "\'\'"},
          hideSelect: #{options[:selected_records].kind_of?(Array)},
          showUrl: '#{gtl_show_url(options)}',
          pages: #{options[:pages].to_json},
        }
      }});
EOJ
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
