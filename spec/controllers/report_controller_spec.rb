require ManageIQ::UI::Classic::Engine.root.join("spec/helpers/report_helper_spec.rb")

describe ReportController do
  before { allow(controller).to receive(:data_for_breadcrumbs).and_return({}) }

  context "Get form variables" do
    context "press col buttons" do
      it "moves columns left" do
        controller.params = {:button => "left"}
        expect(controller).to receive(:move_cols_left)
        controller.send(:gfv_move_cols_buttons)
      end

      it "moves columns right" do
        controller.params = {:button => "right"}
        expect(controller).to receive(:move_cols_right)
        controller.send(:gfv_move_cols_buttons)
      end

      it "moves columns up" do
        controller.params = {:button => "up"}
        expect(controller).to receive(:move_cols_up)
        controller.send(:gfv_move_cols_buttons)
      end

      it "moves columns down" do
        controller.params = {:button => "down"}
        expect(controller).to receive(:move_cols_down)
        controller.send(:gfv_move_cols_buttons)
      end

      it "moves columns top" do
        controller.params = {:button => "top"}
        expect(controller).to receive(:move_cols_top)
        controller.send(:gfv_move_cols_buttons)
      end

      it "moves columns bottom" do
        controller.params = {:button => "bottom"}
        expect(controller).to receive(:move_cols_bottom)
        controller.send(:gfv_move_cols_buttons)
      end
    end

    context "handle input fields" do
      before do
        controller.instance_variable_set(:@edit, :new => {}) # Editor methods need @edit[:new]
        allow(controller).to receive(:build_edit_screen) # Don't actually build the edit screen
      end

      describe "#add_field_to_col_order" do
        let(:miq_report)               { FactoryBot.create(:miq_report, :cols => [], :col_order => []) }
        let(:base_model)               { "Vm" }
        let(:virtual_custom_attribute) { "virtual_custom_attribute_kubernetes.io/hostname" }

        before do
          @edit = assigns(:edit)
          @edit[:new][:sortby1] = S1 # Set an initial sort by col
          @edit[:new][:sortby2] = S2 # Set no second sort col
          @edit[:new][:pivot] = ReportController::PivotOptions.new
          controller.instance_variable_set(:@edit, @edit)
        end

        it "fills report by passed column" do
          controller.send(:add_field_to_col_order, miq_report, "#{base_model}-#{virtual_custom_attribute}")
          expect(miq_report.cols.first).to eq(virtual_custom_attribute)
        end
      end

      context "handle report fields" do
        it "sets pdf page size" do
          ps = "US-Legal"
          controller.params = {:pdf_page_size => ps}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:pdf_page_size]).to eq(ps)
        end

        it "sets queue timeout" do
          to = "1"
          controller.params = {:chosen_queue_timeout => to}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:queue_timeout]).to eq(to.to_i)
        end

        it "clears queue timeout" do
          to = ""
          controller.params = {:chosen_queue_timeout => to}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:queue_timeout]).to be_nil
        end

        it "sets row limit" do
          rl = "10"
          controller.params = {:row_limit => rl}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:row_limit]).to eq(rl)
        end

        it "clears row limit" do
          rl = ""
          controller.params = {:row_limit => rl}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:row_limit]).to eq("")
        end

        it "sets report name" do
          rn = "Report Name"
          controller.params = {:name => rn}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:name]).to eq(rn)
        end

        it "sets report title" do
          rt = "Report Title"
          controller.params = {:title => rt}
          controller.send(:gfv_report_fields)
          expect(assigns(:edit)[:new][:title]).to eq(rt)
        end
      end

      context "handle model changes" do
        it "sets CI model" do
          model = "Vm"
          controller.params = {:chosen_model => model}
          controller.send(:gfv_model)
          expect(assigns(:edit)[:new][:model]).to eq(model)
          expect(assigns(:refresh_div)).to eq("form_div")
          expect(assigns(:refresh_partial)).to eq("form")
        end

        it "sets performance model" do
          model = "VmPerformance"
          controller.params = {:chosen_model => model}
          controller.send(:gfv_model)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:model]).to eq(model)
          expect(edit_new[:perf_interval]).to eq("daily")
          expect(edit_new[:perf_avgs]).to eq("time_interval")
          expect(edit_new[:tz]).to eq(session[:user_tz])
          expect(assigns(:refresh_div)).to eq("form_div")
          expect(assigns(:refresh_partial)).to eq("form")
        end

        it "sets chargeback model" do
          model = "ChargebackVm"
          controller.params = {:chosen_model => model}
          controller.send(:gfv_model)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:model]).to eq(model)
          expect(edit_new[:cb_interval]).to eq("daily")
          expect(edit_new[:cb_interval_size]).to eq(1)
          expect(edit_new[:cb_end_interval_offset]).to eq(1)
          expect(edit_new[:cb_groupby]).to eq("date")
          expect(edit_new[:tz]).to eq(session[:user_tz])
          expect(assigns(:refresh_div)).to eq("form_div")
          expect(assigns(:refresh_partial)).to eq("form")
        end
      end

      context "handle trend field changes" do
        it "sets trend column (non % based)" do
          tc = "VmPerformance-derived_memory_used"
          allow(MiqExpression).to receive(:reporting_available_fields)
            .and_return([["Test", tc]]) # Hand back array of arrays
          controller.params = {:chosen_trend_col => tc}
          controller.send(:gfv_trend)
          edit = assigns(:edit)
          edit_new = edit[:new]
          expect(edit_new[:perf_trend_db]).to eq(tc.split("-").first)
          expect(edit_new[:perf_trend_col]).to eq(tc.split("-").last)
          expect(edit_new[:perf_interval]).to eq("daily")
          expect(edit_new[:perf_target_pct1]).to eq(100)
          expect(edit_new[:perf_limit_val]).to be_nil
          expect(edit[:percent_col]).to be_falsey
          expect(assigns(:refresh_div)).to eq("columns_div")
          expect(assigns(:refresh_partial)).to eq("form_columns")
        end

        it "sets trend column (% based)" do
          tc = "VmPerformance-derived_memory_used"
          allow(MiqExpression).to receive(:reporting_available_fields)
            .and_return([["Test (%)", tc]]) # Hand back array of arrays
          controller.params = {:chosen_trend_col => tc}
          controller.send(:gfv_trend)
          edit = assigns(:edit)
          edit_new = edit[:new]
          expect(edit_new[:perf_trend_db]).to eq(tc.split("-").first)
          expect(edit_new[:perf_trend_col]).to eq(tc.split("-").last)
          expect(edit_new[:perf_interval]).to eq("daily")
          expect(edit_new[:perf_target_pct1]).to eq(100)
          expect(edit_new[:perf_limit_val]).to eq(100)
          expect(edit_new[:perf_limit_col]).to be_nil
          expect(edit[:percent_col]).to be_truthy
          expect(assigns(:refresh_div)).to eq("columns_div")
          expect(assigns(:refresh_partial)).to eq("form_columns")
        end

        it "clears trend column" do
          tc = "<Choose>"
          controller.params = {:chosen_trend_col => tc}
          controller.send(:gfv_trend)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:perf_trend_db]).to be_nil
          expect(edit_new[:perf_trend_col]).to be_nil
          expect(edit_new[:perf_interval]).to eq("daily")
          expect(edit_new[:perf_target_pct1]).to eq(100)
          expect(assigns(:refresh_div)).to eq("columns_div")
          expect(assigns(:refresh_partial)).to eq("form_columns")
        end

        it "sets trend limit column" do
          limit_col = "max_derived_cpu_reserved"
          controller.params = {:chosen_limit_col => limit_col}
          controller.send(:gfv_trend)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:perf_limit_col]).to eq(limit_col)
          expect(edit_new[:perf_limit_val]).to be_nil
          expect(assigns(:refresh_div)).to eq("columns_div")
          expect(assigns(:refresh_partial)).to eq("form_columns")
        end

        it "clears trend limit column" do
          limit_col = "<None>"
          controller.params = {:chosen_limit_col => limit_col}
          controller.send(:gfv_trend)
          expect(assigns(:edit)[:new][:perf_limit_col]).to be_nil
          expect(assigns(:refresh_div)).to eq("columns_div")
          expect(assigns(:refresh_partial)).to eq("form_columns")
        end

        it "sets trend limit value" do
          limit_val = "50"
          controller.params = {:chosen_limit_val => limit_val}
          controller.send(:gfv_trend)
          expect(assigns(:edit)[:new][:perf_limit_val]).to eq(limit_val)
        end

        it "sets trend limit percent 1" do
          pct = "70"
          controller.params = {:percent1 => pct}
          controller.send(:gfv_trend)
          expect(assigns(:edit)[:new][:perf_target_pct1]).to eq(pct.to_i)
        end

        it "sets trend limit percent 2" do
          pct = "80"
          controller.params = {:percent2 => pct}
          controller.send(:gfv_trend)
          expect(assigns(:edit)[:new][:perf_target_pct2]).to eq(pct.to_i)
        end

        it "sets trend limit percent 3" do
          pct = "90"
          controller.params = {:percent3 => pct}
          controller.send(:gfv_trend)
          expect(assigns(:edit)[:new][:perf_target_pct3]).to eq(pct.to_i)
        end
      end

      context "handle performance field changes" do
        it "sets perf interval" do
          perf_int = "hourly"
          controller.params = {:chosen_interval => perf_int}
          controller.send(:gfv_performance)
          edit = assigns(:edit)
          edit_new = edit[:new]
          expect(edit_new[:perf_interval]).to eq(perf_int)
          expect(edit_new[:perf_start]).to eq(1.day.to_s)
          expect(edit_new[:perf_end]).to eq("0")
          expect(assigns(:refresh_div)).to eq("form_div")
          expect(assigns(:refresh_partial)).to eq("form")
        end

        it "sets perf averages" do
          perf_avg = "active_data"
          controller.params = {:perf_avgs => perf_avg}
          controller.send(:gfv_performance)
          expect(assigns(:edit)[:new][:perf_avgs]).to eq(perf_avg)
        end

        it "sets perf start" do
          perf_start = 3.days.to_s
          controller.params = {:chosen_start => perf_start}
          controller.send(:gfv_performance)
          expect(assigns(:edit)[:new][:perf_start]).to eq(perf_start)
        end

        it "sets perf end" do
          perf_end = 1.day.to_s
          controller.params = {:chosen_end => perf_end}
          controller.send(:gfv_performance)
          expect(assigns(:edit)[:new][:perf_end]).to eq(perf_end)
        end

        it "sets perf time zone" do
          tz = "Pacific Time (US & Canada)"
          controller.params = {:chosen_tz => tz}
          controller.send(:gfv_performance)
          expect(assigns(:edit)[:new][:tz]).to eq(tz)
        end

        it "sets perf time profile" do
          time_prof = FactoryBot.create(:time_profile, :description => "Test", :profile => {:tz => "UTC"})
          chosen_time_prof = time_prof.id.to_s
          controller.params = {:chosen_time_profile => chosen_time_prof}
          controller.send(:gfv_performance)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:time_profile]).to eq(chosen_time_prof.to_i)
        end

        it "clears perf time profile" do
          chosen_time_prof = ""
          controller.params = {:chosen_time_profile => chosen_time_prof}
          controller.send(:gfv_performance)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:time_profile]).to be_nil
          expect(edit_new[:time_profile_tz]).to be_nil
          expect(assigns(:refresh_div)).to eq("filter_div")
          expect(assigns(:refresh_partial)).to eq("form_filter")
        end
      end

      context "handle chargeback field changes" do
        it "sets show costs" do
          show_type = "owner"
          controller.params = {:cb_show_typ => show_type}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_show_typ]).to eq(show_type)
          expect(assigns(:refresh_div)).to eq("filter_div")
          expect(assigns(:refresh_partial)).to eq("form_filter")
        end

        it "clears show costs" do
          show_type = ""
          controller.params = {:cb_show_typ => show_type}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_show_typ]).to be_nil
          expect(assigns(:refresh_div)).to eq("filter_div")
          expect(assigns(:refresh_partial)).to eq("form_filter")
        end

        it "sets tag category" do
          tag_cat = "department"
          controller.params = {:cb_tag_cat => tag_cat}
          cl_rec = FactoryBot.create(:classification, :name => "test_name", :description => "Test Description")
          expect(Classification).to receive(:lookup_by_name).and_return([cl_rec])
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_tag_cat]).to eq(tag_cat)
          expect(assigns(:edit)[:cb_tags]).to be_a_kind_of(Hash)
          expect(assigns(:refresh_div)).to eq("filter_div")
          expect(assigns(:refresh_partial)).to eq("form_filter")
        end

        it "clears tag category" do
          tag_cat = ""
          controller.params = {:cb_tag_cat => tag_cat}
          controller.send(:gfv_chargeback)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:cb_tag_cat]).to be_nil
          expect(edit_new[:cb_tag_value]).to be_nil
          expect(assigns(:refresh_div)).to eq("filter_div")
          expect(assigns(:refresh_partial)).to eq("form_filter")
        end

        it "sets owner id" do
          owner_id = "admin"
          controller.params = {:cb_owner_id => owner_id}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_owner_id]).to eq(owner_id)
        end

        it "sets tag value" do
          tag_val = "accounting"
          controller.params = {:cb_tag_value => tag_val}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_tag_value]).to eq(tag_val)
        end

        it "sets group by" do
          group_by = "vm"
          controller.params = {:cb_groupby => group_by}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_groupby]).to eq(group_by)
        end

        it "sets show costs by" do
          show_costs_by = "day"
          controller.params = {:cb_interval => show_costs_by}
          controller.send(:gfv_chargeback)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:cb_interval]).to eq(show_costs_by)
          expect(edit_new[:cb_interval_size]).to eq(1)
          expect(edit_new[:cb_end_interval_offset]).to eq(1)
          expect(assigns(:refresh_div)).to eq("filter_div")
          expect(assigns(:refresh_partial)).to eq("form_filter")
        end

        it "sets interval size" do
          int_size = "2"
          controller.params = {:cb_interval_size => int_size}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_interval_size]).to eq(int_size.to_i)
        end

        it "sets end interval offset" do
          end_int_offset = "2"
          controller.params = {:cb_end_interval_offset => end_int_offset}
          controller.send(:gfv_chargeback)
          expect(assigns(:edit)[:new][:cb_end_interval_offset]).to eq(end_int_offset.to_i)
        end
      end

      context "handle chart field changes" do
        it "sets chart type" do
          chosen_graph = "Bar"
          controller.params = {:chosen_graph => chosen_graph}
          controller.send(:gfv_charts)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:graph_type]).to eq(chosen_graph)
          expect(edit_new[:graph_other]).to be_truthy
          expect(edit_new[:graph_count]).to eq(ReportController::Reports::Editor::GRAPH_MAX_COUNT)
          expect(assigns(:refresh_div)).to eq("chart_div")
          expect(assigns(:refresh_partial)).to eq("form_chart")
        end

        it "clears chart type" do
          chosen_graph = "<No chart>"
          controller.params = {:chosen_graph => chosen_graph}
          edit = assigns(:edit)
          edit[:current] = {:graph_count => ReportController::Reports::Editor::GRAPH_MAX_COUNT, :graph_other => true}
          controller.instance_variable_set(:@edit, edit)
          controller.send(:gfv_charts)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:graph_type]).to be_nil
          expect(edit_new[:graph_other]).to be_truthy
          expect(edit_new[:graph_count]).to eq(ReportController::Reports::Editor::GRAPH_MAX_COUNT)
          expect(assigns(:refresh_div)).to eq("chart_div")
          expect(assigns(:refresh_partial)).to eq("form_chart")
        end

        it "sets top values to show" do
          top_val = "3"
          controller.params = {:chosen_count => top_val}
          controller.send(:gfv_charts)
          expect(assigns(:edit)[:new][:graph_count]).to eq(top_val)
          expect(assigns(:refresh_div)).to eq("chart_sample_div")
          expect(assigns(:refresh_partial)).to eq("form_chart_sample")
        end

        it "sets sum other values" do
          sum_other = "null"
          controller.params = {:chosen_other => sum_other}
          controller.send(:gfv_charts)
          expect(assigns(:edit)[:new][:graph_other]).to be_falsey
          expect(assigns(:refresh_div)).to eq("chart_sample_div")
          expect(assigns(:refresh_partial)).to eq("form_chart_sample")
        end
      end

      context "handle consolidation field changes" do
        P1 = "Vm-name".freeze
        P2 = "Vm-boot_time".freeze
        P3 = "Vm-hostname".freeze
        before do
          edit = assigns(:edit)
          edit[:pivot_cols] = {}
          controller.instance_variable_set(:@edit, edit)
          expect(controller).to receive(:build_field_order).once
        end

        it "sets pivot 1" do
          controller.params = {:chosen_pivot1 => P1}
          controller.send(:gfv_pivots)
          expect(assigns(:edit)[:new][:pivot].by1).to eq(P1)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end

        it "sets pivot 2" do
          controller.params = {:chosen_pivot2 => P2}
          controller.send(:gfv_pivots)
          expect(assigns(:edit)[:new][:pivot].by2).to eq(P2)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end

        it "sets pivot 3" do
          controller.params = {:chosen_pivot3 => P3}
          controller.send(:gfv_pivots)
          expect(assigns(:edit)[:new][:pivot].by3).to eq(P3)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end

        it "clearing pivot 1 also clears pivot 2 and 3" do
          edit = assigns(:edit)
          edit[:new][:pivot] = ReportController::PivotOptions.new(P1, P2, P3)
          controller.instance_variable_set(:@edit, edit)
          controller.params = {:chosen_pivot1 => ReportHelper::NOTHING_STRING}
          controller.send(:gfv_pivots)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:pivot].by1).to eq(ReportHelper::NOTHING_STRING)
          expect(edit_new[:pivot].by2).to eq(ReportHelper::NOTHING_STRING)
          expect(edit_new[:pivot].by3).to eq(ReportHelper::NOTHING_STRING)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end

        it "clearing pivot 2 also clears pivot 3" do
          edit = assigns(:edit)
          edit[:new][:pivot] = ReportController::PivotOptions.new(P1, P2, P3)
          controller.instance_variable_set(:@edit, edit)
          controller.params = {:chosen_pivot2 => ReportHelper::NOTHING_STRING}
          controller.send(:gfv_pivots)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:pivot].by1).to eq(P1)
          expect(edit_new[:pivot].by2).to eq(ReportHelper::NOTHING_STRING)
          expect(edit_new[:pivot].by3).to eq(ReportHelper::NOTHING_STRING)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end

        it "setting pivot 1 = pivot 2 bubbles up pivot 3 to 2" do
          edit = assigns(:edit)
          edit[:new][:pivot] = ReportController::PivotOptions.new(P1, P2, P3)
          controller.instance_variable_set(:@edit, edit)
          controller.params = {:chosen_pivot1 => P2}
          controller.send(:gfv_pivots)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:pivot].by1).to eq(P2)
          expect(edit_new[:pivot].by2).to eq(P3)
          expect(edit_new[:pivot].by3).to eq(ReportHelper::NOTHING_STRING)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end

        it "setting pivot 2 = pivot 3 clears pivot 3" do
          edit = assigns(:edit)
          edit[:new][:pivot] = ReportController::PivotOptions.new(P1, P2, P3)
          controller.instance_variable_set(:@edit, edit)
          controller.params = {:chosen_pivot2 => P3}
          controller.send(:gfv_pivots)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:pivot].by1).to eq(P1)
          expect(edit_new[:pivot].by2).to eq(P3)
          expect(edit_new[:pivot].by3).to eq(ReportHelper::NOTHING_STRING)
          expect(assigns(:refresh_div)).to eq("consolidate_div")
          expect(assigns(:refresh_partial)).to eq("form_consolidate")
        end
      end

      context "handle summary field changes" do
        S1 = "Vm-test1".freeze
        S2 = "Vm-test2".freeze
        before do
          edit = assigns(:edit)
          edit[:new][:sortby1] = S1               # Set an initial sort by col
          edit[:new][:sortby2] = S2               # Set no second sort col
          edit[:new][:group] == "No"              # Setting group default
          edit[:new][:col_options] = {} # Create col_options hash so keys can be set
          edit[:new][:field_order] = [] # Create field_order array
          controller.instance_variable_set(:@edit, edit)
        end

        it "sets first sort col" do
          new_sort = "Vm-new"
          controller.params = {:chosen_sort1 => new_sort}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq(new_sort)
          expect(edit_new[:sortby2]).to eq(S2)
          expect(assigns(:refresh_div)).to eq("sort_div")
          expect(assigns(:refresh_partial)).to eq("form_sort")
        end

        it "set first sort col = second clears second" do
          controller.params = {:chosen_sort1 => S2}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq(S2)
          expect(edit_new[:sortby2]).to eq(ReportHelper::NOTHING_STRING)
          expect(assigns(:refresh_div)).to eq("sort_div")
          expect(assigns(:refresh_partial)).to eq("form_sort")
        end

        it "clearing first sort col clears both sort cols" do
          controller.params = {:chosen_sort1 => ReportHelper::NOTHING_STRING}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq(ReportHelper::NOTHING_STRING)
          expect(edit_new[:sortby2]).to eq(ReportHelper::NOTHING_STRING)
          expect(assigns(:refresh_div)).to eq("sort_div")
          expect(assigns(:refresh_partial)).to eq("form_sort")
        end

        it "sets first sort col suffix" do
          sfx = "hour"
          controller.params = {:sort1_suffix => sfx}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq("#{S1}__#{sfx}")
          expect(edit_new[:sortby2]).to eq(S2)
        end

        it "sets sort order" do
          sort_order = "Descending"
          controller.params = {:sort_order => sort_order}
          controller.send(:gfv_sort)
          expect(assigns(:edit)[:new][:order]).to eq(sort_order)
        end

        it "sets sort breaks" do
          sort_group = "Yes"
          controller.params = {:sort_group => sort_group}
          controller.send(:gfv_sort)
          expect(assigns(:edit)[:new][:group]).to eq(sort_group)
          expect(assigns(:refresh_div)).to eq("sort_div")
          expect(assigns(:refresh_partial)).to eq("form_sort")
        end

        it "sets hide detail rows" do
          hide_detail = "1"
          controller.params = {:hide_details => hide_detail}
          controller.send(:gfv_sort)
          expect(assigns(:edit)[:new][:hide_details]).to be_truthy
        end

        # TODO: Not sure why, but this test seems to take .5 seconds while others are way faster
        it "sets format on summary row" do
          fmt = "hour_am_pm"
          controller.params = {:break_format => fmt}
          controller.send(:gfv_sort)

          # Check to make sure the proper value gets set in the col_options hash using the last part of the sortby1 col as key
          opts = assigns(:edit)[:new][:col_options]
          key = S1.split("-").last
          expect(opts[key]).to be_a_kind_of(Hash)
          expect(opts[key][:break_format]).to eq(fmt.to_sym)
        end

        it "sets second sort col" do
          new_sort = "Vm-new"
          controller.params = {:chosen_sort2 => new_sort}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq(S1)
          expect(edit_new[:sortby2]).to eq(new_sort)
        end

        it "clearing second sort col" do
          controller.params = {:chosen_sort2 => ReportHelper::NOTHING_STRING}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq(S1)
          expect(edit_new[:sortby2]).to eq(ReportHelper::NOTHING_STRING)
        end

        it "sets second sort col suffix" do
          sfx = "day"
          controller.params = {:sort2_suffix => sfx}
          controller.send(:gfv_sort)
          edit_new = assigns(:edit)[:new]
          expect(edit_new[:sortby1]).to eq(S1)
          expect(edit_new[:sortby2]).to eq("#{S2}__#{sfx}")
        end

        it 'grouping value is a sorted array of symbols' do
          edit_new = assigns(:edit)[:new]
          edit_new[:field_order] = [['Vm-foobar']]
          controller.send(:gfv_key_group_calculations, 'foobar_0', 'total,avg')
          expect(edit_new[:col_options]['foobar'][:grouping]).to eq(%i(avg total))
        end

        it 'aggregs are stored under pivot_cols as a sorted array of symbols' do
          edit = assigns(:edit)
          edit[:pivot_cols] = {}
          edit[:new][:fields] = [[name = 'Vm-foobar']]
          edit[:new][:headers] = {name => 'shoot me now!'}
          controller.send(:gfv_key_pivot_calculations, 'foobar_0', 'total,avg')
          expect(edit[:pivot_cols][name]).to eq(%i(avg total))
        end
      end
    end
  end

  context "ReportController::Schedules" do
    let(:miq_report) { FactoryBot.create(:miq_report) }

    before do
      @current_user = login_as FactoryBot.create(:user, :features => %w(miq_report_schedule_enable
                                                                         miq_report_schedule_disable
                                                                         miq_report_schedule_edit))
      allow(User).to receive(:server_timezone).and_return("UTC")
    end

    context "no schedules selected" do
      before do
        allow(controller).to receive(:find_checked_items).and_return([])
      end

      it "#miq_report_schedule_enable" do
        expect { controller.miq_report_schedule_enable }.to raise_error("Can't access records without an id")
      end

      it "#miq_report_schedule_disable" do
        expect { controller.miq_report_schedule_disable }.to raise_error("Can't access records without an id")
      end
    end

    context "normal case" do
      before do
        server = double
        allow(server).to receive_messages(:zone_id => 1)
        allow(MiqServer).to receive(:my_server).and_return(server)

        @sch = FactoryBot.create(:miq_schedule, :enabled => true, :updated_at => 1.hour.ago.utc)

        allow(controller).to receive(:find_records_with_rbac).and_return([@sch])
        expect(controller).to receive(:render).never
        expect(controller).to receive(:schedule_get_all)
        expect(controller).to receive(:replace_right_cell)
      end

      it "#miq_report_schedule_enable" do
        @sch.update_attribute(:enabled, false)

        controller.miq_report_schedule_enable
        expect(controller.send(:flash_errors?)).not_to be_truthy
        @sch.reload
        expect(@sch).to be_enabled
        expect(@sch.updated_at).to be > 10.minutes.ago.utc
      end

      it "#miq_report_schedule_disable" do
        controller.miq_report_schedule_disable
        expect(controller.send(:flash_errors?)).not_to be_truthy
        @sch.reload
        expect(@sch).not_to be_enabled
        expect(@sch.updated_at).to be > 10.minutes.ago.utc
      end

      it "contains current group id in sched_action field" do
        controller.params = {:button => "add",
                             :controller => "report",
                             :action => "schedule_edit"}
        controller.miq_report_schedule_disable
        allow(controller).to receive_messages(:load_edit => true)
        allow(controller).to receive(:replace_right_cell)
        timer = ReportHelper::Timer.new('Once', 1, 1, 1, 1, '12/04/2015', '00', '00')
        controller.instance_variable_set(:@edit,
                                         :sched_id => nil, :new => {:name => "test_1", :description => "test_1",
                                                                    :enabled => true, :send_email => false,
                                                                    :email => {:send_if_empty => true},
                                                                    :timer => timer,
                                                                    :filter => "Configuration Management",
                                                                    :subfilter => "Virtual Machines",
                                                                    :repfilter => miq_report.id},
                                         :key => "schedule_edit__new")
        controller.instance_variable_set(:@sb, :trees => {:schedules_tree => {:schedules_tree => "root"}})
        controller.send(:schedule_edit)
        miq_schedule = MiqSchedule.find_by(:name => "test_1")
        expect(miq_schedule.sched_action).to be_kind_of(Hash)
        expect(miq_schedule.sched_action[:method]).to eq("run_report")
        expect(miq_schedule.sched_action[:options]).to be_kind_of(Hash)
        expect(miq_schedule.sched_action[:options][:miq_group_id]).to eq(@current_user.current_group.id)
      end
    end
  end

  describe 'x_button' do
    before do
      stub_user(:features => :all)
      ApplicationController.handle_exceptions = true
    end

    describe 'corresponding methods are called for allowed actions' do
      ReportController::REPORT_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        it "calls the appropriate method: '#{method}' for action '#{action_name}'" do
          expect(controller).to receive(method)
          get :x_button, :params => { :pressed => action_name }
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => { :pressed => 'random_dude', :format => :html }
      expect(response).to render_template('layouts/exception')
    end
  end

  describe "import/export accordion" do
    include_context "valid session"
    render_views

    before do
      login_as(FactoryBot.create(:user))
      allow(controller).to receive(:x_active_tree) { :export_tree }
    end

    context "accordion root" do
      it "correctly renders the screen for accordion root" do
        allow(controller).to receive(:x_node) { 'root' }
        post :tree_select, :params => {'id' => 'root'}
        expect(response.status).to eq(200)
        expect(response.body).to include('Choose a Import/Export type from the menus on the left.')
      end
    end

    context "widgets import/export node" do
      it "correctly renders the widget import/export screen" do
        allow(controller).to receive(:x_node) { 'xx-exportwidgets' }
        post :tree_select, :params => {'id' => 'xx-exportwidgets'}
        expect(response.status).to eq(200)
        expect(response.body).to include('Widgets')
        expect(response.body).to match(/input.+type=.+submit.+value=.+Export.+/)
      end
    end

    context "custom reports import/export node" do
      it "correctly renders the custom reports import/export screen" do
        allow(controller).to receive(:x_node) { 'xx-exportcustomreports' }
        post :tree_select, :params => {'id' => 'xx-exportcustomreports'}
        expect(response.body).to include('Custom Reports')
        expect(response.status).to eq(200)
        expect(response.body).to match(/input.+type=.+submit.+value=.+Export.+/)
      end
    end
  end

  describe "#export_widgets" do
    include_context "valid session"

    let(:params) { {:widgets => widget_list} }

    before do
      bypass_rescue
    end

    context "when there are widget parameters" do
      let(:widget_list) { %w(1 2 3) }
      let(:widget_yaml) { "the widget yaml" }
      let(:widgets) { [double("MiqWidget")] }

      before do
        records = widgets
        allow(MiqWidget).to receive(:where).with(:id => widget_list).and_return(records)
        allow(MiqWidget).to receive(:export_to_yaml).with(widgets, MiqWidget).and_return(widget_yaml)
      end

      it "sends the data" do
        get :export_widgets, :params => params
        expect(response.body).to eq("the widget yaml")
      end

      it "sets the filename to the current date" do
        Timecop.freeze(2013, 1, 2) do
          get :export_widgets, :params => params
          expect(response.header['Content-Disposition']).to include("widget_export_20130102_000000.yml")
        end
      end
    end

    context "when there are not widget parameters" do
      let(:widget_list) { nil }

      it "sets a flash message" do
        get :export_widgets, :params => params
        expect(assigns(:flash_array))
          .to eq([{:message => "At least 1 item must be selected for export",
                   :level   => :error}])
      end

      it "sets the flash array on the sandbox" do
        get :export_widgets, :params => params
        expect(assigns(:sb)[:flash_msg])
          .to eq([{:message => "At least 1 item must be selected for export",
                   :level   => :error}])
      end

      it "redirects to the explorer" do
        get :export_widgets, :params => params
        expect(response).to redirect_to(:action => :explorer)
      end
    end
  end

  describe "#upload_widget_import_file" do
    include_context "valid session"

    let(:widget_import_service) { double("WidgetImportService") }

    before do
      bypass_rescue
      allow(controller).to receive(:x_node) { 'xx-exportwidgets' }
      controller.instance_variable_set(:@in_a_form, true)
    end

    shared_examples_for "ReportController#upload_widget_import_file that does not upload a file" do
      it "returns with a warning message" do
        post :upload_widget_import_file, :params => params, :xhr => true
        expect(controller.instance_variable_get(:@flash_array))
          .to include(:message => "Use the Choose file button to locate an import file", :level => :warning)
      end
    end

    context "when an upload file is given" do
      let(:filename) { "filename" }
      let(:file) { fixture_file_upload("files/dummy_file.yml", "text/yml") }
      let(:params) { {:upload => {:file => file}} }

      before do
        allow(WidgetImportService).to receive(:new).and_return(widget_import_service)
        login_as(FactoryBot.create(:user))
      end

      context "when the widget importer does not raise an error" do
        let(:ret) { FactoryBot.build(:import_file_upload, :id => '123') }

        before do
          allow(ret).to receive(:widget_list).and_return([])
          allow(widget_import_service).to receive(:store_for_import).with("the yaml data\n").and_return(ret)
        end

        it "returns with an import file upload id" do
          post :upload_widget_import_file, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Import file was uploaded successfully", :level => :success)
          expect(controller.instance_variable_get(:@import_file_upload_id)).to eq(123)
        end

        it "imports the widgets" do
          expect(widget_import_service).to receive(:store_for_import).with("the yaml data\n")
          post :upload_widget_import_file, :params => params, :xhr => true
        end
      end

      context "when the widget importer raises an import error" do
        before do
          allow(widget_import_service).to receive(:store_for_import).and_raise(WidgetImportValidator::NonYamlError)
        end

        it "returns with an error message" do
          post :upload_widget_import_file, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Error: the file uploaded is not of the supported format", :level => :error)
        end
      end

      context "when the widget importer raises a non valid widget yaml error" do
        before do
          allow(widget_import_service).to receive(:store_for_import)
            .and_raise(WidgetImportValidator::InvalidWidgetYamlError)
        end

        it "returns with an error message" do
          post :upload_widget_import_file, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Error: the file uploaded contains no widgets", :level => :error)
        end
      end
    end

    context "when the upload parameter is nil" do
      let(:params) { {} }

      it_behaves_like "ReportController#upload_widget_import_file that does not upload a file"
    end

    context "when an upload file is not given" do
      let(:params) { {:upload => {:file => nil}} }

      it_behaves_like "ReportController#upload_widget_import_file that does not upload a file"
    end
  end

  describe "#import_widgets" do
    include_context "valid session"

    let(:widget_import_service) { double("WidgetImportService") }

    before do
      bypass_rescue
      allow(controller).to receive(:x_node) { 'xx-exportwidgets' }
      controller.instance_variable_set(:@in_a_form, true)
    end

    context "when the commit button is used" do
      let(:params) { {:import_file_upload_id => "123", :widgets_to_import => ["potato"], :commit => 'Commit'} }

      before do
        allow(ImportFileUpload).to receive(:where).with(:id => "123").and_return([import_file_upload])
        allow(WidgetImportService).to receive(:new).and_return(widget_import_service)
      end

      shared_examples_for "ReportController#import_widgets" do
        it "returns a status of 200" do
          post :import_widgets, :params => params, :xhr => true
          expect(response.status).to eq(200)
        end
      end

      context "when the import file upload exists" do
        let(:import_file_upload) { double("ImportFileUpload") }

        before do
          allow(widget_import_service).to receive(:import_widgets)
        end

        it_behaves_like "ReportController#import_widgets"

        it "imports the data" do
          expect(widget_import_service).to receive(:import_widgets).with(import_file_upload, ["potato"])
          post :import_widgets, :params => params, :xhr => true
        end

        it "returns the flash message" do
          allow(widget_import_service).to receive(:import_widgets).and_return(1)
          post :import_widgets, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "1 widget imported successfully", :level => :success)
        end
      end

      context "when the import file upload does not exist" do
        let(:import_file_upload) { nil }

        it_behaves_like "ReportController#import_widgets"

        it "returns the flash message" do
          post :import_widgets, :params => params, :xhr => true
          expect(controller.instance_variable_get(:@flash_array))
            .to include(:message => "Error: Widget import file upload expired", :level => :error)
        end
      end
    end

    context "when the cancel button is used" do
      let(:params) { {:import_file_upload_id => "123", :commit => 'Cancel'} }

      before do
        allow(WidgetImportService).to receive(:new).and_return(widget_import_service)
        allow(widget_import_service).to receive(:cancel_import)
      end

      it "cancels the import" do
        expect(widget_import_service).to receive(:cancel_import).with("123")
        post :import_widgets, :params => params, :xhr => true
      end

      it "returns a 200" do
        post :import_widgets, :params => params, :xhr => true
        expect(response.status).to eq(200)
      end

      it "returns the flash messages" do
        post :import_widgets, :params => params, :xhr => true
        expect(controller.instance_variable_get(:@flash_array))
          .to include(:message => "Widget import cancelled", :level => :info)
      end
    end
  end

  context "#report_selection_menus" do
    before do
      menu = [
        ["Trending", ["Hosts", ["Report 1", "Report 2"]]]
      ]
      controller.instance_variable_set(:@menu, menu)
      controller.instance_variable_set(:@edit,
                                       :new => {
                                         :filter    => "Trending",
                                         :subfilter => "Hosts"
                                       })
      report1 = double("MiqReport",
                       :name => 'Report 1',
                       :id   => 1,
                       :db   => 'VimPerformanceTrend')
      report2 = double("MiqReport",
                       :name => 'Report 2',
                       :id   => 2,
                       :db   => 'VimPerformanceTrend')

      expect(MiqReport).to receive(:where).and_return([report1, report2])
    end

    it "Verify that Trending reports are excluded in widgets editor" do
      controller.instance_variable_set(:@sb, :active_tree => :widgets_tree)
      controller.send(:report_selection_menus)
      expect(assigns(:reps)).to eq([])
    end

    it "Verify that Trending reports are included in schedule menus editor" do
      controller.instance_variable_set(:@sb, :active_tree => :schedules_tree)
      controller.send(:report_selection_menus)
      expect(assigns(:reps).count).to eq(2)
      expect(assigns(:reps)).to eq([["Report 1", 1], ["Report 2", 2]])
    end
  end

  context "#replace_right_cell" do
    before do
      FactoryBot.create(:tenant, :parent => Tenant.root_tenant)
      login_as FactoryBot.create(:user_admin) # not sure why this needs to be an admin...

      controller.instance_variable_set(:@sb,
                                       :trees       => {'reports_tree'      => {:active_node => "root"},
                                                        'savedreports_tree' => {:active_node => "root"},
                                                        'widgets_tree'      => {:active_node => "root"},
                                                        'db_tree'           => {:active_node => "root"},
                                                        'schedules_tree'    => {:active_node => "root"}},
                                       :active_tree => :reports_tree)

      allow(controller).to receive(:x_node) { 'root' }
      allow(controller).to receive(:get_node_info)

      expect(controller).to receive(:render)
    end

    let(:sb) { controller.instance_variable_get(:@sb) }

    it "should rebuild trees when last report result is newer than last tree build time" do
      # report is newer, set build_time first
      sb[:rep_tree_build_time] = Time.now.utc
      FactoryBot.create(:miq_report_with_results)

      expect(controller).to receive(:build_reports_tree)
      expect(controller).to receive(:build_savedreports_tree)
      expect(controller).to receive(:build_db_tree)
      expect(controller).to receive(:build_widgets_tree)

      controller.send(:replace_right_cell)
    end

    it "should not rebuild trees which weren't previously built, even though newer" do
      # report is newer, set build_time first
      sb[:rep_tree_build_time] = Time.now.utc
      FactoryBot.create(:miq_report_with_results)

      sb[:trees].delete('db_tree')
      sb[:trees].delete('widgets_tree')

      expect(controller).to receive(:build_reports_tree)
      expect(controller).to receive(:build_savedreports_tree)
      expect(controller).not_to receive(:build_db_tree)
      expect(controller).not_to receive(:build_widgets_tree)

      controller.send(:replace_right_cell)
    end

    it "should not rebuild trees when last report result is older than last tree build time" do
      # report is older, set build_time after
      FactoryBot.create(:miq_report_with_results)
      sb[:rep_tree_build_time] = Time.now.utc

      expect(controller).not_to receive(:build_reports_tree)
      expect(controller).not_to receive(:build_savedreports_tree)
      expect(controller).not_to receive(:build_db_tree)
      expect(controller).not_to receive(:build_widgets_tree)

      controller.send(:replace_right_cell)
    end

    it "should rebuild trees reports tree when replace_trees is passed in" do
      # even tho rebuild_trees is false, it should still rebuild reports tree because
      # {:replace_trees => [:reports]} is passed in

      # report is older, set build_time after
      FactoryBot.create(:miq_report_with_results)
      sb[:rep_tree_build_time] = Time.now.utc

      expect(controller).to receive(:build_reports_tree)
      expect(controller).not_to receive(:build_savedreports_tree)
      expect(controller).not_to receive(:build_db_tree)
      expect(controller).not_to receive(:build_widgets_tree)

      controller.send(:replace_right_cell, :replace_trees => [:reports])
    end

    it "Can build all the trees" do
      allow(User).to receive(:server_timezone).and_return("UTC")
      sb[:rep_tree_build_time] = Time.now.utc
      MiqWidgetSet.seed
      user2 = create_user_with_group('User2', "Group1", MiqUserRole.find_by(:name => "EvmRole-operator"))
      @rpt = create_and_generate_report_for_user("Vendor and Guest OS", user2)

      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderReportReports),
          instance_of(TreeBuilderReportSavedReports),
          instance_of(TreeBuilderReportSchedules),
          instance_of(TreeBuilderReportWidgets),
          instance_of(TreeBuilderReportDashboards)
        )
      )
      controller.send(:replace_right_cell, :replace_trees => %i(reports schedules savedreports db widgets))
    end
  end

  context "#rebuild_trees" do
    before do
      login_as FactoryBot.create(:user_admin) # not sure why this needs to be an admin...
    end

    it "rebuild trees, latest report result was created after last time tree was built" do
      last_build_time = Time.now.utc
      controller.instance_variable_set(:@sb, :rep_tree_build_time => last_build_time)
      FactoryBot.create(:miq_report_with_results)
      res = controller.send(:rebuild_trees)
      expect(res).to be(true)
      expect(assigns(:sb)[:rep_tree_build_time]).not_to eq(last_build_time)
    end

    it "don't rebuild trees, latest report result was created before last time tree was built" do
      FactoryBot.create(:miq_report_with_results)
      last_build_time = Time.now.utc
      controller.instance_variable_set(:@sb, :rep_tree_build_time => last_build_time)
      res = controller.send(:rebuild_trees)
      expect(res).to be(false)
      expect(assigns(:sb)[:rep_tree_build_time]).to eq(last_build_time)
    end
  end

  describe "#get_all_saved_reports" do
    before do
      EvmSpecHelper.local_miq_server
    end

    context "when generating reports" do
      render_views
      let(:rpt) { FactoryBot.create(:miq_report) }

      before do
        stub_user(:features => :all)

        seed_session_trees('report', :reports_tree, "xx-0_xx-0-1_rep-#{rpt.id}")
        session[:sandboxes]["report"][:rep_tree_build_time] = rpt.created_on
        session[:sandboxes]["report"][:active_accord] = :reports
        allow(controller).to receive(:data_for_breadcrumbs).and_return([{:title => "title", :action => "action", :key => "key"}])
      end

      it "runs report and calls GTL generation" do
        expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
          :model_name                     => 'MiqReportResult',
          :report_data_additional_options => {
            :named_scope => [[:with_current_user_groups_and_report, rpt.id.to_s]],
            :model       => 'MiqReportResult'
          }
        )

        post :x_button, :params => { :pressed => 'miq_report_run', :id => rpt.id }

        expect(response.status).to eq(200)
      end
    end

    context "User1 has Group1(current group: Group1), User2 has Group1, Group2(current group: Group2)" do
      before do
        EvmSpecHelper.local_miq_server

        MiqUserRole.seed
        role = MiqUserRole.find_by(:name => "EvmRole-operator")

        # User1 with 2 groups(Group1,Group2), current group for User2 is Group2
        @user2 = create_user_with_group('User2', "Group1", role)

        @user1 = create_user_with_group('User1', "Group2", role)
        @user1.miq_groups << MiqGroup.where(:description => "Group1")
        login_as @user1
      end

      context "User2 generates report under Group1" do
        before do
          os = OperatingSystem.create(:name => "RHEL 7", :product_name => "RHEL7")
          FactoryBot.create(:vm_vmware, :operating_system => os)
          @rpt = create_and_generate_report_for_user("Vendor and Guest OS", @user2)
        end

        it "is allowed to see miq report result for User1(with current group Group2)" do
          report_result_id = @rpt.miq_report_results.first.id
          controller.params = {:id => report_result_id,
                               :controller => "report",
                               :action => "explorer"}
          controller.instance_variable_set(:@sb, {})
          controller.instance_variable_set(:@settings, :perpage => { :reports => 20 })
          allow(controller).to receive(:get_all_reps)
          controller.send(:show_saved_report, report_result_id)

          fetched_report_result_id = controller.instance_variable_get(:@report_result_id)
          expect(fetched_report_result_id).to eq(@rpt.miq_report_results.first.id)

          fetched_report    = controller.instance_variable_get(:@report)
          fetched_report.id = @rpt.id # Reports serialized into the report column don't have ids
          expect(fetched_report).to eq(@rpt)
        end
      end
    end
  end

  describe "#populate_reports_menu" do
    let(:user) { FactoryBot.create(:user_with_group) }
    let(:sandbox) { {} }

    before do
      EvmSpecHelper.local_miq_server
      login_as user
    end

    it 'sets the sandbox' do
      controller.instance_variable_set(:@sb, sandbox)
      expect(controller).to receive(:get_reports_menu).and_return('yay')
      controller.send(:populate_reports_menu)
      expect(sandbox[:rpt_menu]).to eq('yay')
    end
  end

  describe '#get_reports_menu' do
    let(:group) { FactoryBot.create(:miq_group, :settings => settings) }
    let(:settings) { {:report_menus => []} }

    before do
      controller.instance_variable_set(:@sb, {})
    end

    context 'custom menus configured' do
      it 'retrieves the custom menu' do
        expect(controller).not_to receive(:default_reports_menu)
        controller.send(:get_reports_menu, true, group)
      end
    end

    context 'custom menus not configured' do
      let(:settings) { nil }
      it 'returns with the default menu' do
        expect(controller).to receive(:default_reports_menu)
        controller.send(:get_reports_menu, true, group)
      end
    end

    context 'custom reports included' do
      let(:user) { FactoryBot.create(:user_with_group) }
      let(:menu) { controller.instance_variable_get(:@sb)[:rpt_menu] }
      subject { controller.send(:get_reports_menu, false, user.current_group) }

      before do
        EvmSpecHelper.local_miq_server
        login_as user
        FactoryBot.create(:miq_report, :rpt_type => "Custom", :miq_group => user.current_group)
      end

      it 'returns with the correct name for custom folder' do
        expect(subject.first.first).to eq("#{user.current_tenant.name} (Group): #{user.current_group.name}")
      end
    end
  end

  describe "#miq_report_edit" do
    let(:admin_user)   { FactoryBot.create(:user, :role => "super_administrator") }
    let(:tenant)       { FactoryBot.create(:tenant) }
    let(:chosen_model) { "ChargebackVm" }

    before do
      EvmSpecHelper.local_miq_server
      login_as admin_user
      allow(controller).to receive(:assert_privileges).and_return(true)
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:x_node).and_return("root")
      allow(controller).to receive(:replace_right_cell).and_return(true)
    end

    it "adds new report based on ChargebackVm" do
      count_miq_reports = MiqReport.count

      post :x_button, :params => {:pressed => "miq_report_new"}
      post :form_field_changed, :params => {:id => "new", :chosen_model => chosen_model}
      post :form_field_changed, :params => {:id => "new", :title => "test"}
      post :form_field_changed, :params => {:id => "new", :name => "test"}
      post :form_field_changed, :params => {:button => "right", :available_fields => ["ChargebackVm-cpu_cost"]}
      post :form_field_changed, :params => {:id => "new", :cb_show_typ => "tenant"}
      post :form_field_changed, :params => {:id => "new", :cb_tenant_id => tenant.id}

      post :miq_report_edit, :params => {:button => "add"}

      expect(MiqReport.count).to eq(count_miq_reports + 1)
      expect(MiqReport.last.db_options[:rpt_type]).to eq(chosen_model)
      expect(MiqReport.last.db).to eq(chosen_model)
    end

    it 'allows user to remove columns while editing' do
      post :x_button, :params => {:pressed => 'miq_report_new'}
      post :form_field_changed, :params => {:id => 'new', :chosen_model => chosen_model}
      post :form_field_changed, :params => {:id => 'new', :title => 'test'}
      post :form_field_changed, :params => {:id => 'new', :name => 'test'}
      post :form_field_changed, :params => {:button => "right", :available_fields => ["ChargebackVm-cpu_cost"]}
      resp = post :form_field_changed, :params => {:button => "left", :selected_fields => ["ChargebackVm-cpu_cost"]}
      expect(resp.server_error?).to be_falsey
    end
  end

  context "GenericSessionMixin" do
    let(:report_tab) { 'report_tab' }
    let(:report_result_id) { 'report_result_id' }
    let(:menu) { 'menu' }
    let(:folders) { 'folders' }
    let(:ght_type) { 'ght_type' }
    let(:report_groups) { 'report_groups' }
    let(:edit) { 'edit' }
    let(:catinfo) { 'catinfo' }
    let(:grid_folders) { 'gridfolders' }
    let(:report_lastaction) { 'lastaction' }
    let(:report_display) { 'display' }
    let(:report_filters) { 'filters' }
    let(:report_showtype) { 'showtype' }
    let(:panels) { 'panels' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:report_tab          => report_tab,
                                                          :report_result_id    => report_result_id,
                                                          :report_menu         => menu,
                                                          :report_folders      => folders,
                                                          :ght_type            => ght_type,
                                                          :report_groups       => report_groups,
                                                          :edit                => edit,
                                                          :vm_catinfo          => catinfo,
                                                          :report_grid_folders => grid_folders,
                                                          :report_lastaction   => report_lastaction,
                                                          :report_display      => report_display,
                                                          :report_filters      => report_filters,
                                                          :report_showtype     => report_showtype)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@report_tab)).to eq(report_tab)
        expect(controller.instance_variable_get(:@report_result_id)).to eq(report_result_id)
        expect(controller.instance_variable_get(:@menu)).to eq(menu)
        expect(controller.instance_variable_get(:@folders)).to eq(folders)
        expect(controller.instance_variable_get(:@ght_type)).to eq(ght_type)
        expect(controller.instance_variable_get(:@report_groups)).to eq(report_groups)
        expect(controller.instance_variable_get(:@edit)).to eq(edit)
        expect(controller.instance_variable_get(:@catinfo)).to eq(catinfo)
        expect(controller.instance_variable_get(:@grid_folders)).to eq(grid_folders)
        expect(controller.instance_variable_get(:@lastaction)).to eq(report_lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(report_display)
        expect(controller.instance_variable_get(:@filters)).to eq(report_filters)
        expect(controller.instance_variable_get(:@showtype)).to eq(report_showtype)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@report_tab, report_tab)
        controller.instance_variable_set(:@report_result_id, report_result_id)
        controller.instance_variable_set(:@menu, menu)
        controller.instance_variable_set(:@folders, folders)
        controller.instance_variable_set(:@ght_type, ght_type)
        controller.instance_variable_set(:@report_groups, report_groups)
        controller.instance_variable_set(:@catinfo, catinfo)
        controller.instance_variable_set(:@grid_folders, grid_folders)
        controller.instance_variable_set(:@lastaction, report_lastaction)
        controller.instance_variable_set(:@display, report_display)
        controller.instance_variable_set(:@filters, report_filters)
        controller.instance_variable_set(:@showtype, report_showtype)
        controller.instance_variable_set(:@panels, panels)
        controller.send(:set_session_data)

        expect(controller.session[:report_tab]).to eq(report_tab)
        expect(controller.session[:report_result_id]).to eq(report_result_id)
        expect(controller.session[:report_menu]).to eq(menu)
        expect(controller.session[:report_folders]).to eq(folders)
        expect(controller.session[:ght_type]).to eq(ght_type)
        expect(controller.session[:report_groups]).to eq(report_groups)
        expect(controller.session[:vm_catinfo]).to eq(catinfo)
        expect(controller.session[:report_grid_folders]).to eq(grid_folders)
        expect(controller.session[:report_lastaction]).to eq(report_lastaction)
        expect(controller.session[:report_display]).to eq(report_display)
        expect(controller.session[:report_filters]).to eq(report_filters)
        expect(controller.session[:report_showtype]).to eq(report_showtype)
        expect(controller.session[:panels]).to eq(panels)
      end
    end
  end

  context 'saved reports' do
    describe '#accordion_select?' do
      subject { controller.send(:accordion_select?, param) }

      context 'an accord' do
        let(:param) { "foo_accord" }
        it { is_expected.to be_truthy }
      end

      context 'a number' do
        let(:param) { "1234" }
        it { is_expected.to be_falsey }
      end
    end
  end

  context 'displaying reports' do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      allow(controller).to receive(:server_timezone).and_return('UTC')
      @user2 = create_user_with_group('User2', "Group1", MiqUserRole.find_by(:name => "EvmRole-operator"))
    end

    describe "#print_report" do
      render_views

      let(:report_result_id) do
        report = create_and_generate_report_for_user("Vendor and Guest OS", @user2)
        report.miq_report_results.first.id
      end

      it 'renders the print layout' do
        get :print_report, :params => {:id => report_result_id}
        expect(response).to render_template('layouts/print/report')
      end
    end

    describe "report_print_options" do
      it 'returns the print options' do
        report = create_and_generate_report_for_user("Vendor and Guest OS", @user2)
        result = report.miq_report_results.first

        expect(controller.send(:report_print_options, report, result)).to match(
          :page_layout => 'landscape',
          :page_size   => report.page_size || 'a4',
          :run_date    => format_timezone(result.last_run_on, result.user_timezone, "gtl"),
          :title       => result.name
        )
      end
    end
  end
end
