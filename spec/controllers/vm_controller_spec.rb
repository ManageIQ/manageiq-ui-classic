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
end
