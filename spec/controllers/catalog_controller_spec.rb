describe CatalogController do
  let(:user)                { FactoryGirl.create(:user_with_group) }
  let(:admin_user)          { FactoryGirl.create(:user, :role => "super_administrator") }
  let(:root_tenant)         { user.current_tenant }
  let(:tenant_role)         { FactoryGirl.create(:miq_user_role) }
  let(:child_tenant)        { FactoryGirl.create(:tenant, :parent => root_tenant) }
  let(:child_tenant_group)  { FactoryGirl.create(:miq_group, :tenant => child_tenant, :miq_user_role => tenant_role) }
  let(:child_tenant_user)   { FactoryGirl.create(:user, :miq_groups => [child_tenant_group]) }

  let!(:service_template_with_root_tenant) { FactoryGirl.create(:service_template, :tenant => root_tenant) }
  let!(:service_template_with_child_tenant) do
    FactoryGirl.create(:service_template, :miq_group => child_tenant_group, :tenant => child_tenant)
  end

  before(:each) do
    stub_user(:features => :all)
    controller.instance_variable_set(:@settings, {})
    allow_any_instance_of(ApplicationController).to receive(:fetch_path)
  end

  context 'get_view' do
    it "returns all catalog items related to current tenant and root tenant when non-self service user is logged" do
      login_as child_tenant_user
      view, _pages = controller.send(:get_view, ServiceTemplate, {}, true)
      expect(view.table.data.count).to eq(2)
    end

    it "returns all catalog items related to current user's groups when self service user is logged" do
      allow_any_instance_of(MiqGroup).to receive_messages(:self_service? => true)
      login_as child_tenant_user
      view, _pages = controller.send(:get_view, ServiceTemplate, {}, true)
      expect(view.table.data.count).to eq(1)
    end

    it "returns all catalog items when admin user is logged" do
      login_as admin_user
      view, _pages = controller.send(:get_view, ServiceTemplate, {}, true)
      expect(view.table.data.count).to eq(2)
    end
  end

  # some methods should not be accessible through the legacy routes
  # either by being private or through the hide_action mechanism
  it 'should not allow call of hidden/private actions' do
    expect do
      post :process_sts
    end.to raise_error AbstractController::ActionNotFound
  end

  describe 'x_button' do
    before do
      ApplicationController.handle_exceptions = true
    end

    describe 'corresponding methods are called for allowed actions' do
      CatalogController::CATALOG_X_BUTTON_ALLOWED_ACTIONS.each_pair do |action_name, actual_method|
        it "calls the appropriate method: '#{actual_method}' for action '#{action_name}'" do
          expect(controller).to receive(actual_method)
          get :x_button, :params => { :pressed => action_name }
        end
      end
    end

    it 'exception is raised for unknown action' do
      get :x_button, :params => { :pressed => 'random_dude', :format => :html }
      expect(response).to render_template('layouts/exception')
    end
  end

  context "#atomic_form_field_changed" do
    before :each do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@record, ServiceTemplate.new(:prov_type => "generic"))
      edit = {
        :key          => "prov_edit__new",
        :rec_id       => 1,
        :st_prov_type => "generic",
        :new          => {
          :name         => "New Name",
          :description  => "New Description",
          :st_prov_type => "generic"
        }
      }
      session[:edit] = edit
    end
    # these types do not have tabs on the screen, because we don't show tabs if there is only single tab on screen.
    it "replaces form_div when generic type catalog item type is being added" do
      post :atomic_form_field_changed, :params => {:display => "1", :id => "new"}
      expect(response.body).to include("form_div")
    end

    # these types already have tabs on the screen so it's only matter of show/hide Details tab for those.
    it "does not replace form_div when non-generic type catalog item type is being added" do
      session[:edit][:new][:st_prov_type] = "vmware"
      post :atomic_form_field_changed, :params => {:display => "1", :id => "new"}
      expect(response.body).not_to include("form_div")
    end
  end

  describe 'replace_right_cell' do
    it "Can build all the trees" do
      seed_session_trees('catalog', :sandt_tree, '-Unassigned')
      session_to_sb

      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderCatalogs),
          instance_of(TreeBuilderCatalogItems),
          instance_of(TreeBuilderServiceCatalog),
        )
      )
      expect(controller).to receive(:render)
      controller.send(:replace_right_cell, :replace_trees => %i(stcat sandt svccat))
    end
  end

  context "#atomic_st_edit" do
    it "Atomic Service Template and its valid Resource Actions are saved" do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :button => "save")
      st = FactoryGirl.create(:service_template)
      3.times.each_with_index do |i|
        ns = FactoryGirl.create(:miq_ae_namespace, :name => "ns#{i}")
        cls = FactoryGirl.create(:miq_ae_class, :namespace_id => ns.id, :name => "cls#{i}")
        FactoryGirl.create(:miq_ae_instance, :class_id => cls.id, :name => "inst#{i}")
      end
      retire_fqname    = 'ns0/cls0/inst0'
      provision_fqname = 'ns1/cls1/inst1'
      recon_fqname     = 'ns2/cls2/inst2'
      edit = {
        :new          => {
          :name               => "New Name",
          :description        => "New Description",
          :reconfigure_fqname => recon_fqname,
          :retire_fqname      => retire_fqname,
          :fqname             => provision_fqname},
        :key          => "prov_edit__new",
        :rec_id       => st.id,
        :st_prov_type => "generic"
      }
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      allow(controller).to receive(:replace_right_cell)
      controller.send(:atomic_st_edit)
      {'Provision' => provision_fqname, 'Reconfigure' => recon_fqname, 'Retirement' => retire_fqname}.each do |k, v|
        expect(st.resource_actions.find_by_action(k).fqname).to eq("/#{v}")
      end
    end

    it "Atomic Service Template and its invalid Resource Actions are not saved" do
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :button => 'save')
      st = FactoryGirl.create(:service_template)
      retire_fqname    = 'ns/cls/inst'
      provision_fqname = 'ns1/cls1/inst1'
      recon_fqname     = 'ns2/cls2/inst2'
      edit = {
        :new          => {
          :name               => 'New Name',
          :description        => 'New Description',
          :reconfigure_fqname => recon_fqname,
          :retire_fqname      => retire_fqname,
          :fqname             => provision_fqname},
        :key          => 'prov_edit__new',
        :rec_id       => st.id,
        :st_prov_type => 'generic'
      }
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      controller.send(:atomic_st_edit)
      expect(controller.send(:flash_errors?)).to be_truthy
      flash_messages = assigns(:flash_array)
      expect(flash_messages.size).to eq(3)
      entry_point_names = %w(Provisioning Reconfigure Retirement)
      flash_messages.each_with_index do |msg, i|
        expect(msg[:message]).to eq("Please correct invalid #{entry_point_names[i]} Entry Point prior to saving")
        expect(msg[:level]).to eq(:error)
      end
    end
  end

  context "#x_button catalogitem_edit" do
    before do
      vm = FactoryGirl.create(:vm_vmware,
                              :ext_management_system => FactoryGirl.create(:ems_vmware),
                              :storage               => FactoryGirl.create(:storage))
      @miq_request = FactoryGirl.create(:miq_provision_request, :requester => admin_user, :src_vm_id => vm.id)
      service_template_with_root_tenant.update_attributes(:prov_type => 'vmware')
      service_template_with_root_tenant.add_resource(@miq_request)
      service_template_with_root_tenant.save
    end

    it "shows flash message for missing Request" do
      @miq_request.destroy
      post :x_button, :params => {:id => service_template_with_root_tenant.id, :pressed => "catalogitem_edit", :format => :js}
      expect(assigns(:flash_array).first[:message]).to include("Can not edit selected item, Request is missing")
      expect(assigns(:edit)).to be_nil
    end

    it "continues with setting edit screen when Request is present" do
      post :x_button, :params => {:id => service_template_with_root_tenant.id, :pressed => "catalogitem_edit", :format => :js}
      expect(assigns(:edit)).not_to be_nil
    end
  end

  context "#st_edit" do
    it "@record is cleared out after Service Template is added" do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :button => "add")
      st = FactoryGirl.create(:service_template)
      controller.instance_variable_set(:@record, st)
      provision_fqname = 'ns1/cls1/inst1'
      edit = {
        :new    => {:name               => "New Name",
                    :description        => "New Description",
                    :selected_resources => [st.id],
                    :rsc_groups         => [[{:name => "Some name"}]],
                    :fqname             => provision_fqname,
                   },
        :key    => "st_edit__new",
        :rec_id => st.id,
      }
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      allow(controller).to receive(:replace_right_cell)
      controller.send(:st_edit)
      expect(assigns(:record)).to be_nil
    end
  end

  context "#st_upload_image" do
    before do
      ApplicationController.handle_exceptions = true

      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :button => "save")
      @st = FactoryGirl.create(:service_template)
      3.times.each_with_index do |i|
        ns = FactoryGirl.create(:miq_ae_namespace, :name => "ns#{i}")
        cls = FactoryGirl.create(:miq_ae_class, :namespace_id => ns.id, :name => "cls#{i}")
        FactoryGirl.create(:miq_ae_instance, :class_id => cls.id, :name => "inst#{i}")
      end
      retire_fqname    = 'ns0/cls0/inst0'
      provision_fqname = 'ns1/cls1/inst1'
      recon_fqname     = 'ns2/cls2/inst2'
      edit = {
        :new          => {
          :name               => "New Name",
          :description        => "New Description",
          :reconfigure_fqname => recon_fqname,
          :retire_fqname      => retire_fqname,
          :fqname             => provision_fqname},
        :key          => "prov_edit__new",
        :rec_id       => @st.id,
        :st_prov_type => "generic"
      }
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
    end

    it "uploads a selected png file " do
      file = fixture_file_upload('files/upload_image.png', 'image/png')
      post :st_upload_image, :params => { :format => :js, :id => @st.id, :upload => {:image => file}, :active_tree => :sandt_tree, :commit => 'Upload' }
      expect(assigns(:flash_array).first[:message]).to include('Custom Image file "upload_image.png" successfully uploaded')
    end

    it "displays an error when the selected file is not a png file or .jpg " do
      file = fixture_file_upload('files/upload_image.txt', 'image/png')
      post :st_upload_image, :params => { :format => :js, :id => @st.id, :upload => {:image => file}, :commit => 'Upload' }
      expect(assigns(:flash_array).first[:message]).to include("Custom Image must be a .png or .jpg file")
    end

    it "displays a message when an image file is not selected " do
      post :st_upload_image, :params => { :format => :js, :id => @st.id, :commit => 'Upload' }
      expect(assigns(:flash_array).first[:message]).to include("Use the Choose file button to locate a .png or .jpg image file")
    end
  end

  context "#ot_edit" do
    before(:each) do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :button => "save")
      @new_name = "New Name"
      @new_description = "New Description"
      @new_content = "{\"AWSTemplateFormatVersion\" : \"new-version\"}\n"
      session[:edit] = {
        :new => {
          :name        => @new_name,
          :description => @new_description},
      }
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "Orchestration Template name and description are edited" do
      ot = FactoryGirl.create(:orchestration_template_amazon)
      controller.instance_variable_set(:@record, ot)
      controller.params.merge!(:id => ot.id, :template_content => @new_content)
      session[:edit][:key] = "ot_edit__#{ot.id}"
      session[:edit][:rec_id] = ot.id
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_edit_submit)
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was saved")
      ot.reload
      expect(ot.name).to eq(@new_name)
      expect(ot.description).to eq(@new_description)
      expect(ot.content).to eq(@new_content)
      expect(response.status).to eq(200)
      expect(assigns(:edit)).to be_nil
    end

    it "Azure Orchestration Template name and description are edited" do
      ot = FactoryGirl.create(:orchestration_template_azure_in_json)
      controller.instance_variable_set(:@record, ot)
      controller.params.merge!(:id => ot.id, :template_content => @new_content)
      session[:edit][:key] = "ot_edit__#{ot.id}"
      session[:edit][:rec_id] = ot.id
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_edit_submit)
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was saved")
      ot.reload
      expect(ot.name).to eq(@new_name)
      expect(ot.description).to eq(@new_description)
      expect(ot.content).to eq(@new_content)
      expect(response.status).to eq(200)
      expect(assigns(:edit)).to be_nil
    end

    it "Read-only Orchestration Template content cannot be edited" do
      ot = FactoryGirl.create(:orchestration_template_amazon_with_stacks)
      original_content = ot.content
      controller.params.merge!(:id => ot.id, :template_content => @new_content)
      session[:edit][:key] = "ot_edit__#{ot.id}"
      session[:edit][:rec_id] = ot.id
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_edit_submit)
      ot.reload
      expect(ot.content).to eq(original_content)
      expect(response.status).to eq(200)
      expect(assigns(:edit)).to be_nil
    end

    it "Orchestration Template content cannot be empty during edit" do
      controller.instance_variable_set(:@_params, :button => "save")
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
      ot = FactoryGirl.create(:orchestration_template)
      session[:edit][:key] = "ot_edit__#{ot.id}"
      session[:edit][:rec_id] = ot.id
      original_content = ot.content
      new_content = ""
      controller.params.merge!(:id => ot.id, :template_content => new_content)
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_edit_submit)
      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("cannot be empty")
      ot.reload
      expect(ot.content).to eq(original_content)
    end

    it "Draft flag is set for an Orchestration Template" do
      ot = FactoryGirl.create(:orchestration_template)
      controller.params.merge!(:id => ot.id, :template_content => @new_content)
      session[:edit][:key] = "ot_edit__#{ot.id}"
      session[:edit][:rec_id] = ot.id
      session[:edit][:new][:draft] = "true"
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_edit_submit)
      ot.reload
      expect(ot.draft).to be_truthy
      expect(assigns(:edit)).to be_nil
    end
  end

  context "#ot_copy" do
    before(:each) do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :button => "add")
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
      ot = FactoryGirl.create(:orchestration_template_amazon)
      controller.x_node = "xx-otcfn_ot-#{ot.id}"
      @new_name = "New Name"
      new_description = "New Description"
      new_content = "{\"AWSTemplateFormatVersion\" : \"new-version\"}"
      controller.params.merge!(:original_ot_id   => ot.id,
                               :template_content => new_content)
      session[:edit] = {
        :new => {
          :name        => @new_name,
          :description => new_description
        },
        :key => "ot_edit__#{ot.id}"
      }
    end

    after(:each) do
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was saved")
      expect(response.status).to eq(200)
      expect(OrchestrationTemplate.where(:name => @new_name).first).not_to be_nil
    end

    it "Orchestration Template is copied" do
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_copy_submit)
    end

    it "Orchestration Template is copied as a draft" do
      session[:edit][:new][:draft] = "true"
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_copy_submit)
      expect(OrchestrationTemplate.where(:name => @new_name).first.draft).to be_truthy
    end
  end

  context "#ot_copy" do
    it "Orchestration Template is copied but name is changed" do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
      ot = FactoryGirl.create(:orchestration_template_amazon)
      controller.x_node = "xx-otcfn_ot-#{ot.id}"
      name = "New Name"
      description = "New Description"
      new_content = "{\"AWSTemplateFormatVersion\" : \"new-version\"}"
      session[:edit] = {
        :new => {
          :name        => name,
          :description => description
        },
        :key => "ot_edit__#{ot.id}"
      }

      new_name = "New name for copied OT"
      new_description = "New description for copied OT"

      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@_params,
                                       :name        => new_name,
                                       :description => new_description,
                                       :id          => ot.id.to_s)
      controller.send(:ot_form_field_changed)
      controller.instance_variable_set(:@_params,
                                       :button           => "add",
                                       :original_ot_id   => ot.id,
                                       :template_content => new_content)
      controller.send(:ot_copy_submit)
      expect(OrchestrationTemplate.where(:name        => new_name,
                                         :description => new_description).first).to_not be_nil
    end
  end

  context "#ot_delete" do
    before(:each) do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :pressed => "orchestration_template_remove")
      allow(controller).to receive(:replace_right_cell)
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "Orchestration Template is deleted" do
      ot = FactoryGirl.create(:orchestration_template)
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
      controller.params[:id] = ot.id
      controller.send(:ot_remove_submit)
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was deleted")
      expect(OrchestrationTemplate.find_by_id(ot.id)).to be_nil
    end

    it "Read-only Orchestration Template cannot deleted" do
      ot = FactoryGirl.create(:orchestration_template_with_stacks)
      controller.params[:id] = ot.id
      controller.send(:ot_remove_submit)
      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("read-only and cannot be deleted")
      expect(OrchestrationTemplate.find_by_id(ot.id)).not_to be_nil
    end
  end

  context "#ot_create" do
    before(:each) do
      @new_name = "New Name"
      new_description = "New Description"
      new_type = "ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate"
      @new_content = '{"AWSTemplateFormatVersion" : "2010-09-09"}'
      edit = {
        :new => {
          :name        => @new_name,
          :description => new_description,
          :content     => @new_content,
          :type        => new_type,
          :draft       => false},
        :key => "ot_add__new",
      }
      session[:edit] = edit
      controller.instance_variable_set(:@sb, :trees => {:ot_tree => {:open_nodes => []}}, :active_tree => :ot_tree)
    end

    it "Orchestration Template is created" do
      controller.instance_variable_set(:@_params, :content => @new_content, :button => "add")
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_add_submit)
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
      expect(OrchestrationTemplate.where(:name => @new_name).first).not_to be_nil
    end

    it "Orchestration Template draft is created" do
      controller.instance_variable_set(:@_params, :content => @new_content, :button => "add")
      session[:edit][:new][:draft] = true
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_add_submit)
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was saved")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
      ot = OrchestrationTemplate.where(:name => @new_name).first
      expect(ot).not_to be_nil
      expect(ot.draft).to be_truthy
    end

    it "Orchestration Template creation is cancelled" do
      controller.instance_variable_set(:@_params, :content => @new_content, :button => "cancel")
      allow(controller).to receive(:replace_right_cell)
      controller.send(:ot_add_submit)
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:flash_array).first[:message]).to include("was cancelled")
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
      expect(OrchestrationTemplate.where(:name => @new_name).first).to be_nil
    end
  end

  describe "#tags_edit" do
    before(:each) do
      @ot = FactoryGirl.create(:orchestration_template, :name => "foo")
      allow(@ot).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
      classification = FactoryGirl.create(:classification, :name => "department", :description => "Department")
      @tag1 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag1",
                                 :parent => classification
                                )
      @tag2 = FactoryGirl.create(:classification_tag,
                                 :name   => "tag2",
                                 :parent => classification
                                )
      allow(Classification).to receive(:find_assigned_entries).with(@ot).and_return([@tag1, @tag2])
      controller.instance_variable_set(:@sb,
                                       :trees       => {:ot_tree => {:active_node => "root"}},
                                       :active_tree => :ot_tree)
      allow(controller).to receive(:get_node_info)
      allow(controller).to receive(:replace_right_cell)
      session[:tag_db] = "OrchestrationTemplate"
      edit = {
        :key        => "OrchestrationTemplate_edit_tags__#{@ot.id}",
        :tagging    => "OrchestrationTemplate",
        :object_ids => [@ot.id],
        :current    => {:assignments => []},
        :new        => {:assignments => [@tag1.id, @tag2.id]}
      }
      session[:edit] = edit
    end

    after(:each) do
      expect(response.status).to eq(200)
    end

    it "builds tagging screen" do
      EvmSpecHelper.create_guid_miq_server_zone

      controller.instance_variable_set(:@sb, :action => "ot_tags_edit")
      controller.instance_variable_set(:@_params, :miq_grid_checks => @ot.id.to_s)
      controller.send(:tags_edit, "OrchestrationTemplate")
      expect(assigns(:flash_array)).to be_nil
      expect(assigns(:entries)).not_to be_nil
    end

    it "cancels tags edit" do
      controller.instance_variable_set(:@_params, :button => "cancel", :id => @ot.id)
      controller.send(:tags_edit, "OrchestrationTemplate")
      expect(assigns(:flash_array).first[:message]).to include("was cancelled")
      expect(assigns(:edit)).to be_nil
    end

    it "save tags" do
      controller.instance_variable_set(:@_params, :button => "save", :id => @ot.id)
      controller.send(:tags_edit, "OrchestrationTemplate")
      expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
      expect(assigns(:edit)).to be_nil
    end
  end

  context "#service_dialog_create_from_ot" do
    before(:each) do
      @ot = FactoryGirl.create(:orchestration_template_amazon_in_json)
      @dialog_label = "New Dialog 01"
      session[:edit] = {
        :new    => {:dialog_name => @dialog_label},
        :key    => "ot_edit__#{@ot.id}",
        :rec_id => @ot.id
      }
      controller.instance_variable_set(:@sb, :trees => {:ot_tree => {:open_nodes => []}}, :active_tree => :ot_tree)
      controller.instance_variable_set(:@_response, ActionDispatch::TestResponse.new)
    end

    after(:each) do
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(assigns(:edit)).to be_nil
      expect(response.status).to eq(200)
    end

    it "Service Dialog is created from an Orchestration Template" do
      controller.instance_variable_set(:@_params, :button => "save", :id => @ot.id)
      allow(controller).to receive(:replace_right_cell)
      controller.send(:service_dialog_from_ot_submit)
      expect(assigns(:flash_array).first[:message]).to include("was successfully created")
      expect(Dialog.where(:label => @dialog_label).first).not_to be_nil
    end
  end

  context "#ot_rendering" do
    render_views
    before(:each) do
      EvmSpecHelper.create_guid_miq_server_zone
      session[:settings] = {
        :views => {:orchestrationtemplate => "grid"}
      }
      session[:sandboxes] = {
        "catalog" => {
          :active_tree => :ot_tree
        }
      }

      FactoryGirl.create(:orchestration_template_amazon_in_json)
      FactoryGirl.create(:orchestration_template_openstack_in_yaml)
      FactoryGirl.create(:orchestration_template_azure_in_json)
    end

    after(:each) do
      expect(controller.send(:flash_errors?)).not_to be_truthy
      expect(response.status).to eq(200)
    end

    it "Controller method is called with correct parameters" do
      controller.params[:type] = "tile"
      controller.instance_variable_set(:@settings, :views => {:orchestrationtemplate => "list"})
      expect(controller).to receive(:get_view_calculate_gtl_type).with(:orchestrationtemplate) do
        expect(controller.instance_variable_get(:@settings)).to include(:views => {:orchestrationtemplate => "tile"})
      end
      controller.send(:get_view, "ManageIQ::Providers::Amazon::CloudManager::OrchestrationTemplate", {:gtl_dbname => :orchestrationtemplate})
    end

    it "Renders list of orchestration templates using correct GTL type" do
      %w(root xx-otcfn xx-othot xx-otazu).each do |id|
        post :tree_select, :params => { :id => id, :format => :js }
        expect(response).to have_http_status 200
        expect(response).to render_template('layouts/angular/_gtl')
      end
    end

    it "Renders an orchestration template textual summary" do
      ot = FactoryGirl.create(:orchestration_template_amazon)
      seed_session_trees('catalog', :ot_tree, "xx-otcfn_ot-#{ot.id}")
      post :explorer

      expect(response).to have_http_status 200
      expect(response).to render_template(:partial => 'catalog/_ot_tree_show')
    end
  end

  context "#set_resource_action" do
    before do
      @st = FactoryGirl.create(:service_template)
      dialog = FactoryGirl.create(:dialog,
                                  :label       => "Test Label",
                                  :description => "Test Description",
                                  :buttons     => "submit,reset,cancel"
                                 )
      retire_fqname    = 'ns0/cls0/inst0'
      provision_fqname = 'ns1/cls1/inst1'
      recon_fqname     = 'ns2/cls2/inst2'
      edit = {
        :new => {
          :name               => "New Name",
          :description        => "New Description",
          :dialog_id          => dialog.id,
          :reconfigure_fqname => recon_fqname,
          :retire_fqname      => retire_fqname,
          :fqname             => provision_fqname},
      }
      controller.instance_variable_set(:@edit, edit)
    end
    it "saves resource action" do
      controller.send(:set_resource_action, @st)
      expect(@st.resource_actions.pluck(:action)).to match_array(%w(Provision Retirement Reconfigure))
    end

    it "does not save blank resource action" do
      assigns(:edit)[:new][:reconfigure_fqname] = ''
      controller.send(:set_resource_action, @st)
      expect(@st.resource_actions.pluck(:action)).to match_array(%w(Provision Retirement))
    end
  end

  context "#st_set_record_vars" do
    before do
      @st = FactoryGirl.create(:service_template)
      @catalog = FactoryGirl.create(:service_template_catalog,
                                    :name        => "foo",
                                    :description => "FOO"
                                   )
      edit = {
        :new => {
          :name               => "New Name",
          :description        => "New Description",
          :display            => false,
          :catalog_id         => @catalog.id,
          :selected_resources => [],
        }
      }
      controller.instance_variable_set(:@edit, edit)
    end

    it "sets catalog for Catalog Bundle even when display is set to false" do
      controller.send(:st_set_record_vars, @st)
      expect(@st.service_template_catalog).to match(@catalog)
    end
  end

  context "#st_set_form_vars" do
    before do
      bundle = FactoryGirl.create(:service_template)
      controller.instance_variable_set(:@record, bundle)
    end

    it "sets default entry points for Catalog Bundle" do
      controller.send(:st_set_form_vars)
      expect(assigns(:edit)[:new][:fqname]).to include("CatalogBundleInitialization")
      expect(assigns(:edit)[:new][:retire_fqname]).to include("Default")
    end
  end

  context "#st_catalog_new" do
    it "renders views successfully after button is pressed" do
      controller.instance_variable_set(:@sb, {})
      controller.instance_variable_set(:@_params, :pressed => 'st_catalog_new', :action => 'x_button')
      edit = {
        :new => {:name             => "",
                 :description      => "",
                 :fields           => [],
                 :available_fields => [],
        },
        :key => "st_catalog_edit__new"
      }
      controller.instance_variable_set(:@edit, edit)
      controller.x_node = "root"
      session[:edit] = edit
      expect(controller).to receive(:render)
      controller.send(:st_catalog_edit)
      expect(response).to have_http_status 200
    end
  end

  context "#need_ansible_locals?" do
    before do
      controller.instance_variable_set(:@nodetype, 'st')
      st = FactoryGirl.create(:service_template,
                              :type      => "ServiceTemplateAnsiblePlaybook",
                              :prov_type => "generic_ansible_playbook")
      controller.instance_variable_set(:@record, st)
    end

    it "returns true for Ansible Playbook Service Template in Catalog Items accordion only" do
      controller.instance_variable_set(:@sb,
                                       :trees       => {:sandt_tree => {:open_nodes => []}},
                                       :active_tree => :sandt_tree)
      expect(controller.send(:need_ansible_locals?)).to be_truthy
    end

    it "returns false for Ansible Playbook Service Template in other accordions" do
      controller.instance_variable_set(:@sb,
                                       :trees       => {:svccat_tree => {:open_nodes => []}},
                                       :active_tree => :svccat_tree)
      expect(controller.send(:need_ansible_locals?)).to be_falsey
    end

    it "returns false for any other Service Template in Catalog Items accordions" do
      controller.instance_variable_set(:@record, FactoryGirl.create(:service_template))
      controller.instance_variable_set(:@sb,
                                       :trees       => {:svccat_tree => {:open_nodes => []}},
                                       :active_tree => :svccat_tree)
      expect(controller.send(:need_ansible_locals?)).to be_falsey
    end

    it "returns false for any other Service Template in other accordions" do
      controller.instance_variable_set(:@record, FactoryGirl.create(:service_template))
      controller.instance_variable_set(:@sb,
                                       :trees       => {:svccat_tree => {:open_nodes => []}},
                                       :active_tree => :svccat_tree)
      expect(controller.send(:need_ansible_locals?)).to be_falsey
    end
  end

  context "#get_available_resources" do
    it "list of available resources should not include Ansible Playbook Service Templates" do
      FactoryGirl.create(:service_template, :type => "ServiceTemplateAnsiblePlaybook")
      controller.instance_variable_set(:@edit, :new => {:selected_resources => []})
      controller.send(:get_available_resources, "ServiceTemplate")
      expect(assigns(:edit)[:new][:available_resources].count).to eq(2)
    end

    context "#get_available_resources" do
      let(:user_role) { FactoryGirl.create(:miq_user_role) }
      let(:miq_group) { FactoryGirl.create(:miq_group, :miq_user_role => user_role, :entitlement => Entitlement.create!) }

      before :each do
        @st1 = FactoryGirl.create(:service_template, :type => "ServiceTemplate")
        @st2 = FactoryGirl.create(:service_template, :type => "ServiceTemplate")
        @st3 = FactoryGirl.create(:service_template, :type => "ServiceTemplate")
        @st1.tag_with('/managed/service_level/one', :ns => '*')
        @st2.tag_with('/managed/service_level/one', :ns => '*')
        @st3.tag_with('/managed/service_level/two', :ns => '*')
      end

      it "list of available resources should contain the ones for the group matching tag Rbac" do
        user = FactoryGirl.create(:user, :miq_groups => [miq_group])
        user.current_group.entitlement = Entitlement.create!
        user.current_group.entitlement.set_managed_filters([["/managed/service_level/one"]])
        user.current_group.save
        allow(User).to receive(:current_user).and_return(user)
        controller.instance_variable_set(:@edit, :new => {:selected_resources => []})
        controller.send(:get_available_resources, "ServiceTemplate")
        expect(assigns(:edit)[:new][:available_resources].count).to eq(2)
      end

      it "list of available resources should not contain the ones for the group not matching tag Rbac" do
        user = FactoryGirl.create(:user, :miq_groups => [miq_group])
        user.current_group.entitlement = Entitlement.create!
        user.current_group.entitlement.set_managed_filters([["/managed/service_level/zero"]])
        user.current_group.save
        allow(User).to receive(:current_user).and_return(user)
        controller.instance_variable_set(:@edit, :new => {:selected_resources => []})
        controller.send(:get_available_resources, "ServiceTemplate")
        expect(assigns(:edit)[:new][:available_resources].count).to eq(0)
      end

      it "list of available resources for all tags matching Rbac" do
        user = FactoryGirl.create(:user, :miq_groups => [miq_group])
        user.current_group.entitlement = Entitlement.create!
        user.current_group.entitlement.set_managed_filters([])
        user.current_group.save
        allow(User).to receive(:current_user).and_return(user)
        controller.instance_variable_set(:@edit, :new => {:selected_resources => []})
        controller.send(:get_available_resources, "ServiceTemplate")
        expect(assigns(:edit)[:new][:available_resources].count).to eq(5)
      end
    end
  end

  context "#fetch_playbook_details" do
    let(:auth) { FactoryGirl.create(:authentication, :name => "machine_cred", :manager_ref => 6, :type => "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::MachineCredential") }
    let(:repository) { FactoryGirl.create(:configuration_script_source, :manager => ems, :type => "ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource") }
    let(:inventory_root_group) { FactoryGirl.create(:inventory_root_group, :name => 'Demo Inventory') }
    let(:ems) do
      FactoryGirl.create(:automation_manager_ansible_tower, :inventory_root_groups => [inventory_root_group], :provider => FactoryGirl.create(:provider_embedded_ansible))
    end
    let(:dialog) { FactoryGirl.create(:dialog, :label => "Some Label") }
    let(:playbook) do
      FactoryGirl.create(:embedded_playbook,
                         :configuration_script_source => repository,
                         :manager                     => ems,
                         :inventory_root_group        => inventory_root_group)
    end

    it "returns playbook service template details for provision & retirement tabs for summary screen" do
      options = {
        :name        => 'test_ansible_catalog_item',
        :description => 'test ansible',
        :display     => true,
        :config_info => {
          :provision  => {
            :new_dialog_name => 'test_dialog',
            :hosts           => 'many',
            :credential_id   => auth.id,
            :repository_id   => repository.id,
            :playbook_id     => playbook.id,
            :dialog_id       => dialog.id,
            :execution_ttl   => nil,
            :verbosity       => 4,
            :log_output      => nil,
          },
          :retirement => {
            :new_dialog_name => 'test_dialog',
            :hosts           => 'many',
            :credential_id   => auth.id,
            :repository_id   => repository.id,
            :playbook_id     => playbook.id,
            :execution_ttl   => nil,
            :verbosity       => 0,
            :log_output      => nil,
          }
        }
      }
      service_template = double("ServiceTemplateAnsiblePlaybook", options)
      controller.instance_variable_set(:@record, service_template)
      playbook_details = controller.send(:fetch_playbook_details)
      st_details = {
        :provisioning => {
          :repository         => repository.name,
          :playbook           => playbook.name,
          :machine_credential => auth.name,
          :dialog             => "Some Label",
          :dialog_id          => dialog.id,
          :become_enabled     => "No",
          :execution_ttl      => nil,
          :verbosity          => 4,
          :log_output         => nil,
        },
        :retirement   => {
          :remove_resources   => nil,
          :repository         => repository.name,
          :playbook           => playbook.name,
          :machine_credential => auth.name,
          :become_enabled     => "No",
          :execution_ttl      => nil,
          :verbosity          => 0,
          :log_output         => nil,
        }
      }
      expect(playbook_details).to eq(st_details)
    end

    it "returns nil for objects that are not found in the database for provision & retirement tabs on summary screen" do
      options = {
        :name        => 'test_ansible_catalog_item',
        :description => 'test ansible',
        :display     => true,
        :config_info => {
          :provision  => {
            :new_dialog_name => 'test_dialog',
            :hosts           => 'many',
            :credential_id   => auth.id,
            :repository_id   => 1,
            :playbook_id     => playbook.id,
            :dialog_id       => 2,
            :execution_ttl   => nil,
            :verbosity       => 4,
            :log_output         => nil,
          },
          :retirement => {
            :new_dialog_name => 'test_dialog',
            :hosts           => 'many',
            :credential_id   => auth.id,
            :repository_id   => repository.id,
            :playbook_id     => 2,
            :execution_ttl   => nil,
            :verbosity       => 0,
            :log_output         => nil,
          }
        }
      }
      service_template = double("ServiceTemplateAnsiblePlaybook", options)
      controller.instance_variable_set(:@record, service_template)
      playbook_details = controller.send(:fetch_playbook_details)
      st_details = {
        :provisioning => {
          :repository         => nil,
          :playbook           => playbook.name,
          :machine_credential => auth.name,
          :become_enabled     => "No",
          :execution_ttl      => nil,
          :verbosity          => 4,
          :log_output         => nil,
        },
        :retirement   => {
          :remove_resources   => nil,
          :repository         => repository.name,
          :playbook           => nil,
          :machine_credential => auth.name,
          :become_enabled     => "No",
          :execution_ttl      => nil,
          :verbosity          => 0,
          :log_output         => nil,
        }
      }
      expect(playbook_details).to eq(st_details)
    end
  end

  context "#atomic_req_submit" do
    let(:ems) { FactoryGirl.create(:ems_openshift) }
    let(:container_template) {
      FactoryGirl.create(:container_template,
                         :ext_management_system => ems,
                         :name                  => "Test Template")
    }

    let(:service_template_catalog) { FactoryGirl.create(:service_template_catalog) }
    let(:dialog) { FactoryGirl.create(:dialog) }

    before :each do
      controller.instance_variable_set(:@sb, {})
      ns = FactoryGirl.create(:miq_ae_namespace, :name => "ns")
      cls = FactoryGirl.create(:miq_ae_class, :namespace_id => ns.id, :name => "cls")
      FactoryGirl.create(:miq_ae_instance, :class_id => cls.id, :name => "inst")
      edit = {
        :key          => "prov_edit__new",
        :st_prov_type => "generic_container_template",
        :new          => {
          :name         => "New Name",
          :description  => "New Description",
          :st_prov_type => "generic_container_template",
          :fqname       => "ns/cls/inst",
          :display      => true,
          :dialog_id    => dialog.id,
          :template_id  => container_template.id,
          :manager_id   => ems.id
        }
      }
      session[:edit] = edit
    end

    it "Adds ServiceTemplateContainerTemplate record and it config_info" do
      options = {:provision => {:container_template_id => container_template.id, :dialog_id => dialog.id, :fqname => "ns/cls/inst"}}
      allow(controller).to receive(:replace_right_cell)
      controller.send(:atomic_req_submit)
      expect(assigns(:flash_array).first[:message]).to include("Service Catalog Item \"New Name\" was added")
      expect(ServiceTemplateContainerTemplate.first.config_info).to eq(options)
    end
  end

  context "#fetch_ct_details" do
    let(:ems) { FactoryGirl.create(:ems_openshift) }
    let(:container_template) {
      FactoryGirl.create(:container_template,
                         :ext_management_system => ems,
                         :name                  => "Test Template")
    }

    let(:service_template_catalog) { FactoryGirl.create(:service_template_catalog) }
    let(:dialog) { FactoryGirl.create(:dialog) }

    let(:catalog_item_options) do
      {
        :name                        => 'container_template_catalog_item',
        :description                 => 'test container template',
        :service_template_catalog_id => service_template_catalog.id,
        :display                     => true,
        :config_info                 => {
          :provision => {
            :dialog_id             => dialog.id,
            :container_template_id => container_template.id
          },
        }
      }
    end

    let(:service_template_container_template) { ServiceTemplateContainerTemplate.create_catalog_item(catalog_item_options) }

    it "returns container template service template details for summary screen" do
      options = {:provisioning => {:template_name => "Test Template", :provider_name => ems.name}}
      controller.instance_variable_set(:@record, service_template_container_template)
      ct_details = controller.send(:fetch_ct_details)
      expect(ct_details).to eq(options)
    end

    describe '#replace_right_cell' do
      let(:dialog)           { FactoryGirl.create(:dialog, :label => 'Transform VM', :buttons => 'submit') }
      before do
        allow(controller).to receive(:params).and_return(:action => 'dialog_provision')
        controller.instance_variable_set(:@in_a_form, true)
        controller.instance_variable_set(:@record, dialog)
        controller.instance_variable_set(:@edit, {:rec_id => '1'})
        controller.instance_variable_set(:@sb,
                                         :trees       => {:svccat_tree => {:open_nodes => [], :active_node => "root"}},
                                         :active_tree => :svccat_tree)
        @presenter = ExplorerPresenter.new(:active_tree => :svccat_tree)
        allow(controller).to receive(:render).and_return(nil)
      end

      it 'should render and make form buttons visible when product setting is set to render old dialogs' do
        ::Settings.product.old_dialog_user_ui = true
        controller.send(:replace_right_cell, {:action => "dialog_provision", :presenter => @presenter})
        expect(@presenter[:set_visible_elements]).to include(:form_buttons_div => true)
        expect(@presenter[:set_visible_elements]).to include(:buttons_on => true)
      end

      it 'should not render and show form buttons when product setting is NOT set to render old dialogs' do
        ::Settings.product.old_dialog_user_ui = false

        controller.send(:replace_right_cell, {:action => "dialog_provision", :presenter => @presenter})
        expect(@presenter[:set_visible_elements]).to include(:form_buttons_div => false)
      end
    end
  end

  describe '#service_template_list' do
    let(:sandbox) { {:active_tree => tree} }

    before do
      controller.instance_variable_set(:@sb, sandbox)
    end

    context 'Service Catalogs accordion' do
      let(:tree) { :svccat_tree }

      it 'sets options for rendering proper type of view' do
        expect(controller).to receive(:process_show_list).with(:gtl_dbname => :catalog, :named_scope => {})
        controller.send(:service_template_list, {})
      end
    end
  end
end
