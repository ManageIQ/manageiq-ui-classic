describe TextualSummaryHelper do
  include ApplicationHelper

  before do
    stub_user(:features => :all)
  end

  context "textual_link" do
    context "with a restfully-routed model" do
      it "uses the restful path to retrieve the summary screen link" do
        ems = FactoryBot.create(:ems_openstack)
        ems.availability_zones << FactoryBot.create(:availability_zone_openstack)

        result = helper.textual_link(ems.availability_zones)
        expect(result[:link]).to eq("/ems_cloud/#{ems.id}?display=availability_zones")
      end

      it "uses the restful path for the base show screen" do
        ems = FactoryBot.create(:ems_openstack)

        result = helper.textual_link(ems)
        expect(result[:link]).to eq("/ems_cloud/#{ems.id}")
      end
    end

    context "with a non-restful model" do
      it "uses the controller-action-id path to retrieve the summary screen link" do
        ems = FactoryBot.create(:ems_openstack_infra)
        ems.hosts << FactoryBot.create(:host)

        result = helper.textual_link(ems.hosts)
        expect(result[:link]).to eq("/ems_infra/#{ems.id}?display=hosts")
      end

      it "uses the controller-action-id path for the base show screen" do
        ems = FactoryBot.create(:ems_openstack_infra)

        result = helper.textual_link(ems)
        expect(result[:link]).to eq("/ems_infra/#{ems.id}")
      end
    end
  end
end
