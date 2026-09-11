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

  before do
    EvmSpecHelper.create_guid_miq_server_zone
    login_as admin_user
    allow(controller).to receive(:assert_privileges)
  end

  # ---------------------------------------------------------------------------
  # GET /report/react_form_data
  # ---------------------------------------------------------------------------
  describe "#react_form_data" do
    context "when id is 'new'" do
      it "returns defaults and lookup data with HTTP 200" do
        get :react_form_data, :params => {:id => "new"}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)

        expect(body).to include("report", "models", "chart_types", "pdf_page_sizes",
                                "style_classes", "queue_timeout_options", "report_type")
        expect(body["report"]["name"]).to eq("")
        expect(body["report"]["model"]).to be_nil
        expect(body["report_type"]).to eq("standard")
        expect(body["models"]).to be_an(Array)
        expect(body["pdf_page_sizes"]).to be_an(Array)
        expect(body["queue_timeout_options"]).to be_an(Array)
        # system default entry is first
        expect(body["queue_timeout_options"].first[1]).to be_nil
      end
    end

    context "when id is an existing report" do
      it "returns the report's attributes and HTTP 200" do
        get :react_form_data, :params => {:id => report.id}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)

        expect(body["report"]["name"]).to eq("Test Report")
        expect(body["report"]["title"]).to eq("Test Title")
        expect(body["report"]["model"]).to eq("Vm")
        expect(body["report_type"]).to eq("standard")
      end
    end

    context "when the user lacks privileges" do
      it "raises an error (assert_privileges is called)" do
        allow(controller).to receive(:assert_privileges).and_call_original
        expect(controller).to receive(:assert_privileges).with("miq_report_edit")

        get :react_form_data, :params => {:id => report.id}
      end
    end

    context "when the user lacks privileges for new" do
      it "calls assert_privileges with miq_report_new" do
        expect(controller).to receive(:assert_privileges).with("miq_report_new")

        get :react_form_data, :params => {:id => "new"}
      end
    end
  end

  # ---------------------------------------------------------------------------
  # GET /report/react_available_fields
  # ---------------------------------------------------------------------------
  describe "#react_available_fields" do
    context "when a valid model is given" do
      it "returns a fields array and HTTP 200" do
        allow(MiqExpression).to receive(:reporting_available_fields).with("Vm").and_return(
          [["Name", "Vm-name"], ["CPUs", "Vm-num_cpu"]]
        )
        get :react_available_fields, :params => {:model => "Vm"}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["fields"]).to be_an(Array)
        expect(body["fields"]).to include(["Name", "Vm-name"])
      end
    end

    context "when model is blank" do
      it "returns HTTP 422 with an error message" do
        get :react_available_fields, :params => {:model => ""}

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body).to have_key("error")
      end
    end

    context "when model is not in the reportable list" do
      it "returns HTTP 422 with an error message" do
        get :react_available_fields, :params => {:model => "NotAModel"}

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body).to have_key("error")
      end
    end

    context "privilege check" do
      it "calls assert_privileges with miq_report_new" do
        expect(controller).to receive(:assert_privileges).with("miq_report_new")

        get :react_available_fields, :params => {:model => "Vm"}
      end
    end
  end

  # ---------------------------------------------------------------------------
  # POST /report/react_save
  # ---------------------------------------------------------------------------
  describe "#react_save" do
    let(:valid_report_data) do
      {
        :name      => "New Report",
        :title     => "New Title",
        :model     => "Vm",
        :col_order => ["name"],
        :headers   => ["Name"],
      }
    end

    context "when creating a new report (no id)" do
      it "creates the report and returns success JSON" do
        post :react_save, :params => {:report_data => valid_report_data}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["success"]).to be(true)
        expect(body).to have_key("id")
        expect(MiqReport.find(body["id"]).name).to eq("New Report")
      end
    end

    context "when updating an existing report" do
      it "updates the report and returns success JSON" do
        post :react_save, :params => {:id => report.id, :report_data => valid_report_data.merge(:name => "Updated")}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["success"]).to be(true)
        expect(body["id"]).to eq(report.id)
        expect(report.reload.name).to eq("Updated")
      end
    end

    context "when report_data is missing" do
      it "returns HTTP 422" do
        post :react_save, :params => {}

        expect(response).to have_http_status(:unprocessable_entity)
        body = JSON.parse(response.body)
        expect(body["success"]).to be(false)
      end
    end

    context "privilege check for new" do
      it "calls assert_privileges with miq_report_new" do
        expect(controller).to receive(:assert_privileges).with("miq_report_new")

        post :react_save, :params => {:report_data => valid_report_data}
      end
    end

    context "privilege check for edit" do
      it "calls assert_privileges with miq_report_edit" do
        expect(controller).to receive(:assert_privileges).with("miq_report_edit")

        post :react_save, :params => {:id => report.id, :report_data => valid_report_data}
      end
    end

    context "when saving a performance report with perf_avgs" do
      let(:perf_report_data) do
        {
          :name         => "Perf Report",
          :title        => "Perf Title",
          :model        => "VmPerformance",
          :col_order    => ["name"],
          :headers      => ["Name"],
          :perf_interval => "daily",
          :perf_avgs     => "active_data",
          :perf_end      => "1",
          :perf_start    => "86400",
        }
      end

      it "saves calc_avgs_by from perf_avgs to db_options" do
        post :react_save, :params => {:report_data => perf_report_data}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        expect(body["success"]).to be(true)
        saved = MiqReport.find(body["id"])
        expect(saved.db_options[:calc_avgs_by]).to eq("active_data")
        expect(saved.db_options[:interval]).to eq("daily")
      end

      it "defaults calc_avgs_by to time_interval when perf_avgs is absent" do
        post :react_save, :params => {:report_data => perf_report_data.except(:perf_avgs)}

        expect(response).to have_http_status(:ok)
        body = JSON.parse(response.body)
        saved = MiqReport.find(body["id"])
        expect(saved.db_options[:calc_avgs_by]).to eq("time_interval")
      end
    end
  end

  # ---------------------------------------------------------------------------
  # GET /report/react_form_data — performance report round-trip
  # ---------------------------------------------------------------------------
  describe "#react_form_data for a performance report" do
    let(:perf_report) do
      FactoryBot.create(
        :miq_report,
        :name      => "Perf Report",
        :db        => "VmPerformance",
        :col_order => %w[name],
        :headers   => ["Name"],
        :rpt_type  => "Custom",
        :rpt_group => "Custom",
        :db_options => { :interval => "hourly", :calc_avgs_by => "active_data" }
      )
    end

    it "returns report_type=performance and exposes db_options with calc_avgs_by" do
      get :react_form_data, :params => {:id => perf_report.id}

      expect(response).to have_http_status(:ok)
      body = JSON.parse(response.body)
      expect(body["report_type"]).to eq("performance")
      db_opts = body["report"]["db_options"]
      expect(db_opts["calc_avgs_by"]).to eq("active_data")
      expect(db_opts["interval"]).to eq("hourly")
    end
  end
end
