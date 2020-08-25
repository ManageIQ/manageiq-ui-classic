describe OrchestrationStackController do
  let!(:user) { stub_user(:features => :all) }

  before { EvmSpecHelper.create_guid_miq_server_zone }

  render_views

  describe '#show' do
    context "instances" do
      let(:record) { FactoryBot.create(:orchestration_stack_cloud) }

      before do
        session[:settings] = {
          :views => {:manageiq_providers_cloudmanager_vm => "grid"}
        }
        get :show, :params => {:id => record.id, :display => "instances"}
      end

      it 'does not render compliance check button' do
        expect(response.body).not_to include('instance_check_compliance')
      end

      it "renders show" do
        expect(response.status).to eq(200)
      end
    end

    context "infra" do
      let(:record) { FactoryBot.create(:orchestration_stack_openstack_infra) }

      before do
        session[:settings] = {
          :views => {:manageiq_providers_cloudmanager_vm => "grid"}
        }
        get :show, :params => {:id => record.id}
      end

      it 'infra does not show deleted error' do
        expect(assigns(:flash_array)).to be_nil
      end
    end

    context "orchestration templates" do
      let(:ems) { FactoryBot.create(:ems_cloud) }
      let(:record) { FactoryBot.create(:orchestration_stack_cloud_with_template, :ext_management_system => ems, :name => 'stack01') }

      before do
        session[:settings] = {
          :views => {:manageiq_providers_cloudmanager_vm => "grid"}
        }
        get :show, :params => {:id => record.id, :display => "stack_orchestration_template"}
      end

      it "renders the orchestration template details" do
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "orchestration_stack/_stack_orchestration_template")
      end

      it "renders template name correctly" do
        expect(response.status).to eq(200)
        expect(response.body).to include("<h1>\ntemplate name")
        expect(response.body).not_to include("<h1>\nstack01")
      end
    end
  end

  describe "#show_list" do
    context "orchestration stack listing" do
      before do
        get :show_list
      end

      it "correctly constructs breadcrumb url" do
        expect(session[:breadcrumbs]).not_to be_empty
        expect(session[:breadcrumbs].first[:url]).to eq("/orchestration_stack/show_list")
      end
    end

    context "orchestration stack listing hides ansible jobs" do
      before do
        @os_cloud  = FactoryBot.create(:orchestration_stack_cloud, :name => "cloudstack1")
        @os_infra  = FactoryBot.create(:orchestration_stack_openstack_infra, :name => "infrastack1")
        @tower_job = FactoryBot.create(:ansible_tower_job, :name => "towerjob1")

        get :show_list
      end

      it "hides ansible jobs" do
        expect(response.body).to include("modelName: 'OrchestrationStack'")
      end
    end
  end

  describe "#stacks_ot_info" do
    it "returns all the orchestration template attributes" do
      stack = FactoryBot.create(:orchestration_stack_cloud_with_template)
      get :stacks_ot_info, :params => { :id => stack.id }
      expect(response.status).to eq(200)
      ret = JSON.parse(response.body)
      expect(ret).to have_key('template_id')
      expect(ret).to have_key('template_name')
      expect(ret).to have_key('template_description')
      expect(ret).to have_key('template_draft')
      expect(ret).to have_key('template_content')
    end
  end

  describe "#stacks_ot_copy" do
    let(:record) { FactoryBot.create(:orchestration_stack_cloud_with_template) }

    it "correctly cancels the orchestration template copying form" do
      post :stacks_ot_copy, :params => {:id => record.id, :button => "cancel"}
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => "layouts/_flash_msg")
      expect(assigns(:flash_array).first[:message]).to include('was cancelled')
      expect(response).to render_template(:partial => "orchestration_stack/_stack_orchestration_template")
    end

    it "correctly redirects to catalog controller after template copy submission" do
      post :stacks_ot_copy, :params => {
        :button              => "add",
        :templateId          => record.orchestration_template.id,
        :templateName        => "new name",
        :templateDescription => "new description",
        :templateDraft       => "true",
        :templateContent     => "orchestration template test content"
      }
      expect(response.status).to eq(200)
      expect(response.body).to include("window.location.href")
      expect(response.body).to include("/catalog/ot_show/")
    end
  end

  describe "#button" do
    let(:non_orderable_template) do
      stub_const('OrchestrationTemplateTest', Class.new(OrchestrationTemplate) do
        def validate_format
          nil
        end
      end)
      FactoryBot.create(:orchestration_template, :type => 'OrchestrationTemplateTest', :orderable => false)
    end

    context "make stack's orchestration template orderable" do
      it "won't allow making stack's orchestration template orderable when already orderable" do
        record = FactoryBot.create(:orchestration_stack_cloud_with_template)
        post :button, :params => {:id => record.id, :pressed => "make_ot_orderable"}
        expect(record.orchestration_template.orderable?).to be_truthy
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/_flash_msg")
        expect(assigns(:flash_array).first[:message]).to include('is already orderable')
      end

      it "makes stack's orchestration template orderable" do
        record = FactoryBot.create(:orchestration_stack_cloud, :orchestration_template => non_orderable_template)
        post :button, :params => {:id => record.id, :pressed => "make_ot_orderable"}
        expect(record.orchestration_template.orderable?).to be_falsey
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/_flash_msg")
        expect(assigns(:flash_array).first[:message]).to include('is now orderable')
      end
    end

    context "copy stack's orchestration template as orderable" do
      it "won't allow copying stack's orchestration template orderable when already orderable" do
        record = FactoryBot.create(:orchestration_stack_cloud_with_template)
        post :button, :params => {:id => record.id, :pressed => "orchestration_template_copy"}
        expect(record.orchestration_template.orderable?).to be_truthy
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "layouts/_flash_msg")
        expect(assigns(:flash_array).first[:message]).to include('is already orderable')
      end

      it "renders orchestration template copying form" do
        record = FactoryBot.create(:orchestration_stack_cloud, :orchestration_template => non_orderable_template)
        post :button, :params => {:id => record.id, :pressed => "orchestration_template_copy"}
        expect(record.orchestration_template.orderable?).to be_falsey
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => "orchestration_stack/_copy_orchestration_template")
      end
    end

    context "view stack's orchestration template in catalog" do
      it "redirects to catalog controller" do
        record = FactoryBot.create(:orchestration_stack_cloud_with_template)
        post :button, :params => {:id => record.id, :pressed => "orchestration_templates_view"}
        expect(response.status).to eq(200)
        expect(response.body).to include("window.location.href")
        expect(response.body).to include("/catalog/ot_show/")
      end
    end

    context "retire orchestration stack" do
      it "set retirement date redirects to retirement screen" do
        record = FactoryBot.create(:orchestration_stack_cloud)
        post :button, :params => {:miq_grid_checks => record.id, :pressed => "orchestration_stack_retire"}
        expect(response.status).to eq(200)
        expect(controller.send(:flash_errors?)).not_to be_truthy
        expect(response.body).to include('window.location.href')
      end

      it "retires the orchestration stack now" do
        record = FactoryBot.create(:orchestration_stack_cloud)
        session[:orchestration_stack_lastaction] = 'show_list'
        expect(controller).to receive(:render).at_least(:once)
        post :button, :params => {:miq_grid_checks => record.id, :pressed => "orchestration_stack_retire_now"}
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end

      it "retires the orchestration stack now when called from the summary page" do
        record = FactoryBot.create(:orchestration_stack_cloud)
        session[:orchestration_stack_lastaction] = 'show'
        expect(controller).to receive(:render).at_least(:once)
        post :button, :params => {:id => record.id, :pressed => "orchestration_stack_retire_now"}
        expect(controller.send(:flash_errors?)).not_to be_truthy
      end
    end

    it 'returns proper record class' do
      expect(controller.send(:record_class)).to eq(OrchestrationStack)
    end

    context 'Instances displayed through Relationships of Orchestration Stack' do
      before { controller.params = {:display => 'instances'} }

      it 'returns proper record class' do
        expect(controller.send(:record_class)).to eq(VmOrTemplate)
      end

      context 'Shelve offload action' do
        before do
          controller.params = {:pressed => 'instance_shelve_offload'}
          allow(controller).to receive(:performed?).and_return(true)
          allow(controller).to receive(:show)
        end

        it 'calls shelveoffloadvms' do
          expect(controller).to receive(:shelveoffloadvms)
          controller.send(:button)
        end
      end
    end
  end
end
