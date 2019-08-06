describe ReportController, "::Reports" do
  describe "#miq_report_delete" do
    let(:user) { FactoryBot.create(:user, :features => :miq_report_delete) }
    before do
      EvmSpecHelper.local_miq_server # timezone stuff
      login_as user
    end

    it "deletes the report" do
      FactoryBot.create(:miq_report)
      report = FactoryBot.create(:miq_report, :rpt_type => "Custom", :miq_group => user.current_group)
      session['sandboxes'] = {
        controller.controller_name => { :active_tree => 'report_1',
                                        :trees       => {'report_1' => {:active_node => "xx-0_xx-0-0_rep-#{report.id}"}}}
      }

      get :x_button, :params => { :id => report.id, :pressed => 'miq_report_delete' }
      expect(response.status).to eq(200)
      expect(MiqReport.find_by(:id => report.id)).to be_nil
    end

    it "deletes the report name from the group settings hash" do
      report = FactoryBot.create(:miq_report, :rpt_type => "Custom", :miq_group => user.current_group)
      report.miq_group.update(:settings => {"report_menus" => [["foo", [["bar", [report.name]]]]]})
      session['sandboxes'] = {
        controller.controller_name => { :active_tree => 'report_1',
                                        :trees       => {'report_1' => {:active_node => "xx-0_xx-0-0_rep-#{report.id}"}}}
      }

      get :x_button, :params => { :id => report.id, :pressed => 'miq_report_delete' }
      report.miq_group.reload
      expect(response.status).to eq(200)
      expect(MiqReport.find_by(:id => report.id)).to be_nil
      expect(report.miq_group.settings).to eq("report_menus" => [["foo", [["bar", []]]]])
    end

    it "cant delete default reports" do
      FactoryBot.create(:miq_report)
      report = FactoryBot.create(:miq_report, :rpt_type => "Default")
      session['sandboxes'] = {
        controller.controller_name => { :active_tree => 'report_1',
                                        :trees       => {'report_1' => {:active_node => "xx-0_xx-0-0_rep-#{report.id}"}}}
      }

      get :x_button, :params => { :id => report.id, :pressed => 'miq_report_delete' }
      expect(response.status).to eq(200)
      expect(MiqReport.find_by(:id => report.id)).not_to be_nil
    end

    # it "fails if widgets exist" do
    #   report = FactoryBot.create(:miq_report)
    #   FactoryBot.create(:miq_widget, :resource => report)
    # end
  end
end
