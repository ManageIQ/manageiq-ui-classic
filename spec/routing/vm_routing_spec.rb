require "routing/shared_examples"

describe VmOrTemplateController do
  let(:controller_name) { "vm" }

  %w(
    download_data
    edit
    ownership
    policy_sim
    reconfigure
    retire
    right_size
    show
    show_list
  ).each do |path|
    describe "##{path}" do
      it "routes with GET" do
        expect(get("/#{controller_name}/#{path}")).to route_to("#{controller_name}##{path}")
      end
    end
  end

  %w(
    ownership
    ownership_update
    policy_sim
    policy_sim_add
    policy_sim_remove
    pre_prov
    pre_prov_continue
    reconfigure
    reconfigure_form_fields
    reconfigure_update
    right_size
    set_checked_items
    show_list
    genealogy_tree_selected
  ).each do |path|
    describe "##{path}" do
      it "routes with POST" do
        expect(post("/#{controller_name}/#{path}")).to route_to("#{controller_name}##{path}")
      end
    end
  end
end
