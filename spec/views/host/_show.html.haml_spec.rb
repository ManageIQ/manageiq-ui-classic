describe "host/show.html.haml" do
  helper(GtlHelper)
  helper(ApplicationHelper)

  shared_examples_for "miq_before_onload JS is needed" do
    it "renders proper JS" do
      js_string = "ManageIQ.afterOnload = {action: () => miqAsyncAjax(\"/host/#{action}/#{host.id}\")}"
      render :template => "host/show"
      expect(rendered).to include(js_string)
    end
  end

  let(:host) { FactoryBot.create(:host_vmware, :name => 'My Host') }
  let(:action) { 'index' }

  before do
    assign(:record, host)
    assign(:ajax_action, action)
    assign(:showtype, showtype)
  end

  context "when showtype is 'performance'" do
    let(:showtype) { "performance" }

    before do
      assign(:perf_options, ApplicationController::Performance::Options.new.tap { |o| o.chart_type = :performance })
    end

    it_behaves_like "miq_before_onload JS is needed"
  end

  context "when showtype is 'timeline'" do
    let(:showtype) { "timeline" }

    before do
      assign(:tl_options, ApplicationController::Timelines::Options.new)
    end

    it_behaves_like "miq_before_onload JS is needed"
  end

  context "when showtype is 'details'" do
    let(:showtype) { "details" }
    let(:display) { "main" }

    it "should render gtl view" do
      assign(:lastaction, "host_services")
      assign(:view, OpenStruct.new(:table => OpenStruct.new(:data => [])))
      render :template => "host/show"
      expect(view).to render_template(:partial => 'layouts/gtl', :locals => {:action_url => 'host_services'})
    end
  end
end
