describe OptimizationController do
  render_views

  before do
    login_as user_with_feature(%w(optimization))
  end

  describe '.hardcoded_reports' do
    before do
      MiqReport.seed
    end

    it "finds all the reports" do
      expect { controller.class.hardcoded_reports }.not_to raise_error
    end
  end

  describe "#show_list" do
    subject { get(:show_list) }

    pending "renders a GTL page" do
      is_expected.to have_http_status 200
      is_expected.to render_template(:partial => "layouts/_gtl")
    end
  end
end
