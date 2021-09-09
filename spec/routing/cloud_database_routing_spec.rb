require "routing/shared_examples"

describe "routes for CloudDatabaseController" do
  let(:controller_name) { "cloud_database" }

  it_behaves_like "A controller that has advanced search routes"
  it_behaves_like "A controller that has download_data routes"

  %w(
    show_list
    show
    index
    download_data
    download_summary_pdf
  ).each do |task|
    describe "##{task}" do
      it 'routes with GET' do
        expect(get("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  %w(
    quick_search
    show_list
    show
  ).each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end
end
