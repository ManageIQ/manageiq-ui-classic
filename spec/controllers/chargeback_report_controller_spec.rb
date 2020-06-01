describe ChargebackReportController do
  before { stub_user(:features => :all) }

  context "Saved chargeback rendering" do
    it "Saved chargeback reports renders paginagion buttons correctly" do
      report = FactoryBot.create(:miq_report_with_results, :miq_group => User.current_user.current_group)
      report.extras = {:total_html_rows => 100}
      rr_id = report.miq_report_results[0].id
      html = '<table><thead><tr><th>column 1</th><th>column 2</th></thead><tbody>'
      100.times do
        html += '<tr><td>col1 value</td><td>col2 value</td></tr>'
      end
      html += '</tbody></table>'
      controller.instance_variable_set(:@report, report)
      controller.instance_variable_set(:@html, html)
      controller.instance_variable_set(:@layout, "chargeback_report")
      get(:show, :params => {:id => rr_id})
      expect(response.status).to eq(200)
    end
  end

  describe "#show_list" do
    render_views

    it "can be rendered" do
      get :index
      expect(response.status).to eq(302)
      expect(response).to redirect_to(:action => 'show_list')
    end
  end

  describe "#fetch_saved_report" do
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
      controller.send(:fetch_saved_report, miq_report_result.id)

      fetched_report = controller.instance_variable_get(:@report)

      expect(fetched_report).not_to be_nil
      expect(fetched_report).to eq(chargeback_report)
    end
  end

  context "GenericSessionMixin" do
    let(:lastaction) { 'lastaction' }
    let(:display) { 'display' }

    describe '#get_session_data' do
      it "Sets variables correctly" do
        allow(controller).to receive(:session).and_return(:chargeback_report_lastaction   => lastaction,
                                                          :chargeback_report_display      => display)
        controller.send(:get_session_data)

        expect(controller.instance_variable_get(:@title)).to eq("Chargeback Saved Reports")
        expect(controller.instance_variable_get(:@layout)).to eq("chargeback_report")
        expect(controller.instance_variable_get(:@lastaction)).to eq(lastaction)
        expect(controller.instance_variable_get(:@display)).to eq(display)
      end
    end

    describe '#set_session_data' do
      it "Sets session correctly" do
        controller.instance_variable_set(:@lastaction, lastaction)
        controller.instance_variable_set(:@display, display)
        controller.send(:set_session_data)
        expect(controller.session[:chargeback_report_lastaction]).to eq(lastaction)
        expect(controller.session[:chargeback_report_display]).to eq(display)
      end
    end
  end
end
