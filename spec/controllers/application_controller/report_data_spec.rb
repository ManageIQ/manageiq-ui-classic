describe ApplicationController do
  let(:basic_settings) do
    {
      "perpage"  => 10,
      "current"  => 1,
      "items"    => 0,
      "total"    => 0,
      "sort_dir" => "ASC",
      "sort_col" => 0
    }
  end

  before do
    stub_user(:features => :all)
  end

  context "#report_data" do
    before do
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
    end
    it "should return report data for VM" do
      controller.params = {:active_tree => "vandt_tree"}
      controller.params = {:model_name => "manageiq/providers/infra_manager/vms"}
      report_data = JSON.parse(controller.report_data)
      expect(report_data["settings"]).to eql(basic_settings)
      headder = report_data["data"]["head"]
      expect(headder[0]).to eql("is_narrow" => true)
      expect(headder[1]).to eql("is_narrow"=>true)
      expect(headder[2]).to eql("text" => "Name", "sort" => "str", "col_idx" => 0, "align" => "left")
      expect(headder[3]).to eql("text" => "Power State", "sort" => "str", "col_idx" => 1, "align" => "left")
      expect(headder[4]).to eql("text" => "Provider", "sort" => "str", "col_idx" => 2, "align" => "left")
      expect(headder[5]).to eql("text" => "Cluster", "sort" => "str", "col_idx" => 3, "align" => "left")
    end

    it "should call specific functions" do
      expect(controller).to receive(:from_additional_options).and_return({})
      expect(controller).to receive(:process_params_options).and_call_original
      expect(controller).to receive(:process_params_model_view)
      expect(controller).to receive(:get_view)
      expect(controller).to receive(:view_to_hash)
      controller.report_data
    end

    it "should have default number of perpage records set for reports" do
      controller.params = {:model_name => "MiqReportResult"}
      allow(controller).to receive(:settings_default).with(10, :perpage, :reports).and_return(5)
      report_data = JSON.parse(controller.report_data)
      expect(report_data["settings"]["perpage"]).to eql(5)
    end

    it "use report_name when is passed" do
      report_name = "ProvisionCloudTemplates.yaml"
      path_to_report = ManageIQ::UI::Classic::Engine.root.join("product", "views", report_name).to_s
      view = MiqReport.new(YAML.load(File.open(path_to_report)))
      expect(controller).to_not receive(:get_db_view)
      controller.params = {:active_tree => "instances_tree"}
      controller.params = {:model_name => "ManageIQ::Providers::CloudManager::Template"}
      controller.params = {:additional_options => { "report_name" => report_name }}
      controller.report_data
      expect(assigns(:view).cols).to eq(view.cols)
    end
  end
end
