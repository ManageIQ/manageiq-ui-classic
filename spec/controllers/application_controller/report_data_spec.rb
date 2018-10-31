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
    before(:each) do
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
    end
    it "should return report data for VM" do
      controller.instance_variable_set(:@_params, :active_tree => "vandt_tree")
      controller.instance_variable_set(:@_params, :model_name => "manageiq/providers/infra_manager/vms")
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
      controller.instance_variable_set(:@_params, :model_name => "MiqReportResult")
      allow(controller).to receive(:settings_default).with(10, :perpage, :reports).and_return(5)
      report_data = JSON.parse(controller.report_data)
      expect(report_data["settings"]["perpage"]).to eql(5)
    end
  end
end
