module GtlHelper
  def gtl_selected_records
    records = @edit[:object_ids] unless @edit.nil? || @edit[:object_ids].nil?
    records = @edit[:pol_items] unless @edit.nil? || @edit[:pol_items].nil?
    records = params[:rec_ids] unless params.nil? || params[:rec_ids].nil?
    records = records.map(&:to_i) if !records.nil? && records.first.kind_of?(String)
    records = records.map(&:id) if !records.nil? && !records.first.kind_of?(Integer)
    records
  end

  def miq_tile_view
    content_tag(
      'miq-tile-view', '',
      "ng-if"            => "dataCtrl.gtlType === 'grid' || dataCtrl.gtlType === 'tile'",
      "ng-class"         => "{'no-action': dataCtrl.initObject.showUrl === ''}",
      "settings"         => "dataCtrl.settings",
      "per-page"         => "dataCtrl.perPage",
      "rows"             => "dataCtrl.gtlData.rows",
      "on-row-click"     => "dataCtrl.onItemClicked(item, event)",
      "on-sort"          => "dataCtrl.onSort(headerId, isAscending)",
      "on-item-selected" => "dataCtrl.onItemSelect(item, isSelected)",
      "load-more-items"  => "dataCtrl.onLoadNext(start, perPage)",
      "columns"          => "dataCtrl.gtlData.cols",
      "type"             => "dataCtrl.gtlType === 'grid' ? 'small' : 'big'"
    )
  end

  def miq_data_table
    content_tag(
      'miq-data-table', '',
      "ng-if"            => "dataCtrl.gtlType === 'list'",
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
    parent_id = if @report_data_additional_options
                  @report_data_additional_options[:parent_id]
                end

    options = {
      :model_name                     => model_to_report_data,
      :no_flash_div                   => no_flash_div || false,
      :gtl_type_string                => @gtl_type,
      :active_tree                    => (x_active_tree unless params[:display] || @use_action),
      :parent_id                      => parent_id,
      :selected_records               => gtl_selected_records,

      :display                        => @display,
      :sort_col                       => @sort_col,
      :sort_dir                       => @sort_dir,
      :explorer                       => @explorer,
      :view                           => @view,
      :db                             => @db,

      :report_data_additional_options => @report_data_additional_options,
    }

    render_gtl(options)
  end

  # This is a pure function. All the generated markup depends only and fully on the `options`.
  # Assert about this function calls in your controller specs.
  #
  def render_gtl(options)
    capture do
      concat render_gtl_markup(options[:no_flash_div])
      concat render_gtl_javascripts(options)
    end
  end

  def render_gtl_markup(no_flash_div)
    content_tag('div', :id => 'miq-gtl-view', "ng-controller" => "reportDataController as dataCtrl") do
      capture do
        concat render :partial => 'layouts/flash_msg' unless no_flash_div
        concat miq_tile_view
        concat miq_data_table
        concat content_tag(
          'div',
          render(:partial => "layouts/info_msg", :locals => {:message => _("No Records Found.")}),
          :class    => 'no-record',
          "ng-show" => "!dataCtrl.settings.isLoading && dataCtrl.gtlData.rows.length === 0"
        )
      end
    end
  end

  def render_gtl_javascripts(options)
    parent_id_escaped = (h(j_str(options[:parent_id])) unless options[:display].nil?)

    javascript_tag <<EOJ
      sendDataWithRx({unsubscribe: 'reportDataController'});
      miq_bootstrap('#miq-gtl-view', 'ManageIQ.report_data');
      sendDataWithRx({initController: {
        name: 'reportDataController',
        data: {
          additionalOptions: #{options[:report_data_additional_options].to_json},
          modelName:        '#{h(j_str(options[:model_name]))}',
          activeTree:       '#{options[:active_tree]}',
          gtlType:          '#{h(j_str(options[:gtl_type_string]))}',
          parentId:         '#{parent_id_escaped}',
          sortColIdx:       '#{options[:sortcol]}',
          sortDir:          '#{options[:sortdir]}',
          isExplorer:       '#{options[:explorer]}' === 'true' ? true : false,
          records:          #{!options[:selected_records].nil? ? h(j_str(options[:selected_records].to_json)) : "\'\'"},
          hideSelect:       #{options[:selected_records].kind_of?(Array)},
          showUrl:          '#{view_to_url(options[:view], options[:parent]) if options[:view].present? && options[:view].db.present?}'
        }
      }});
EOJ
  end
end
