require "routing/shared_examples"

describe EmsPhysicalInfraController do
  let(:controller_name) { "ems_infra" }

  it_behaves_like "A controller that has advanced search routes", true
  it_behaves_like "A controller that has dialog runner routes"
  it_behaves_like "A controller that has download_data routes"
  it_behaves_like "A controller that has policy protect routes"
  it_behaves_like "A controller that has tagging routes"
  it_behaves_like "A controller that has timeline routes"

  %w[
    dialog_load
    show_list
  ].each do |task|
    describe "##{task}" do
      it 'routes with GET' do
        expect(get("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end

  %w[
    button
    listnav_search_selected
    protect
    quick_search
    sections_field_changed
    show
    show_list
    tagging_edit
    tl_chooser
    tree_autoload
    wait_for_task
    protect
    scaling
    scaledown
  ].each do |task|
    describe "##{task}" do
      it 'routes with POST' do
        expect(post("/#{controller_name}/#{task}")).to route_to("#{controller_name}##{task}")
      end
    end
  end
end
