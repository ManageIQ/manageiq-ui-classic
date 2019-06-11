describe VmCloudController do
  let(:vm_openstack) do
    FactoryBot.create(:vm_openstack,
                       :ext_management_system => FactoryBot.create(:ems_openstack))
  end
  let(:vm_openstack_tmd) do
    FactoryBot.create(:vm_openstack,
                       :ext_management_system => FactoryBot.create(:ems_openstack, :tenant_mapping_enabled => false))
  end
  let(:vm_openstack_tme) do
    FactoryBot.create(:vm_openstack,
                       :ext_management_system => FactoryBot.create(:ems_openstack, :tenant_mapping_enabled => true))
  end

  before do
    stub_user(:features => :all)
    EvmSpecHelper.create_guid_miq_server_zone
  end

  # All of the x_button is a suplement for Rails routes that is written in
  # controller.
  #
  # You pass in query param 'pressed' and from that the actual route is
  # determined.
  #
  # So we need a test for each possible value of 'presses' until all this is
  # converted into proper routes and test is changed to test the new routes.
  describe 'x_button' do
    before do
      ApplicationController.handle_exceptions = true
    end

    context 'for allowed actions' do
      ApplicationController::Explorer::X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, method|
        prefixes = ["image", "instance"]
        prefixes.each do |prefix|
          actual_action = "#{prefix}_#{action_name}"
          actual_method = %i(s1 s2).include?(method) ? actual_action : method.to_s

          it "calls the appropriate method: '#{actual_method}' for action '#{actual_action}'" do
            expect(controller).to receive(actual_method)

            # Instead of calling the get below:
            # get :x_button, :params => { :id => nil, :pressed => actual_action }
            # we mock a bit and use `send`. This saves 10s of test run.
            allow(controller).to receive(:performed?).and_return(true)
            controller.params = {:id => nil, :pressed => actual_action}
            controller.instance_variable_set(:@sb, {})
            controller.send(:x_button)
          end
        end
      end
    end
  end

  context "with rendered views" do
    render_views

    context 'for an unknown action' do
      it 'exception is raised for unknown action' do
        get :x_button, :params => { :id => nil, :pressed => 'random_dude', :format => :html }
        expect(response).to render_template('layouts/exception')
        expect(response.body).to include('Action not implemented')
      end
    end

    it 'can render the explorer' do
      get :explorer
      expect(response.status).to eq(200)
      expect(response.body).to_not be_empty
    end

    it 'can open instance resize tab' do
      post :explorer
      expect(response.status).to eq(200)
      allow(controller).to receive(:x_node).and_return("v-#{vm_openstack.id}")

      post :x_button, :params => {:pressed => 'instance_resize', :id => vm_openstack.id}
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'vm_common/_resize')
    end

    it 'can resize an instance' do
      flavor = FactoryBot.create(:flavor_openstack)
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:previous_breadcrumb_url).and_return("/vm_cloud/explorer")
      expect(VmCloudReconfigureRequest).to receive(:make_request)
      post :resize_vm, :params => {
        :button    => 'submit',
        :objectId  => vm_openstack.id,
        :flavor_id => flavor.id
      }
      expect(response.status).to eq(200)
    end

    it 'can open instance live migrate tab' do
      post :explorer
      expect(response.status).to eq(200)
      allow(controller).to receive(:x_node).and_return("v-#{vm_openstack.id}")

      post :x_button, :params => {:pressed => 'instance_live_migrate', :id => vm_openstack.id}
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'vm_common/_live_migrate')
    end

    it 'can live migrate an instance' do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:previous_breadcrumb_url).and_return("/vm_cloud/explorer")
      controller.instance_variable_set(:@edit,
                                       :new      => {},
                                       :explorer => false)
      session[:live_migrate_items] = [vm_openstack.id]
      expect(VmCloud).to receive(:live_migrate_queue)
      post :live_migrate_vm, :params => {
        :button => 'submit'
      }
      expect(response.status).to eq(200)
    end

    it 'can open instance evacuate tab' do
      post :explorer
      expect(response.status).to eq(200)
      allow(controller).to receive(:x_node).and_return("v-#{vm_openstack.id}")
      allow(controller).to receive(:find_records_with_rbac) { [vm_openstack] }

      post :x_button, :params => {:pressed => 'instance_evacuate', :id => vm_openstack.id}
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'vm_common/_evacuate')
    end

    it 'can evacuate an instance' do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(:previous_breadcrumb_url).and_return("/vm_cloud/explorer")
      controller.instance_variable_set(:@edit,
                                       :new      => {},
                                       :explorer => false)
      session[:evacuate_items] = [vm_openstack.id]
      expect(VmCloud).to receive(:evacuate_queue)
      post :evacuate_vm, :params => {
        :button => 'submit'
      }
      expect(response.status).to eq(200)
    end

    it 'can open the instance Ownership form' do
      post :explorer
      expect(response.status).to eq(200)
      post :x_button, :params => { :pressed => 'instance_ownership', :id => vm_openstack.id }
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'shared/views/_ownership')
    end

    it 'can open the instance Ownership form from a list' do
      post :explorer
      expect(response.status).to eq(200)
      post :x_button, :params => { :pressed => 'instance_ownership', "check_#{vm_openstack.id}" => "1"}
      expect(response.status).to eq(200)
      expect(response).to render_template(:partial => 'shared/views/_ownership')
    end

    it 'renders instance ownership gtl correctly' do
      post :explorer
      expect(response.status).to eq(200)
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'ManageIQ::Providers::CloudManager::Vm',
        :selected_records               => [vm_openstack_tmd.id],
        :report_data_additional_options => {
          :model      => 'ManageIQ::Providers::CloudManager::Vm',
          :lastaction => 'show_list',
        }
      )
      post :x_button, :params => {:pressed => 'instance_ownership', "check_#{vm_openstack_tmd.id}" => "1", "check_#{vm_openstack_tme.id}" => "1"}
      expect(response.status).to eq(200)
    end

    it 'renders gtl when open pre provision screen' do
      expect_any_instance_of(GtlHelper).to receive(:render_gtl).with match_gtl_options(
        :model_name                     => 'ManageIQ::Providers::CloudManager::Template',
        :report_data_additional_options => {
          :model         => 'ManageIQ::Providers::CloudManager::Template',
          :report_name   => "ProvisionCloudTemplates.yaml",
          :custom_action => {
            :url  => "/miq_request/pre_prov/?sel_id=",
            :type => "provisioning"
          }
        }
      )
      post :x_button, :params => {:pressed => 'instance_miq_request_new'}
      expect(response.status).to eq(200)
    end

    context "skip or drop breadcrumb" do
      before do
        get :explorer
      end

      subject { controller.instance_variable_get(:@breadcrumbs) }

      it 'skips dropping a breadcrumb when a button action is executed' do
        ApplicationController.handle_exceptions = true

        post :x_button, :params => { :id => nil, :pressed => 'instance_ownership' }
        expect(subject).to eq([{:name => "Instances", :url => "/vm_cloud/explorer"}])
      end

      it 'drops a breadcrumb when an action allowing breadcrumbs is executed' do
        post :accordion_select, :params => { :id => "images_filter" }
        expect(subject).to eq([{:name => "Images", :url => "/vm_cloud/explorer"}])
      end
    end
  end

  context "#parse error messages" do
    it "simplifies fog error message" do
      raw_msg = "Expected(200) <=> Actual(400 Bad Request)\nexcon.error.response\n  :body          => "\
                "\"{\\\"badRequest\\\": {\\\"message\\\": \\\"Keypair data is invalid: failed to generate "\
                "fingerprint\\\", \\\"code\\\": 400}}\"\n  :cookies       => [\n  ]\n  :headers       => {\n "\
                "\"Content-Length\"       => \"99\"\n    \"Content-Type\"         => \"application/json; "\
                "charset=UTF-8\"\n    \"Date\"                 => \"Mon, 02 May 2016 08:15:51 GMT\"\n ..."\
                ":reason_phrase => \"Bad Request\"\n  :remote_ip     => \"10....\"\n  :status        => 400\n  "\
                ":status_line   => \"HTTP/1.1 400 Bad Request\\r\\n\"\n"
      expect(subject.send(:get_error_message_from_fog, raw_msg)).to eq "Keypair data is invalid: failed to generate "\
                                                                       "fingerprint"
    end
  end

  include_examples '#download_summary_pdf', :vm_cloud
  include_examples '#download_summary_pdf', :template_azure

  it_behaves_like "explorer controller with custom buttons"
end
