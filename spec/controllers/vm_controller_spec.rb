describe VmController do
  before do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
  end

  context 'live_migrate' do
    # FIXME: need to render views for now,
    # because the branching logic is in app/views/vm/show.html.haml
    render_views

    let(:vm_openstack) { FactoryBot.create(:vm_openstack) }

    # Request URL: http://localhost:3000/vm/live_migrate?escape=false
    # FIXME: the espace=false seems unused
    it 'renders' do
      session[:live_migrate_items] = [vm_openstack.id]
      get :live_migrate
      expect(response.status).to eq(200)
      expect(response).to render_template('vm_common/_live_migrate')
    end
  end

  describe "#right_size" do
    let(:vm) { FactoryBot.create(:vm_vmware) }
    before do
      stub_user(:features => :all)
    end

    it "when back button is pressed, it redirects back to previous screen" do
      breadcrumbs = [
        {:name => "Foo", :url => "/ems_infra/show_list"},
        {:name => "Bar", :url => "/ems_infra/1?display=vms"},
        {:name => "Right Size", :url => "/vm/right_size"}
      ]
      controller.instance_variable_set(:@breadcrumbs, breadcrumbs)
      page = double('page')
      allow(page).to receive(:<<).with(any_args)
      expect(page).to receive(:redirect_to).with("/ems_infra/1?display=vms")
      expect(controller).to receive(:render).with(:update).and_yield(page)
      controller.params = {:id => vm.id, :button => 'back'}
      controller.send(:right_size)
    end
  end
end
