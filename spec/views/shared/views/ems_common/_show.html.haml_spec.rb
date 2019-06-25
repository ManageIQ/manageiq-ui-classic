describe "shared/views/ems_common/show" do
  TestSetup = Struct.new(:ems_type, :helper)
  [
    TestSetup.new(:ems_openstack, EmsCloudHelper::TextualSummary),
    TestSetup.new(:ems_vmware,    EmsInfraHelper::TextualSummary),
  ].each do |setup|
    let!(:server) { EvmSpecHelper.local_miq_server }
    let(:ems) { FactoryBot.create(setup.ems_type, :zone => server.zone) }
    let(:action) { 'index' }

    before do
      view.extend setup.helper
      allow(controller).to receive(:controller_name).and_return("ems_cloud")
      creds = {}
      creds[:amqp] = {:userid => "amqp_user", :password => "amqp_password"}
      ems.update_authentication(creds, :save => true)
      ems.reload
      assign(:ems, ems)
      assign(:record, ems)
      assign(:showtype, showtype)
    end

    context "when showtype is 'main'" do
      let(:showtype) { "main" }
      before { allow(view).to receive(:textual_group_list).and_return([%i(status)]) }

      it "should not show '<Unknown> Credentials'" do
        render
        expect(rendered).not_to include('&lt;Unknown&gt; Credentials')
      end

      it "should show 'AMQP Credentials'" do
        render
        expect(rendered).to include('AMQP Credentials')
      end
    end
  end

  context "when display is 'cloud_volumes'" do
    before do
      allow(controller).to receive(:controller_name).and_return("ems_storage")
      assign(:record, ems)
      assign(:ems, ems)
      assign(:display, display)
      assign(:showtype, showtype)
      allow(view).to receive(:render_gtl_outer)
    end

    let(:showtype) { "main" }
    let(:display) { 'cloud_volumes' }
    let(:ems) { FactoryBot.create(:ems_storage) }

    it "should show render gtl for list of cloud_volumes" do
      render
      expect(view).to render_template(:partial => 'layouts/gtl', :locals => {:action_url => "show/#{ems.id}"})
    end
  end
end
