describe EmsCloudController do
  let!(:server) { EvmSpecHelper.local_miq_server(:zone => zone) }
  let(:zone) { FactoryBot.build(:zone) }

  describe "#show_link" do
    before do
      allow_any_instance_of(described_class).to receive(:set_user_time_zone)
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
    end

    it 'gets the restful show link and timeline link paths' do
      openstack = FactoryBot.create(:ems_openstack, :name => 'foo_openstack')
      show_link_actual_path = controller.send(:show_link, openstack)
      expect(show_link_actual_path).to eq("/ems_cloud/#{openstack.id}")

      post :show, :params => {
        "button"  => "timeline",
        "display" => "timeline",
        "id"      => openstack.id
      }

      expect(response.status).to eq(200)
      show_link_actual_path = controller.send(:show_link, openstack, :display => "timeline")
      expect(show_link_actual_path).to eq("/ems_cloud/#{openstack.id}?display=timeline")
    end
  end

  describe "#test_toolbars" do
    before do
      allow(controller).to receive(:check_privileges).and_return(true)
      allow(controller).to receive(:assert_privileges).and_return(true)
      login_as FactoryBot.create(:user, :features => "ems_cloud_new")
    end

    it "refresh relationships and power states" do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :id => ems.id, :pressed => "ems_cloud_refresh" }
      expect(response.status).to eq(200)
    end

    it 'edit selected cloud provider' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_edit" }
      expect(response.status).to eq(200)
    end

    it 'edit cloud provider tags' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_tag" }
      expect(response.status).to eq(200)
    end

    it 'manage cloud provider policies' do
      allow(controller).to receive(:protect_build_tree).and_return(nil)
      controller.instance_variable_set(:@protect_tree, OpenStruct.new(:name => "name", :locals_for_render => {}))
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_protect" }
      expect(response.status).to eq(200)

      get :protect
      expect(response.status).to eq(200)
      expect(response).to render_template('shared/views/protect')
    end

    it 'edit cloud provider tags' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :id => ems.id, :pressed => "ems_cloud_timeline" }
      expect(response.status).to eq(200)

      get :show, :params => { :display => "timeline", :id => ems.id }
      expect(response.status).to eq(200)
    end

    it 'edit cloud providers' do
      ems = FactoryBot.create(:ems_amazon)
      post :button, :params => { :miq_grid_checks => ems.id, :pressed => "ems_cloud_edit" }
      expect(response.status).to eq(200)
    end
  end

  describe "#show" do
    render_views

    before do
      EvmSpecHelper.create_guid_miq_server_zone
      login_as FactoryBot.create(:user, :features => "none")
      session[:settings] = {:views => {:vm_summary_cool => "summary"}}
      @ems = FactoryBot.create(:ems_amazon)
    end

    subject { get :show, :params => { :id => @ems.id } }

    context "render listnav partial" do
      subject { get :show, :params => { :id => @ems.id, :display => 'main' } }
      render_views

      it "correctly for summary page" do
        is_expected.to have_http_status 200
      end

      it "correctly for timeline page" do
        get :show, :params => {:id => @ems.id, :display => 'timeline'}
        is_expected.to have_http_status 200
      end
    end

    context "render dashboard" do
      subject { get :show, :params => { :id => @ems.id, :display => 'dashboard' } }
      render_views

      it 'never render template show' do
        is_expected.not_to render_template('shared/views/ems_common/show')
      end

      it 'uses its own template' do
        is_expected.to have_http_status 200
        is_expected.not_to render_template(:partial => "ems_cloud/show_dashboard")
      end
    end

    it 'displays only associated storage_managers' do
      FactoryBot.create(:ems_storage, :type =>  "ManageIQ::Providers::Amazon::StorageManager::Ebs", :parent_ems_id => @ems.id)
      FactoryBot.create(:ems_storage, :type =>  "ManageIQ::Providers::Amazon::StorageManager::Ebs", :parent_ems_id => @ems.id)
      get :show, :params => { :display => "storage_managers", :id => @ems.id, :format => :js }
      expect(response).to render_template('layouts/react/_gtl')
      expect(response.status).to eq(200)
    end
  end

  describe "#dialog_form_button_pressed" do
    let(:dialog) { double("Dialog") }
    let(:wf) { double(:dialog => dialog) }

    before do
      @ems = FactoryBot.create(:ems_amazon)
      edit = {:rec_id => 1, :wf => wf, :key => 'dialog_edit__foo', :target_id => @ems.id}
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@sb, {})
      session[:edit] = edit
    end

    it "redirects to requests show list after dialog is submitted" do
      controller.params = {:button => 'submit', :id => 'foo'}
      allow(controller).to receive(:role_allows?).and_return(true)
      allow(wf).to receive(:submit_request).and_return({})
      page = double('page')
      allow(page).to receive(:<<).with(any_args)
      expect(page).to receive(:redirect_to).with("/ems_cloud/#{@ems.id}")
      expect(controller).to receive(:render).with(:update).and_yield(page)
      controller.send(:dialog_form_button_pressed)
      expect(session[:flash_msgs]).to match [a_hash_including(:message => "Order Request was Submitted", :level => :success)]
    end
  end

  include_examples '#download_summary_pdf', :ems_amazon

  it_behaves_like "controller with custom buttons"

  describe "#sync_users" do
    let(:ems) { FactoryBot.create(:ems_openstack_with_authentication) }

    before { stub_user(:features => :all) }

    it "redirects when request is successful" do
      expect(controller).to receive(:find_record_with_rbac).and_return(ems)
      expect(ems).to receive(:sync_users_queue)
      post :sync_users, :params => {:id => ems.id, :sync => "", :admin_role => 1, :member_role => 2}
      expect(session[:flash_msgs]).to match [a_hash_including(:message => "Sync users queued.", :level => :success)]
      expect(response.body).to include("redirected")
      expect(response.body).to include("ems_cloud/#{ems.id}")
    end

    it "returns error if admin role is not selected" do
      post :sync_users, :params => {:id => ems.id, :sync => "", :member_role => 2}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("An admin role must be selected.")
    end

    it "returns error if member role is not selected" do
      post :sync_users, :params => {:id => ems.id, :sync => "", :admin_role => 1}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("A member role must be selected.")
    end

    def verify_password_and_confirm(password, verify)
      post :sync_users, :params => {:id => ems.id, :sync => "",
                                    :admin_role => 1, :member_role => 2,
                                    :password => password,
                                    :verify => verify}
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Password/Confirm Password do not match")
    end

    it "password and confirm must be equal" do
      verify_password_and_confirm("apples", "oranges")
    end

    it "if password or confirm is not empty, then the other cannot be empty" do
      verify_password_and_confirm("apples", nil)
      verify_password_and_confirm(nil, "oranges")
    end
  end

  context "'Set Default' button rendering in listnav" do
    render_views

    before do
      stub_user(:features => :all)
      EvmSpecHelper.create_guid_miq_server_zone
    end

    it "renders 'Set Default' button when a user defined search exists" do
      FactoryBot.create(:ems_amazon)
      MiqSearch.create(:db          => 'EmsCloud',
                       :search_type => "user",
                       :description => 'abc',
                       :name        => 'abc',
                       :search_key  => session[:userid])
      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).to have_selector("button[title*='Select a filter to set it as my default']", :text => "Set Default")
    end

    it "renders a welcoming page when no provider exists" do
      MiqSearch.create(:db          => 'EmsCloud',
                       :search_type => "user",
                       :description => 'abc',
                       :name        => 'abc',
                       :search_key  => session[:userid])
      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).to have_link("Add a Provider")
    end

    it "does not render set default button when a user defined search does not exist" do
      get :show_list
      expect(response.status).to eq(200)
      expect(response.body).not_to have_selector("button[title*='Select a filter to set it as my default']", :text => "Set Default")
    end
  end

  nested_lists = %w(availability_zones cloud_tenants cloud_volumes security_groups instances images
     orchestration_stacks storage_managers)

  nested_lists.each do |custom_button_class|
    include_examples "relationship table screen with custom buttons", custom_button_class
  end

  it_behaves_like "relationship table screen with GTL", nested_lists, :ems_amazon

  context "hiding tenant column for non admin user" do
    before do
      Tenant.seed
      EvmSpecHelper.local_miq_server
    end

    let!(:record) { FactoryBot.create(:ems_cloud, :tenant => Tenant.root_tenant) }

    let(:report) do
      FactoryGirl.create(:miq_report,
                         :name        => 'Cloud Providers',
                         :db          => 'EmsCloud',
                         :title       => 'Cloud Providers',
                         :cols        => %w[name emstype_description],
                         :col_order   => %w[name emstype_description tenant.name],
                         :headers     => %w[Name Type Tenant],
                         :col_options => {"tenant.name" => {:display_method => :user_super_admin?}},
                         :include     => {"tenant" => {"columns" => ['name']}})
    end

    include_examples 'hiding tenant column for non admin user', :name => "Name", :emstype_description => "Type"
  end

  describe '#button' do
    context 'Check Compliance of Last Known Configuration on Instances' do
      let(:vm_instance) { FactoryBot.create(:vm_or_template) }
      let(:ems) { FactoryBot.create(:ems_openstack) }

      before do
        allow(controller).to receive(:assert_privileges)
        allow(controller).to receive(:performed?).and_return(true)
        allow(controller).to receive(:render)
        controller.instance_variable_set(:@display, 'instances')
        controller.params = {:miq_grid_checks => vm_instance.id.to_s, :pressed => 'instance_check_compliance', :id => ems.id.to_s, :controller => 'ems_cloud'}
      end

      it 'does not initiate Check Compliance because of missing Compliance policies' do
        controller.send(:button)
        expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'No Compliance Policies assigned to one or more of the selected items', :level => :error}])
      end

      context 'VM Compliance policy set' do
        let(:policy) { FactoryBot.create(:miq_policy, :mode => 'compliance', :towhat => 'Vm', :active => true) }

        before do
          vm_instance.add_policy(policy)
          allow(MiqPolicy).to receive(:policy_for_event?).and_return(true)
        end

        it 'initiates Check Compliance action' do
          controller.send(:button)
          expect(controller.instance_variable_get(:@flash_array)).to eq([{:message => 'Check Compliance initiated for 1 VM and Instance from the ManageIQ Database', :level => :success}])
        end
      end
    end
  end
end
