module GtlHelper
  REPORT_CONTROLLER_NAME = "reportDataController".freeze
  REPORT_DOM_ID = "miq-gtl-view".freeze
  REPORT_ANGULAR_MODULE = "ManageIQ.report_data".freeze

  def gtl_selected_records
    records = params.try(:[], :rec_ids) || @edit.try(:[], :pol_items) ||
              @edit.try(:[], :object_ids) || @targets_hash.try(:keys) || @selected_ids

    if records.present?
      records = records.map(&:to_i) if records.first.kind_of?(String)
      records = records.map(&:id) unless records.first.kind_of?(Integer)
    end

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
    parent_id = @report_data_additional_options.try(:[], :parent_id)
    options = GtlOptions.from_hash(
      :model_name                     => model_to_report_data,
      :no_flash_div                   => no_flash_div || false,
      :gtl_type_string                => @gtl_type,
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

      :report_data_additional_options => @report_data_additional_options,
      :url                            => (view_to_url(@view, @paren) if @view.present? && @view.db.present?)
    )
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

  def render_gtl_markup(no_flash_div)
    content_tag('div', :id => REPORT_DOM_ID, "ng-controller" => "reportDataController as dataCtrl") do
      capture do
        concat(render(:partial => 'layouts/flash_msg')) unless no_flash_div
        concat(miq_tile_view)
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
    javascript_tag <<EOJ
      sendDataWithRx({unsubscribe: '#{REPORT_CONTROLLER_NAME}'});
      miq_bootstrap('##{REPORT_DOM_ID}', '#{REPORT_ANGULAR_MODULE}');
      sendDataWithRx({initController: {
        name: '#{REPORT_CONTROLLER_NAME}',
        data: #{options.transform_to_settings.transform_keys { |key| key.to_s.camelize(:lower) }.to_json}
      }});
EOJ
  end
end
