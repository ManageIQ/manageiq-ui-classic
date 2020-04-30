describe ChargebackReportController do
  before { stub_user(:features => :all) }

  context "Saved chargeback rendering" do
    it "Saved chargeback reports renders paginagion buttons correctly" do
      report = FactoryBot.create(:miq_report_with_results, :miq_group => User.current_user.current_group)
      report.extras = {:total_html_rows => 100}
      rp_id = report.id
      rr_id = report.miq_report_results[0].id
      node = "xx-#{rp_id}-2_rr-#{rr_id}"
      html = '<table><thead><tr><th>column 1</th><th>column 2</th></thead><tbody>'
      100.times do
        html += '<tr><td>col1 value</td><td>col2 value</td></tr>'
      end
      html += '</tbody></table>'

      allow(controller).to  receive(:cb_rpts_show_saved_report)
      expect(controller).to receive(:render)
      controller.instance_variable_set(:@sb,
                                       :active_tree => :cb_reports_tree,
                                       :trees       => {:cb_reports_tree => {:active_node => node}})
      controller.instance_variable_set(:@report, report)
      controller.instance_variable_set(:@html, html)
      controller.instance_variable_set(:@layout, "chargeback")
      controller.params = {:id => node}
      controller.send(:tree_select)
      expect(response).to                        render_template('layouts/_saved_report_paging_bar')
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.status).to                 eq(200)
    end

    describe "#cb_rpt_build_folder_nodes" do
      let!(:admin_user)        { FactoryBot.create(:user_admin) }
      let!(:chargeback_report) { FactoryBot.create(:miq_report_chargeback_with_results) }

      before { login_as admin_user }

      it "returns list of saved chargeback report results" do
        controller.send(:cb_rpt_build_folder_nodes)

        parent_reports = controller.instance_variable_get(:@parent_reports)

        tree_id = "#{chargeback_report.id}-0"
        expected_result = {chargeback_report.miq_report_results.first.miq_report.name => tree_id}
        expect(parent_reports).to eq(expected_result)
      end
    end
  end

  describe "#explorer" do
    render_views

    it "can be rendered" do
      EvmSpecHelper.create_guid_miq_server_zone
      get :explorer
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end
  end

  describe "#cb_rpts_fetch_saved_report" do
    let(:current_user) { User.current_user }
    let(:miq_task)     { MiqTask.new(:name => "Generate Report result", :userid => current_user.userid) }
    let(:miq_report_result) do
      FactoryBot.create(:miq_chargeback_report_result, :miq_group => current_user.current_group, :miq_task => miq_task)
    end

    let(:chargeback_report) { FactoryBot.create(:miq_report_chargeback, :miq_report_results => [miq_report_result]) }

    before do
      miq_task.state_finished
      miq_report_result.report = chargeback_report.to_hash.merge(:extras=> {:total_html_rows => 100})
      miq_report_result.save
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@settings, :perpage => { :reports => 20 })
    end

    it "fetch existing report" do
      controller.send(:cb_rpts_fetch_saved_report, miq_report_result.id)

      fetched_report = controller.instance_variable_get(:@report)

      expect(fetched_report).not_to be_nil
      expect(fetched_report).to eq(chargeback_report)
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }
    let(:current_page) { 'chargeback_report_current_page' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:chargeback_report_lastaction   => lastaction,
                                                          :chargeback_report_display      => display,
                                                          :chargeback_report_current_page => current_page)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Chargeback Reports")
        expect(controller.instance_variable_get(:@layout)).to eq("chargeback_report")
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(display)
        expect(controller.instance_variable_get(:@current_page)).to eq(current_page)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@display, display)
        controller.instance_variable_set(:@current_page, current_page)
        controller.send(:set_session_data)

        expect(controller.session[:chargeback_report_lastaction]).to eq(lastaction)
        expect(controller.session[:chargeback_report_display]).to eq(display)
        expect(controller.session[:chargeback_report_current_page]).to eq(current_page)
      end
    end
  end
end
