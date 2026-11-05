describe ReportController do
  let(:admin_user) { FactoryBot.create(:user, :role => "super_administrator") }
  let(:report) do
    FactoryBot.create(
      :miq_report,
      :name      => "Test Report",
      :title     => "Test Title",
      :db        => "Vm",
      :col_order => %w[name],
      :headers   => ["Name"],
      :rpt_type  => "Custom",
      :rpt_group => "Custom"
    )
  end

  # Not a memoized `let`: several examples make a second request and read its response.
  def body
    response.parsed_body
  end

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as admin_user
    allow(controller).to receive(:assert_privileges)
  end

  describe "#form_data" do
    context "when id is 'new'" do
      it "returns defaults and lookup data with HTTP 200" do
        get :form_data, :params => {:id => "new"}

        expect(response).to have_http_status(:ok)
        expect(body).to include("report", "models", "chart_types", "pdf_page_sizes",
                                "style_classes", "queue_timeout_options", "report_type")
        expect(body["report"]["name"]).to eq("")
        expect(body["report"]["model"]).to be_nil
        expect(body["report_type"]).to eq("standard")
        expect(body["models"]).to be_an(Array)
        expect(body["pdf_page_sizes"]).to be_an(Array)
        # system default entry is first
        expect(body["queue_timeout_options"].first[1]).to be_nil
      end
    end

    context "when id is an existing report" do
      it "returns the report's attributes and HTTP 200" do
        get :form_data, :params => {:id => report.id}

        expect(response).to have_http_status(:ok)
        expect(body["report"]).to include("name" => "Test Report", "title" => "Test Title", "model" => "Vm", "group" => "No")
        expect(body["report"]["col_order"]).to eq(["Vm-name"])
        expect(body["report_type"]).to eq("standard")
      end

      it "includes metadata for the selected columns" do
        get :form_data, :params => {:id => report.id}

        expect(body["field_metadata"]["Vm-name"]).to include("data_type" => "string")
      end

      it "rejects default reports" do
        report.update!(:rpt_type => "Default")

        get :form_data, :params => {:id => report.id}

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context "when copying a report" do
      it "starts a new report named after the source" do
        get :form_data, :params => {:id => "new", :copy_from => report.id}

        expect(response).to have_http_status(:ok)
        expect(body["report"]).to include("record_id" => nil, "name" => "Copy of Test Report")
      end
    end

    it "checks the edit privilege for an existing report" do
      expect(controller).to receive(:assert_privileges).with("miq_report_edit")

      get :form_data, :params => {:id => report.id}
    end

    it "checks the new privilege for a new report" do
      expect(controller).to receive(:assert_privileges).with("miq_report_new")

      get :form_data, :params => {:id => "new"}
    end
  end

  describe "helper endpoints" do
    describe "#available_fields" do
      it "returns the fields of a valid model" do
        allow(MiqExpression).to receive(:reporting_available_fields).with("Vm").and_return([%w[Name Vm-name]])

        get :available_fields, :params => {:model => "Vm"}

        expect(response).to have_http_status(:ok)
        expect(body["fields"]).to eq([%w[Name Vm-name]])
        expect(body["field_metadata"]["Vm-name"]).to include("data_type" => "string")
      end

      it "rejects a blank model" do
        get :available_fields, :params => {:model => ""}

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body).to include("success" => false, "message" => "Invalid or missing model")
      end

      it "rejects an unknown model" do
        get :available_fields, :params => {:model => "NotAModel"}

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body).to include("success" => false, "message" => "Invalid or missing model")
      end

      it "accepts either the new or the edit privilege" do
        expect(controller).to receive(:assert_privileges).with("miq_report_new", "miq_report_edit")

        get :available_fields, :params => {:model => "Vm"}
      end
    end

    describe "#trend_limit_cols" do
      it "returns an empty list without a trend column" do
        get :trend_limit_cols

        expect(body["limit_cols"]).to eq([])
      end

      it "returns the limit columns of a trend column" do
        expect(VimPerformanceTrend).to receive(:trend_limit_cols)
          .with("VmPerformance", "cpu_usagemhz_rate_average", "daily").and_return([%w[Max max_cpu]])

        get :trend_limit_cols, :params => {:trend_col => "VmPerformance-cpu_usagemhz_rate_average", :perf_interval => "daily"}

        expect(body["limit_cols"]).to eq([%w[Max max_cpu]])
      end
    end

    describe "#chargeback_options" do
      it "returns the option lists for a chargeback model" do
        get :chargeback_options, :params => {:model => "ChargebackVm"}

        expect(response).to have_http_status(:ok)
        expect(body).to include("users", "tenants", "categories", "tag_values", "timezones")
        expect(body["cb_model"]).to eq("Vm")
      end

      it "rejects a model that is not chargeback" do
        get :chargeback_options, :params => {:model => "Vm"}

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body).to include("success" => false, "message" => "Invalid or non-chargeback model")
      end
    end

    describe "#chargeback_entities" do
      let(:project) { FactoryBot.create(:container_project) }
      let(:provider) { FactoryBot.create(:ems_container).tap { |ems| ems.container_projects = [project] } }

      it "returns the projects of a provider" do
        get :chargeback_entities, :params => {:provider_id => provider.id, :model => "ChargebackContainerProject"}

        expect(body["entities"]).to eq([[project.name, project.id.to_s]])
      end

      it "returns nothing without a provider" do
        get :chargeback_entities, :params => {:model => "ChargebackContainerProject"}

        expect(body["entities"]).to eq([])
      end
    end

    context "without the privileges" do
      before { allow(controller).to receive(:assert_privileges).and_call_original }

      it "denies a user with neither the new nor the edit privilege" do
        EvmSpecHelper.seed_specific_product_features(%w[miq_report_new miq_report_edit miq_report_run])
        login_as FactoryBot.create(:user, :features => %w[miq_report_run])

        get :available_fields, :params => {:model => "Vm"}

        expect(response).to redirect_to(:controller => "dashboard", :action => "auth_error")
      end

      it "allows a user with only the edit privilege" do
        EvmSpecHelper.seed_specific_product_features(%w[miq_report_new miq_report_edit])
        login_as FactoryBot.create(:user, :features => %w[miq_report_edit])

        get :available_fields, :params => {:model => "Vm"}

        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe "editor RBAC pairing" do
    let(:auth_error) { redirect_to(:controller => "dashboard", :action => "auth_error") }
    let(:editor_requests) do
      {
        "new"                 => -> { get :new },
        "edit"                => -> { get :edit, :params => {:id => report.id} },
        "copy"                => -> { get :copy, :params => {:id => report.id} },
        "form_data"           => -> { get :form_data, :params => {:id => "new"} },
        "available_fields"    => -> { get :available_fields, :params => {:model => "Vm"} },
        "save"                => -> { post :save, :params => {:report_data => {:name => "x"}} },
        "preview"             => -> { post :preview, :params => {:report_data => {:model => "Vm"}} },
        "preview_result"      => -> { get :preview_result, :params => {:task_id => 1} },
        "trend_limit_cols"    => -> { get :trend_limit_cols, :params => {:id => "VimPerformanceTrend"} },
        "chargeback_options"  => -> { get :chargeback_options, :params => {:model => "ChargebackVm"} },
        "chargeback_entities" => -> { get :chargeback_entities, :params => {:model => "ChargebackContainerProject"} }
      }
    end

    before { EvmSpecHelper.seed_specific_product_features(%w[miq_report_new miq_report_edit miq_report_copy miq_report_run]) }

    it "denies every editor action to a user without the editor features" do
      login_as FactoryBot.create(:user, :features => %w[miq_report_run])

      editor_requests.each do |action, request|
        instance_exec(&request)
        expect(response).to(auth_error, "expected #{action} to be denied")
      end
    end

    it "lets a user with only miq_report_new reach the actions shared by new and edit" do
      login_as FactoryBot.create(:user, :features => %w[miq_report_new])

      %w[new form_data available_fields save preview].each do |action|
        instance_exec(&editor_requests[action])
        expect(response).not_to(auth_error, "expected #{action} to be allowed")
      end
    end

    it "denies edit to a user with only miq_report_new" do
      login_as FactoryBot.create(:user, :features => %w[miq_report_new])

      get :edit, :params => {:id => report.id}

      expect(response).to auth_error
    end

    it "denies new to a user with only miq_report_edit" do
      login_as FactoryBot.create(:user, :features => %w[miq_report_edit])

      get :new

      expect(response).to auth_error
    end

    it "denies copy to a user without miq_report_copy" do
      login_as FactoryBot.create(:user, :features => %w[miq_report_new])

      get :copy, :params => {:id => report.id}

      expect(response).to auth_error
    end
  end

  describe "#save" do
    let(:report_data) do
      {
        :name      => "New Report",
        :title     => "New Title",
        :model     => "Vm",
        :col_order => %w[Vm-name Vm-os_image_name],
        :headers   => %w[Name OS]
      }
    end

    def save(data = report_data, report_id: nil)
      post :save, :params => {:id => report_id, :report_data => data}.compact
    end

    def saved_report
      MiqReport.find(body["id"])
    end

    it "creates the report" do
      save

      expect(response).to have_http_status(:ok)
      expect(body["success"]).to be(true)
      expect(saved_report).to have_attributes(
        :name => "New Report", :db => "Vm", :rpt_type => "Custom", :col_order => %w[name os_image_name],
        :cols => %w[name os_image_name], :headers => %w[Name OS]
      )
    end

    it "updates an existing report" do
      save(report_data.merge(:name => "Updated"), :report_id => report.id)

      expect(body["success"]).to be(true)
      expect(body["id"]).to eq(report.id)
      expect(report.reload.name).to eq("Updated")
    end

    it "records an audit event" do
      expect(AuditEvent).to receive(:success).with(hash_including(:event => "miqreport_record_add"))

      save
    end

    it "renames the report in the group menus" do
      expect(controller).to receive(:menu_repname_update).with("Test Report", "Updated")

      save(report_data.merge(:name => "Updated"), :report_id => report.id)
    end

    it "rejects a missing report_data" do
      post :save

      expect(response).to have_http_status(:unprocessable_entity)
      expect(body["success"]).to be(false)
    end

    it "refuses to edit a default report" do
      report.update!(:rpt_type => "Default")

      save(report_data, :report_id => report.id)

      expect(response).to have_http_status(:unprocessable_entity)
      expect(report.reload.name).to eq("Test Report")
    end

    it "requires at least one field" do
      save(report_data.merge(:col_order => [], :headers => []))

      expect(response).to have_http_status(:unprocessable_entity)
      expect(body["message"]).to include("At least one Field must be selected")
    end

    it "accepts the model as a {value, label} object" do
      save(report_data.merge(:model => {:value => "Vm", :label => "VMs"}))

      expect(saved_report.db).to eq("Vm")
    end

    it "keeps the rpt_options the editor does not manage" do
      report.update!(:rpt_options => {:custom_key => "kept", :pdf => {:page_size => "A4", :other => 1}})

      save(report_data, :report_id => report.id)

      expect(report.reload.rpt_options).to include(:custom_key => "kept")
      expect(report.rpt_options[:pdf]).to include(:other => 1, :page_size => "US-Letter")
    end

    it "stores no format for a blank format and the raw format for _none_" do
      save(report_data.merge(:col_formats => ["", "_none_"]))

      expect(saved_report.col_formats).to eq([nil, :_none_])
    end

    context "with related table columns" do
      let(:related) do
        report_data.merge(:col_order => %w[Vm-name Vm.host-name Vm.host.hardware-cpu_speed], :headers => %w[Name Host Speed])
      end

      it "stores them as dotted columns and includes" do
        save(related)

        expect(saved_report).to have_attributes(
          :cols      => %w[name],
          :col_order => %w[name host.name host.hardware.cpu_speed],
          :include   => {"host" => {"columns" => %w[name], "include" => {"hardware" => {"columns" => %w[cpu_speed]}}}}
        )
      end

      it "returns the original field ids when the report is loaded again" do
        save(related)

        get :form_data, :params => {:id => body["id"]}

        expect(body["report"]["col_order"]).to eq(related[:col_order])
      end
    end

    context "with sorting" do
      let(:sorted) { report_data.merge(:sortby => %w[Vm-name Vm-os_image_name], :order => "Descending") }

      it "stores 'y' for Yes" do
        save(sorted.merge(:group => "Yes"))

        expect(saved_report).to have_attributes(:sortby => %w[name os_image_name], :order => "Descending", :group => "y")
      end

      it "stores 'c' for Counts" do
        save(sorted.merge(:group => "Counts"))

        expect(saved_report.group).to eq("c")
      end

      it "stores no group for No" do
        save(sorted.merge(:group => "No"))

        expect(saved_report.group).to be_nil
      end

      it "ignores group and order when there is no sort field" do
        save(report_data.merge(:sortby => ["<<<Nothing>>>"], :group => "Yes", :order => "Descending"))

        expect(saved_report).to have_attributes(:sortby => nil, :group => nil, :order => nil)
      end

      it "appends the break suffix to the sort column" do
        save(report_data.merge(:col_order => ["Vm-created_on"], :headers => ["Created"], :sortby => ["Vm-created_on"], :sort1_suffix => "week"))

        expect(saved_report.sortby).to eq(%w[created_on__week])
      end

      it "stores the summary row format under the sort column" do
        save(sorted.merge(:break_format => "general_number_precision_0"))

        expect(saved_report.col_options["name"]).to include(:break_format => :general_number_precision_0)
      end

      it "keeps the hidden-rows option and drops the row limit when grouping" do
        save(sorted.merge(:group => "Yes", :hide_details => true, :row_limit => 10))

        expect(saved_report.rpt_options).to include(:summary => {:hide_detail_rows => true})
        expect(saved_report.rpt_options).not_to have_key(:row_limit)
      end

      it "keeps the row limit and drops the summary options without grouping" do
        save(sorted.merge(:group => "No", :hide_details => true, :row_limit => 10))

        expect(saved_report.rpt_options).to include(:row_limit => 10)
        expect(saved_report.rpt_options).not_to have_key(:summary)
      end

      it "loads the sort settings the way the editor expects them" do
        save(sorted.merge(:group => "Yes"))

        get :form_data, :params => {:id => body["id"]}

        expect(body["report"]).to include(
          "sortby" => %w[Vm-name Vm-os_image_name], "group" => "Yes", "order" => "Descending"
        )
      end
    end

    context "with a chart" do
      let(:charted) do
        report_data.merge(:sortby => %w[Vm-name Vm-os_image_name], :graph_type => "StackedBar", :graph_mode => "counts", :graph_count => "5", :graph_other => true)
      end

      it "stores two dimensions for two sort fields" do
        save(charted)

        expect(saved_report.dims).to eq(2)
        expect(saved_report.graph).to include(:type => "StackedBar", :mode => "counts", :count => 5, :other => true)
      end

      it "stores one dimension for pie and donut charts" do
        save(charted.merge(:graph_type => "Donut"))

        expect(saved_report.dims).to eq(1)
      end

      it "clears the chart when no chart type is selected" do
        report.update!(:graph => {:type => "Bar"}, :dims => 1)

        save(charted.merge(:graph_type => ""), :report_id => report.id)

        expect(report.reload).to have_attributes(:graph => nil, :dims => nil)
      end

      it "requires a sort field" do
        save(charted.merge(:sortby => []))

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body["message"]).to include("A sort field is required")
      end

      it "requires a data column in values mode" do
        save(charted.merge(:graph_mode => "values", :graph_column => ""))

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body["message"]).to include("Data column must be selected")
      end
    end

    context "with consolidation" do
      let(:pivoted) do
        report_data.merge(
          :col_order => %w[Vm-name Vm-mem_cpu], :headers => %w[Name Memory],
          :pivot_by1 => "Vm-name", :pivot_cols => {"Vm-mem_cpu" => %w[avg total]}
        )
      end

      it "stores the calculation columns and the group columns" do
        save(pivoted)

        expect(saved_report).to have_attributes(
          :col_order => %w[name mem_cpu__avg mem_cpu__total],
          :headers   => ["Name", "Memory (Avg)", "Memory (Total)"],
          :cols      => %w[name mem_cpu]
        )
        expect(saved_report.rpt_options[:pivot]).to eq(:group_cols => %w[name])
      end

      it "returns the group fields and calculations when loaded again" do
        save(pivoted)

        get :form_data, :params => {:id => body["id"]}

        expect(body["report"]).to include(
          "col_order" => %w[Vm-name Vm-mem_cpu], "headers" => %w[Name Memory],
          "pivot_by1" => "Vm-name", "pivot_by2" => "<<<Nothing>>>", "pivot_cols" => {"Vm-mem_cpu" => %w[avg total]}
        )
      end

      it "ignores calculations that core does not know" do
        save(pivoted.merge(:pivot_cols => {"Vm-mem_cpu" => %w[first]}))

        expect(saved_report.col_order).to eq(%w[name mem_cpu])
      end

      it "stores no pivot options without group columns" do
        save(pivoted.merge(:pivot_by1 => "<<<Nothing>>>"))

        expect(saved_report.rpt_options).not_to have_key(:pivot)
      end
    end

    context "with a performance report" do
      let(:perf) do
        {
          :name          => "Perf",
          :title         => "Perf",
          :model         => "VmPerformance",
          :col_order     => ["VmPerformance-cpu_usage_rate_average"],
          :headers       => ["CPU"],
          :perf_interval => "daily",
          :perf_avgs     => "active_data",
          :perf_end      => "86400",
          :perf_start    => "604800"
        }
      end

      it "stores the interval, averaging and absolute offsets" do
        save(perf)

        expect(saved_report.db_options).to eq(
          :interval => "daily", :calc_avgs_by => "active_data", :end_offset => 86_400, :start_offset => 691_200
        )
      end

      it "defaults calc_avgs_by to time_interval" do
        save(perf.except(:perf_avgs))

        expect(saved_report.db_options[:calc_avgs_by]).to eq("time_interval")
      end

      it "returns the start relative to the end when loaded again" do
        save(perf)

        get :form_data, :params => {:id => body["id"]}

        expect(body["report_type"]).to eq("performance")
        expect(body["report"]["perf_start"]).to eq(604_800)
        expect(body["report"]["db_options"]).to include("end_offset" => 86_400, "start_offset" => 691_200)
      end
    end

    context "with a trend report" do
      let(:trend) do
        {
          :name            => "Trend",
          :title           => "Trend",
          :model           => "VimPerformanceTrend",
          :perf_interval   => "daily",
          :perf_end        => "0",
          :perf_start      => "86400",
          :trend_col       => "VmPerformance-cpu_usage_rate_average",
          :trend_limit_col => "max_cpu",
          :trend_pct1      => "100",
          :trend_pct2      => "50"
        }
      end

      it "stores the trend options and forces the sort" do
        save(trend)

        expect(saved_report.db_options).to include(
          :rpt_type => "trend", :trend_db => "VmPerformance", :trend_col => "cpu_usage_rate_average",
          :limit_col => "max_cpu", :target_pcts => [100, 50], :start_offset => 86_400
        )
        expect(saved_report).to have_attributes(:sortby => %w[resource_name], :order => "Ascending")
      end

      it "requires the trended column and a limit" do
        save(trend.except(:trend_col, :trend_limit_col))

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body["message"]).to include("Trending for is required", "Trend Target Limit must be configured")
      end

      it "requires a numeric limit value" do
        save(trend.merge(:trend_limit_col => "", :trend_limit_val => "abc"))

        expect(body["message"]).to include("Trend Target Limit must be numeric")
      end
    end

    context "with a chargeback report" do
      let(:chargeback) do
        {
          :name                         => "CB",
          :title                        => "CB",
          :model                        => "ChargebackVm",
          :cb_show_typ                  => "tag",
          :cb_tag_cat                   => "environment",
          :cb_tag_value                 => %w[prod dev],
          :cb_groupby                   => "date",
          :cb_interval                  => "daily",
          :cb_interval_size             => "7",
          :cb_end_interval_offset       => "1",
          :cb_include_metrics           => true,
          :method_for_allocated_metrics => "avg",
          :cumulative_rate_calculation  => true,
          :col_order                    => ["ChargebackVm-cpu_cost"],
          :headers                      => ["CPU Cost"]
        }
      end

      it "stores the options with full tag paths and the static report columns" do
        save(chargeback)

        expect(saved_report.db_options).to include(:rpt_type => "ChargebackVm")
        expect(saved_report.db_options[:options]).to include(
          :tag => %w[/managed/environment/prod /managed/environment/dev], :interval => "daily", :interval_size => 7,
          :end_interval_offset => 1, :method_for_allocated_metrics => :avg, :include_metrics => true, :groupby => "date"
        )
        expect(saved_report).to have_attributes(:group => "y", :order => "Ascending")
        expect(saved_report.sortby).to include("start_date")
        expect(saved_report.col_order).to include("display_range")
      end

      it "returns the tag category and values when loaded again" do
        save(chargeback)

        get :form_data, :params => {:id => body["id"]}

        expect(body["report_type"]).to eq("chargeback")
        expect(body["report"]["db_options"]["options"]).to include("tag" => ["environment", %w[prod dev]])
      end

      it "requires the cost filter" do
        save(chargeback.except(:cb_show_typ))

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body["message"]).to include("Show Costs by must be selected")
      end

      it "requires a tag when grouping by tag" do
        save(chargeback.merge(:cb_groupby => "tag", :cb_groupby_tag => []))

        expect(body["message"]).to include("A Group by Tag must be selected")
      end

      it "stores the owner" do
        save(chargeback.merge(:cb_show_typ => "owner", :cb_owner_id => "admin"))

        expect(saved_report.db_options[:options]).to include(:owner => "admin")
      end
    end

    context "with column styling" do
      let(:styled) do
        report_data.merge(:col_order => ["Vm-num_cpu"], :headers => ["CPUs"])
      end

      it "rejects a style value that does not fit the column" do
        save(styled.merge(:col_options => {"Vm-num_cpu" => {:style => [{:class => "miq_rpt_red_text", :operator => "=", :value => "abc"}]}}))

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body["message"]).to include("Styling for 'CPUs', first value is in error")
      end

      it "stores styles and group calculations under the column name" do
        save(styled.merge(:col_options => {"Vm-num_cpu" => {:header => "CPUs", :grouping => %w[total], :style => [{:class => "miq_rpt_red_text", :operator => "DEFAULT"}]}}))

        expect(saved_report.col_options).to eq(
          "num_cpu" => {:grouping => [:total], :style => [{:class => :miq_rpt_red_text, :operator => "DEFAULT"}]}
        )
      end
    end

    context "with filters" do
      let(:filter) { {"=" => {"field" => "Vm-name", "value" => "a"}} }

      it "stores the record and display filters" do
        save(report_data.merge(:record_filter => filter, :display_filter => filter))

        expect(saved_report.conditions.exp).to eq(filter)
        expect(saved_report.display_filter.exp).to eq(filter)
      end

      it "treats the empty placeholder as no filter" do
        save(report_data.merge(:record_filter => {"???" => "???"}))

        expect(saved_report.conditions).to be_nil
      end
    end

    it "checks the new privilege for a new report" do
      expect(controller).to receive(:assert_privileges).with("miq_report_new")

      save
    end

    it "checks the edit privilege for an existing report" do
      expect(controller).to receive(:assert_privileges).with("miq_report_edit")

      save(report_data, :report_id => report.id)
    end
  end

  describe "#preview" do
    let(:preview_params) { {:report_data => {:model => {:value => "Vm", :label => "VMs"}, :col_order => ["Vm-name"], :headers => ["Name"]}} }

    it "returns an empty result without columns" do
      post :preview, :params => {:report_data => {:model => "Vm", :col_order => []}}

      expect(body).to eq("columns" => [], "rows" => [])
    end

    it "rejects a missing report_data" do
      post :preview

      expect(response).to have_http_status(:unprocessable_entity)
    end

    it "queues the generation instead of running it in the request" do
      expect_any_instance_of(MiqReport).not_to receive(:generate_table)

      expect do
        post :preview, :params => preview_params
      end.to change { MiqQueue.where(:method_name => "_async_generate_table").count }.by(1)

      expect(response).to have_http_status(:ok)
      expect(body["task_id"]).to eq(MiqTask.last.id)
      expect(MiqReport.count).to eq(0)
    end

    it "limits the queued report to the preview rows" do
      expect_any_instance_of(MiqReport).to receive(:async_generate_table).with(hash_including(:limit => described_class::PREVIEW_ROW_LIMIT)).and_return(42)

      post :preview, :params => preview_params

      expect(body["task_id"]).to eq(42)
    end
  end

  describe "#preview_result" do
    let(:task) { FactoryBot.create(:miq_task, :state => state, :status => "Ok") }
    let(:state) { MiqTask::STATE_ACTIVE }

    def start_preview_session(task_id)
      session[:report_preview_task_id] = task_id
    end

    def attach_finished_report_result(task)
      rpt = MiqReport.new(:name => "Preview", :title => "Preview", :db => "Vm", :cols => %w[name], :col_order => %w[name], :headers => ["Name"])
      FactoryBot.create(:vm_vmware, :name => "preview-vm")
      rpt.generate_table(:userid => "admin")
      # Same as MiqReport#_async_generate_table: the result is attached to the task
      task.miq_report_result = rpt.build_create_results({:userid => "admin|session|adhoc", :report_source => "Generated by user"}, task.id)
      task.save!
    end

    it "reports that the report is still being generated" do
      start_preview_session(task.id)

      get :preview_result, :params => {:task_id => task.id}

      expect(response).to have_http_status(:ok)
      expect(body).to eq("complete" => false)
      expect(MiqTask.exists?(task.id)).to be(true)
    end

    context "when the task has finished" do
      let(:state) { MiqTask::STATE_FINISHED }

      it "returns the columns and rows, and removes the task and its result" do
        attach_finished_report_result(task)
        start_preview_session(task.id)

        get :preview_result, :params => {:task_id => task.id}

        expect(response).to have_http_status(:ok)
        expect(body).to include("complete" => true, "columns" => ["Name"], "col_keys" => ["name"])
        expect(body["rows"]).to include(["preview-vm"])
        expect(MiqTask.exists?(task.id)).to be(false)
        expect(MiqReportResult.where(:miq_task_id => task.id)).to be_empty
      end

      it "returns a generic message and logs the cause when generation failed" do
        task.update!(:status => "Error", :message => "secret internal detail")
        start_preview_session(task.id)
        expect($log).to receive(:error).with(/secret internal detail/)

        get :preview_result, :params => {:task_id => task.id}

        expect(response).to have_http_status(:unprocessable_entity)
        expect(body["success"]).to be(false)
        expect(body["message"]).not_to include("secret internal detail")
        expect(MiqTask.exists?(task.id)).to be(false)
      end

      it "can only be read once" do
        attach_finished_report_result(task)
        start_preview_session(task.id)

        get :preview_result, :params => {:task_id => task.id}
        get :preview_result, :params => {:task_id => task.id}

        expect(response).to have_http_status(:not_found)
      end
    end

    it "does not expose a task that this session did not start" do
      other_task = FactoryBot.create(:miq_task, :state => MiqTask::STATE_FINISHED, :status => "Ok")
      start_preview_session(task.id)

      get :preview_result, :params => {:task_id => other_task.id}

      expect(response).to have_http_status(:not_found)
      expect(MiqTask.exists?(other_task.id)).to be(true)
    end

    it "returns not found when no preview was started" do
      get :preview_result, :params => {:task_id => task.id}

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "#miq_report_copy" do
    it "redirects to the copy action when pressing miq_report_copy" do
      expect(controller).to receive(:assert_privileges).with("miq_report_copy")
      expect(controller).to receive(:javascript_redirect).with(:controller => "report", :action => "copy", :id => report.id.to_s)

      post :x_button, :params => {:pressed => "miq_report_copy", :id => report.id}
    end
  end

  describe "report editor pages" do
    render_views

    it "renders the editor for a new report" do
      get :new

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("ReportEditor")
      expect(response.body).not_to include("copyFrom")
    end

    it "renders the editor for an existing report" do
      get :edit, :params => {:id => report.id}

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("ReportEditor")
    end

    it "passes the source report when copying and checks privileges" do
      expect(controller).to receive(:assert_privileges).with("miq_report_copy")
      expect(controller).to receive(:assert_privileges).with("miq_report_new")

      get :copy, :params => {:id => report.id}

      expect(response).to have_http_status(:ok)
      expect(response.body).to include("ReportEditor")
      expect(response.body).to include("copyFrom")
      expect(response.body).to include(report.id.to_s)
    end

    it "refuses to edit a default report" do
      report.update!(:rpt_type => "Default")

      get :edit, :params => {:id => report.id}

      expect(response).to redirect_to(:action => "explorer")
    end
  end

  describe "#reportable_models" do
    subject { controller.send(:reportable_models) }

    it "does not contain duplicate items" do
      duplicates = subject.group_by(&:first).select { |_, v| v.size > 1 }.map(&:first)
      expect(duplicates).to be_empty
    end
  end

  # The React editor derives the report type from the model name in
  # app/javascript/components/report-editor/utils.ts (modelToReportType).
  # Keep this table identical to the one in app/javascript/spec/report-editor/utils.spec.js.
  describe "#report_type_for_model" do
    let(:report_type_examples) do
      {
        "standard"    => %w[Vm Host MiqTemplate ContainerImage],
        "performance" => %w[
          ContainerGroupPerformance ContainerNodePerformance ContainerPerformance ContainerProjectPerformance
          EmsClusterPerformance ExtManagementSystemPerformance HostPerformance StoragePerformance VmPerformance
        ],
        "trend"       => %w[VimPerformanceTrend],
        "chargeback"  => %w[
          ChargebackConfiguredSystem ChargebackContainerImage ChargebackContainerProject ChargebackVm
          MeteringContainerImage MeteringContainerProject MeteringVm
        ]
      }
    end

    it "maps every example model to its report type" do
      report_type_examples.each do |report_type, models|
        models.each do |model|
          expect(controller.send(:report_type_for_model, model)).to eq(report_type), "expected #{model} to be #{report_type}"
        end
      end
    end

    it "treats a missing model as a standard report" do
      expect(controller.send(:report_type_for_model, nil)).to eq("standard")
    end

    it "lists every reportable special-case model, so the JS table cannot silently go stale" do
      special = MiqReport.reportable_models.grep(/Chargeback|Metering|Performance|MetricsRollup|Trend/)

      expect(special - report_type_examples.values.flatten).to be_empty
    end
  end
end
