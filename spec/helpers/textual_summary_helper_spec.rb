describe TextualSummaryHelper do
  include ApplicationHelper

  before do
    stub_user(:features => :all)
  end

  context "textual_link" do
    context "with a restfully-routed model" do
      it "uses the restful path to retrieve the summary screen link" do
        ems = FactoryGirl.create(:ems_openstack)
        ems.availability_zones << FactoryGirl.create(:availability_zone_openstack)

        result = helper.textual_link(ems.availability_zones)
        expect(result[:link]).to eq("/ems_cloud/#{ems.id}?display=availability_zones")
      end

      it "uses the restful path for the base show screen" do
        ems = FactoryGirl.create(:ems_openstack)

        result = helper.textual_link(ems)
        expect(result[:link]).to eq("/ems_cloud/#{ems.id}")
      end
    end

    context "with a restfully-routed model" do
      it "uses the restful path to retrieve the summary screen link for telefonica" do
        ems = FactoryGirl.create(:ems_telefonica)
        ems.availability_zones << FactoryGirl.create(:availability_zone_telefonica)

        result = helper.textual_link(ems.availability_zones)
        expect(result[:link]).to eq("/ems_cloud/#{ems.id}?display=availability_zones")
      end

      it "uses the restful path for the base show screen" do
        ems = FactoryGirl.create(:ems_telefonica)

        result = helper.textual_link(ems)
        expect(result[:link]).to eq("/ems_cloud/#{ems.id}")
      end
    end

    context "with a non-restful model" do
      it "uses the controller-action-id path to retrieve the summary screen link" do
        ems = FactoryGirl.create(:ems_openstack_infra)
        ems.hosts << FactoryGirl.create(:host)

        result = helper.textual_link(ems.hosts)
        expect(result[:link]).to eq("/ems_infra/#{ems.id}?display=hosts")
      end

      it "uses the controller-action-id path for the base show screen" do
        ems = FactoryGirl.create(:ems_openstack_infra)

        result = helper.textual_link(ems)
        expect(result[:link]).to eq("/ems_infra/#{ems.id}")
      end
    end
  end
end
