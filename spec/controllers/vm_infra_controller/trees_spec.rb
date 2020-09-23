describe VmInfraController do
  render_views
  before do
    stub_user(:features => :all)
    MiqRegion.seed
    EvmSpecHelper.create_guid_miq_server_zone
  end

  context "VMs & Templates #tree_select" do
    it "renders list Archived nodes in VMs & Templates tree" do
      FactoryBot.create(:vm_vmware)

      session[:settings] = {}
      seed_session_trees('vm_infra', :vandt_tree)

      post :tree_select, :params => { :id => 'xx-arch', :format => :js }

      expect(response).to render_template('layouts/react/_gtl')
      expect(response.status).to eq(200)
    end
  end

  context "#tree_select" do
    [
      ['Vms & Templates', 'vandt_tree'],
      %w(VMS vms_filter_tree),
      %w(Templates templates_filter_tree),
    ].each do |elements, tree|
      it "renders list of #{elements} for #{tree} root node" do
        FactoryBot.create(:vm_vmware)
        FactoryBot.create(:template_vmware)

        session[:settings] = {}
        seed_session_trees('vm_infra', tree.to_sym)

        post :tree_select, :params => { :id => 'root', :format => :js }

        expect(response).to render_template('layouts/react/_gtl')
        expect(response.status).to eq(200)
      end
    end

    it "renders VM details for VM node" do
      vm = FactoryBot.create(:vm_vmware)

      session[:settings] = {}
      seed_session_trees('vm_infra', 'vandt_tree')

      post :tree_select, :params => { :id => "v-#{vm.id}", :format => :js }

      expect(response).to render_template(:partial => 'layouts/_textual_groups_generic')
      expect(response.status).to eq(200)
    end

    it "renders Template details for Template node" do
      template = FactoryBot.create(:template_vmware)

      session[:settings] = {}
      seed_session_trees('vm_infra', 'vandt_tree')

      post :tree_select, :params => { :id => "t-#{template.id}", :format => :js }

      expect(response).to render_template(:partial => 'layouts/_textual_groups_generic')
      expect(response.status).to eq(200)
    end
  end
end
