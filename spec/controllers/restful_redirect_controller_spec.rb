describe RestfulRedirectController do
  context "Redirects to controller correctly" do
    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
      ApplicationController.handle_exceptions = true
    end

    it "redirects to ems_infra controller" do
      ems_infra = FactoryBot.create(:ems_vmware)
      link = "/ems_infra/#{ems_infra.id}"
      get :index, :params => { :model => "ExtManagementSystem", :id => ems_infra.id }
      expect(response).to redirect_to(link)
    end

    it "redirects to ems_container controller" do
      ems_container = FactoryBot.create(:ems_kubernetes)
      link = "/ems_container/#{ems_container.id}"
      get :index, :params => { :model => "ExtManagementSystem", :id => ems_container.id }
      expect(response).to redirect_to(link)
    end

    it "redirects to dashboard controller, when record is missing" do
      get :index, :params => { :model => "ExtManagementSystem", :id => "some_id" }
      expect(response).to redirect_to(:controller => "dashboard", :action => "show")
      expect(assigns(:flash_array).first[:message]).to eq('Could not find the given "Provider" record.')
    end

    it "redirects to dashboard controller, when model is not valid" do
      get :index, :params => { :model => "some_model", :id => "some_id" }
      expect(response).to redirect_to(:controller => "dashboard", :action => "show")
      expect(assigns(:flash_array).first[:message]).to eq('Could not find the given "Some Model" record.')
    end

    it "redirects to vm_infra controller" do
      vm_infra = FactoryBot.create(:vm_vmware)
      get :index, :params => { :model => "VmOrTemplate", :id => vm_infra.id }
      expect(response).to redirect_to(:controller => "vm_infra", :action => "show", :id => vm_infra.id)
    end

    it "redirects to vm_cloud controller" do
      vm_cloud = FactoryBot.create(:vm_openstack)
      get :index, :params => { :model => "VmOrTemplate", :id => vm_cloud.id }
      expect(response).to redirect_to(:controller => "vm_cloud", :action => "show", :id => vm_cloud.id)
    end

    it 'redirects to automation_manager controller' do
      automation_provider = FactoryBot.create(:provider_ansible_tower)
      manager = ManageIQ::Providers::AnsibleTower::AutomationManager.find_by(:provider_id => automation_provider.id)
      get :index, :params => {:model => "ExtManagementSystem/#{manager.id}"}
      expect(response).to redirect_to(:controller => 'automation_manager', :action => 'show', :id => manager.id)
    end

    it 'redirects to ansible_playbook controller' do
      embedded_ansible = FactoryBot.create(:provider_embedded_ansible)
      manager = ManageIQ::Providers::EmbeddedAnsible::AutomationManager.find_by(:provider_id => embedded_ansible.id)
      get :index, :params => {:model => "ExtManagementSystem/#{manager.id}"}
      expect(response).to redirect_to(:controller => 'ansible_playbook', :action => 'show_list')
    end

    it 'redirects to ops controller and displays flash message that it cannot redirect to the selected provider' do
      embedded_ansible = FactoryBot.create(:provider_embedded_ansible)
      allow(ExtManagementSystem).to receive(:find_by).and_return(embedded_ansible)
      get :index, :params => {:model => "ExtManagementSystem/#{embedded_ansible.id}"}
      expect(response).to redirect_to(:controller => 'ops', :action => 'explorer')
      expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => "Cannot redirect to \"#{embedded_ansible.name}\" provider.", :level => :error}])
    end
  end
end
