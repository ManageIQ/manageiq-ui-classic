describe OptimizationController do
  render_views

  before do
    login_as user_with_feature(%w[optimization])
    EvmSpecHelper.local_miq_server
  end

  describe '.hardcoded_reports' do
    before do
      # FIXME: this should go away with #4943
      MiqReport.seed
    end

    it "finds all the reports" do
      expect { controller.hardcoded_reports }.not_to raise_error

      actual = controller.hardcoded_reports.pluck(:menu_name).sort
      expected = controller.class.hardcoded_reports.sort

      expect(actual).to eq(expected)
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
    let(:saved) do
      result.tap do |rr|
        rr.name = 'saved'
        rr.save
      end
    end

    context "request" do
      before do
        session[:settings] = {:perpage => {:reports => 20}}
      end

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
        expect(controller.title).to match(/Saved Report.*saved/)
      end

      it "sets breadcrumbs right" do
        expect(controller.data_for_breadcrumbs.pluck(:title)).to match(['Overview',
                                                                        'Optimization',
                                                                        report.name,
                                                                        a_string_matching(/Saved Report.*saved/)])
      end

      context "even if report.name and saved.name match" do
        let(:saved) do
          result.tap do |rr|
            rr.name = report.name
            rr.save
          end
        end

        it "sets breadcrumbs right" do
          expect(controller.data_for_breadcrumbs.pluck(:title)).to match(['Overview',
                                                                          'Optimization',
                                                                          report.name,
                                                                          a_string_matching(/Saved Report/)])
        end

        it "links to both parents" do
          expect(controller.data_for_breadcrumbs.pluck(:url)).to eq([nil,
                                                                     '/optimization',
                                                                     "/optimization/show_list/#{report.id}",
                                                                     nil])
        end
      end
    end
  end
end
