require "routing/shared_examples"

describe EmsContainerController do
  let(:controller_name) { "ems_container" }
  %w[
    button
    listnav_search_selected
    save_default_search
    show
    show_list
    protect
  ].each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  describe "#index" do
    it "routes with GET" do
      expect(get("/#{controller_name}")).to route_to("#{controller_name}#index")
    end
  end

  describe "#edit" do
    it "routes with GET" do
      expect(get("/#{controller_name}/123/edit")).to route_to("#{controller_name}#edit", :id => "123")
    end
  end

  describe "#show" do
    it "routes with GET" do
      expect(get("/#{controller_name}/123")).to route_to("#{controller_name}#show", :id => "123")
    end
  end
end
