require "routing/shared_examples"

describe "routes for PlacementGroupController" do
  let(:controller_name) { "placement_group" }

  it_behaves_like "A controller that has advanced search routes"

  %w[
    show_list
    show
    index
  ].each do |task|
    describe "##{task}" do
      it 'routes with GET' do
        expect(get("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  %w[
    quick_search
    show_list
    show
  ].each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end
end
