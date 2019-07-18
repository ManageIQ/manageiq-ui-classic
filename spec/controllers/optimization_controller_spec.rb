describe OptimizationController do
  render_views

  before do
    login_as user_with_feature(%w(optimization))
    EvmSpecHelper.local_miq_server
  end

  describe '.hardcoded_reports' do
    before do
      MiqReport.seed
    end

    it "finds all the reports" do
      expect { controller.class.hardcoded_reports }.not_to raise_error
    end
  end

  describe "#show_hardcoded_reports" do
    let(:report) { FactoryBot.create(:miq_report) }
    before do
      allow(OptimizationController).to receive(:hardcoded_reports).and_return([report])
    end

    context "request" do
      subject { get(:show_list, :params => {:id => nil}) }

      it "renders a page" do
        is_expected.to have_http_status 200
      end
    end

    context "controller" do
      before do
        get(:show_list, :params => {:id => nil})
      end

      it "uses Optimization for title" do
        expect(controller.title).to eq("Optimization")
      end

      it "sets breadcrumbs right" do
        expect(controller.data_for_breadcrumbs.pluck(:title)).to eq(['Overview',
                                                                     'Optimization'])
      end
    end
  end

  describe "#show_saved_reports" do
    let(:report) { FactoryBot.create(:miq_report) }

    context "request" do
      subject { get(:show_list, :params => {:id => report.id}) }

      it "renders a page" do
        is_expected.to have_http_status 200
      end
    end

    context "controller" do
      before do
        get(:show_list, :params => {:id => report.id})
      end

      it "uses report name for title" do
        expect(controller.title).to eq(report.name)
      end

      it "sets breadcrumbs right" do
        expect(controller.data_for_breadcrumbs.pluck(:title)).to eq(['Overview',
                                                                     'Optimization',
                                                                     report.name])
      end
    end
  end

  describe "#show" do
    let(:report) { FactoryBot.create(:miq_report_with_results) }
    let(:result) { report.miq_report_results.first }
    let(:saved) { result.tap { |rr| rr.name = 'saved'; rr.save } }

    context "request" do
      subject { get(:show, :params => {:id => saved.id}) }

      it "renders a page" do
        is_expected.to have_http_status 200
      end
    end

    context "controller" do
      before do
        get(:show, :params => {:id => saved.id})
      end

      it "uses saved report name for title" do
        expect(controller.title).to eq(saved.name)
      end

      it "sets breadcrumbs right" do
        expect(controller.data_for_breadcrumbs.pluck(:title)).to eq(['Overview',
                                                                     'Optimization',
                                                                     report.name,
                                                                     saved.name])
      end
    end
  end
end
