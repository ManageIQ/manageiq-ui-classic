describe OpsController do
  render_views

  context "::Tenants" do
    before do
      Tenant.seed
      MiqRegion.seed
      stub_user(:features => :all)
    end

    let(:four_terabytes) { 4096 * 1024 * 1024 * 1024 }

    context "#tree_select" do
      it "renders rbac_details tab when rbac_tree root node is selected" do
        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => 'root', :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)
      end

      it "renders tenants partial when tenant node is selected" do
        tenant = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant)

        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => "tn-#{tenant.id}", :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)
      end

      it "does not display tenant groups in the details paged" do
        tenant = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant)

        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => "tn-#{tenant.id}", :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)
        expect(response.body).not_to include('View this Group')
      end

      it "renders quota usage table for tenant" do
        tenant = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant)
        tenant.set_quotas(:cpu_allocated => {:value => 1024},
                          :vms_allocated => {:value => 27},
                          :mem_allocated => {:value => four_terabytes})

        session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
        post :tree_select, :params => { :id => "tn-#{tenant.id}", :format => :js }

        expect(response).to render_template('ops/_rbac_details_tab')
        expect(response.status).to eq(200)

        tab_content = JSON.parse(response.body)['replacePartials']['ops_tabs']
        expect(tab_content).to include('Tenant Quota')
        expect(tab_content).to include("<th>\nName\n<\/th>\n<th>\nTotal Quota\n<\/th>\n<th>\nIn Use\n" \
                                         "<\/th>\n<th>\nAllocated\n<\/th>\n<th>\nAvailable\n<\/th>")
        expect(tab_content).to include('4096.0 GB')
        expect(tab_content).to include('1024 Count')
        expect(tab_content).to include('27 Count')
      end
    end

    context "#rbac_tenant_get_details" do
      it "sets @tenant record" do
        t = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant, :subdomain => "foo")
        controller.send(:rbac_tenant_get_details, t.id)
        expect(assigns(:tenant)).to eq(t)
      end
    end

    context "#rbac_tenant_delete" do
      before do
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
        @t = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant)
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{@t.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        controller.instance_variable_set(:@_params, :id => @t.id)
        expect(controller).to receive(:render)
      end

      it "deletes a tenant record successfully" do
        expect(controller).to receive(:x_active_tree_replace_cell)
        controller.send(:rbac_tenant_delete)

        expect(response.status).to eq(200)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Delete successful")
        expect(flash_message[:level]).to be(:success)
      end

      it "returns error flash when tenant cannot be deleted" do
        FactoryGirl.create(:miq_group, :tenant => @t)
        controller.send(:rbac_tenant_delete)

        expect(response.status).to eq(200)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Error during delete")
        expect(flash_message[:level]).to be(:error)
      end

      it "deletes checked tenant records successfully" do
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
        t = FactoryGirl.create(:tenant, :parent => Tenant.root_tenant)
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{t.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        allow(controller).to receive(:find_checked_items).and_return([t.id])
        expect(controller).to receive(:x_active_tree_replace_cell)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_delete)

        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Delete successful")
        expect(flash_message[:level]).to be(:success)
      end
    end

    context "#rbac_tenants_list" do
      it "gets the list of tenants by calling get_view with correct args" do
        controller.instance_variable_set(:@sb, {})
        controller.instance_variable_set(:@settings, {})
        expect(controller).to receive(:get_view).with(Tenant, :named_scope => :in_my_region).and_return(
          [double('view', :table => double('table', :data => [])), {}]
        )
        controller.send(:rbac_tenants_list)
        expect(response.status).to eq(200)
        expect(assigns(:view)).not_to be_nil
        expect(assigns(:pages)).not_to be_nil
      end

      context 'get_view' do
        it "returns the list of tenants" do
          view, pages = controller.send(:get_view, Tenant, {:named_scope => :in_my_region}, true)
          expect(view).not_to be_nil
          expect(pages).not_to be_nil
        end
      end
    end

    context "#rbac_tenant_edit" do
      before do
        @tenant = FactoryGirl.create(:tenant,
                                     :name      => "Foo",
                                     :parent    => Tenant.root_tenant,
                                     :subdomain => "test")
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{@tenant.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
      end
      it "resets tenant edit" do
        controller.instance_variable_set(:@_params, :id => @tenant.id, :button => "reset")
        expect(controller).to receive(:render)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_edit)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("All changes have been reset")
        expect(flash_message[:level]).to be(:warning)
      end

      it "cancels tenant edit" do
        controller.instance_variable_set(:@_params, :id => @tenant.id, :button => "cancel", :divisible => "true")
        expect(controller).to receive(:x_active_tree_replace_cell)
        expect(controller).to receive(:render)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_edit)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Edit of Tenant \"#{@tenant.name}\" was cancelled by the user")
        expect(flash_message[:level]).to be(:success)
      end

      it "saves tenant record changes" do
        controller.instance_variable_set(:@_params,
                                         :name        => "Foo_Bar",
                                         :description => "Foo Bar Description",
                                         :id          => @tenant.id,
                                         :button      => "save",
                                         :divisible   => "true")
        expect(controller).to receive(:x_active_tree_replace_cell)
        expect(controller).to receive(:render)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_edit)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Tenant \"Foo_Bar\" was saved")
        expect(flash_message[:level]).to be(:success)
      end
    end

    context "#tenant_set_record_vars" do
      before do
        @tenant = Tenant.seed
        server = EvmSpecHelper.local_miq_server
        allow(MiqServer).to receive(:my_server).and_return(server)
      end

      it "saves name in record when use_config_attributes is true" do
        controller.instance_variable_set(:@_params,
                                         :divisible                 => true,
                                         :use_config_for_attributes => "on"
                                        )
        controller.send(:tenant_set_record_vars, @tenant)
        stub_settings(:server => {:company => "Settings Company Name"})
        expect(@tenant.name).to eq "Settings Company Name"
      end

      it "does not save name in record when use_config_for_attributes is true" do
        controller.instance_variable_set(:@_params,
                                         :name      => "Foo_Bar",
                                         :divisible => true
                                        )
        @tenant.update_attributes(:use_config_for_attributes => false)
        @tenant.reload
        controller.send(:tenant_set_record_vars, @tenant)
        expect(@tenant.name).to eq("Foo_Bar")
      end
    end

    context "#tenant_set_record_vars" do
      before :each do
        @tenant = FactoryGirl.create(:tenant,
                                     :name        => "Foo",
                                     :description => "Foo Description",
                                     :divisible   => 1,
                                     :parent      => Tenant.root_tenant)
        controller.instance_variable_set(:@_params,
                                         :name      => "Foo_Bar",
                                         :divisible => "False",
                                         :parent    => "some_parent"
                                        )
      end

      it "does not change value of parent & divisible fields for existing record" do
        controller.send(:tenant_set_record_vars, @tenant)
        expect(@tenant.divisible).to be_truthy
        expect(@tenant.parent.id).to eq(Tenant.root_tenant.id)
        expect(@tenant.name).to eq("Foo_Bar")
      end

      it "sets value of parent & divisible fields for new record" do
        tenant = FactoryGirl.build(:tenant, :parent => Tenant.root_tenant)
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{@tenant.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        controller.send(:tenant_set_record_vars, tenant)
        expect(tenant.divisible).to be_falsey
        expect(tenant.parent.id).to eq(@tenant.id)
        expect(tenant.name).to eq("Foo_Bar")
      end
    end

    context "#rbac_tenant_manage_quotas" do
      before do
        @tenant = FactoryGirl.create(:tenant,
                                     :name      => "OneTenant",
                                     :parent    => Tenant.root_tenant,
                                     :domain    => "test",
                                     :subdomain => "test")
        sb_hash = {
          :trees       => {:rbac_tree => {:active_node => "tn-#{@tenant.id}"}},
          :active_tree => :rbac_tree,
          :active_tab  => "rbac_details"
        }
        controller.instance_variable_set(:@sb, sb_hash)
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
      end
      it "resets tenant manage quotas" do
        controller.instance_variable_set(:@_params, :id => @tenant.id, :button => "reset")
        expect(controller).to receive(:render)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_manage_quotas)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("All changes have been reset")
        expect(flash_message[:level]).to be(:warning)
      end

      it "cancels tenant manage quotas" do
        controller.instance_variable_set(:@_params, :id => @tenant.id, :button => "cancel", :divisible => "true")
        expect(controller).to receive(:render)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_manage_quotas)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message])
          .to include("Manage quotas for Tenant \"#{@tenant.name}\" was cancelled by the user")
        expect(flash_message[:level]).to be(:success)
      end

      it "saves tenant quotas record changes" do
        controller.instance_variable_set(:@_params,
                                         :name      => "OneTenant",
                                         :quotas    => {
                                           :cpu_allocated => {:value => 1024.0},
                                           :mem_allocated => {:value => 4096.0}
                                         },
                                         :id        => @tenant.id,
                                         :button    => "save",
                                         :divisible => "true")
        expect(controller).to receive(:render)
        expect(response.status).to eq(200)
        controller.send(:rbac_tenant_manage_quotas)
        flash_message = assigns(:flash_array).first
        expect(flash_message[:message]).to include("Quotas for Tenant \"OneTenant\" were saved")
        expect(flash_message[:level]).to be(:success)
      end
    end

    describe "#tags_edit" do
      let!(:user) { stub_user(:features => :all) }
      before(:each) do
        @tenant = FactoryGirl.create(:tenant,
                                     :name      => "OneTenant",
                                     :parent    => Tenant.root_tenant,
                                     :domain    => "test",
                                     :subdomain => "test")
        sb_hash = { :trees       => {:rbac_tree => {:active_node => "tn-#{@tenant.id}"}},
                    :active_tree => :rbac_tree,
                    :active_tab  => "rbac_details"
                  }
        controller.instance_variable_set(:@sb, sb_hash)
        allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
        allow(@tenant).to receive(:tagged_with).with(:cat => user.userid).and_return("my tags")
        classification = FactoryGirl.create(:classification, :name => "department", :description => "Department")
        @tag1 = FactoryGirl.create(:classification_tag,
                                   :name   => "tag1",
                                   :parent => classification
                                  )
        @tag2 = FactoryGirl.create(:classification_tag,
                                   :name   => "tag2",
                                   :parent => classification
                                  )
        allow(Classification).to receive(:find_assigned_entries).with(@tenant).and_return([@tag1, @tag2])
        controller.instance_variable_set(:@sb,
                                         :trees       => {:rbac_tree => {:active_node => "root"}},
                                         :active_tree => :rbac_tree)
        allow(controller).to receive(:get_node_info)
        allow(controller).to receive(:replace_right_cell)
        session[:tag_db] = "Tenant"
        edit = { :key        => "Tenant_edit_tags__#{@tenant.id}",
                 :tagging    => "Tenant",
                 :object_ids => [@tenant.id],
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

        controller.instance_variable_set(:@sb, :action => "rbac_tenant_tags_edit")
        controller.instance_variable_set(:@_params, :miq_grid_checks => @tenant.id.to_s)
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array)).to be_nil
        expect(assigns(:entries)).not_to be_nil
      end

      it "cancels tags edit" do
        controller.instance_variable_set(:@_params, :button => "cancel", :id => @tenant.id)
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array).first[:message]).to include("was cancelled")
        expect(assigns(:edit)).to be_nil
      end

      it "resets tags edit" do
        controller.instance_variable_set(:@_params, :button => "reset", :id => @tenant.id)
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array).first[:message]).to include("All changes have been reset")
        expect(assigns(:entries)).not_to be_nil
      end

      it "save tags" do
        controller.instance_variable_set(:@_params, :button => "save", :id => @tenant.id)
        controller.send(:rbac_tenant_tags_edit)
        expect(assigns(:flash_array).first[:message]).to include("Tag edits were successfully saved")
        expect(assigns(:edit)).to be_nil
      end
    end
  end

  context "::MiqGroup" do
    before do
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      Tenant.seed

      stub_user(:features => :all)
      @group = FactoryGirl.create(:miq_group)
      @role = MiqUserRole.find_by(:name => "EvmRole-operator")
      FactoryGirl.create(
        :classification,
        :name        => "env",
        :description => "Environment",
        :children    => [FactoryGirl.create(:classification)]
      )
      @exp = MiqExpression.new("=" => {:tag => "name", :value => "Test"}, :token => 1)
      allow(ApplicationHelper).to receive(:role_allows?).and_return(true)
    end

    it "saves the filters when use_filter_expression is false" do
      @group.entitlement = Entitlement.create!
      controller.instance_variable_set(:@edit, :new => {:use_filter_expression => false,
                                                        :name                  => 'Name',
                                                        :description           => "Test",
                                                        :role                  => @role.id,
                                                        :filter_expression     => @exp.exp,
                                                        :belongsto             => {},
                                                        :filters               => {'managed/env' => '/managed/env'}})
      controller.send(:rbac_group_set_record_vars, @group)
      expect(@group.entitlement.filter_expression).to be_nil
      expect(@group.entitlement.get_managed_filters).to match([["/managed/env"]])
    end

    it "saves the filter_expression when use_filter_expression true" do
      controller.instance_variable_set(:@edit, :new => {:use_filter_expression => true,
                                                        :name                  => 'Name',
                                                        :description           => "Test",
                                                        :role                  => @role.id,
                                                        :filter_expression     => @exp.exp,
                                                        :belongsto             => {},
                                                        :filters               => {'managed/env' => '/managed/env'}})
      controller.send(:rbac_group_set_record_vars, @group)
      expect(@group.entitlement.get_managed_filters).to eq([])
      expect(@group.entitlement.filter_expression.exp).to match(@exp.exp)
    end

    render_views

    it "uses tags field only when editing the group filter_expression" do
      new = {:use_filter_expression => true,
             :name                  => 'Name',
             :description           => "Test",
             :role                  => @role.id,
             :filter_expression     => @exp.exp,
             :exp_key               => 'foo',
             :belongsto             => {},
             :filters               => {'managed/env' => '/managed/env'}}
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@_params, :use_filter_expression => "true", :id => "new")

      edit = {:key      => "rbac_group_edit__new",
              :new      => new,
              :current  => new,
              :edit_exp => {:key => '???'}}
      edit[:filter_expression] ||= ApplicationController::Filter::Expression.new
      edit[:filter_expression][:expression] = {:test => "foo", :token => 1}
      edit[:new][:filter_expression] = copy_hash(edit[:filter_expression][:expression])
      edit[:filter_expression].history.reset(edit[:filter_expression][:expression])
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@expkey, :filter_expression)
      edit[:filter_expression][:exp_table] = controller.send(:exp_build_table, edit[:filter_expression][:expression])
      edit[:filter_expression][:exp_model] = @group.class.to_s
      session[:edit] = edit
      session[:expkey] = :filter_expression
      controller.instance_variable_set(:@edit, edit)
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)

      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(MiqExpression).to receive(:tag_details)
      post :exp_token_pressed, :params => {:id => 'new', :use_filter_expression => "true", :token => 1}
      @edit = controller.instance_variable_get(:@edit)
      expect(@edit[:filter_expression][:exp_typ]).to eq('tags')
    end

    it "calls MiqExpression.tag_details to get only the My Company type tag categories" do
      new = {:use_filter_expression => true,
             :name                  => 'Name',
             :description           => "Test",
             :role                  => @role.id,
             :belongsto             => {},
             :filters               => {'managed/env' => '/managed/env'}}
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@_params, :use_filter_expression => "true", :id => "new")

      edit = {:key      => "rbac_group_edit__new",
              :new      => new,
              :current  => new,
              :edit_exp => {:key => '???'}}
      edit[:filter_expression] ||= ApplicationController::Filter::Expression.new
      edit[:filter_expression][:expression] = {"???" => "???"}
      edit[:new][:filter_expression] = copy_hash(edit[:filter_expression][:expression])
      edit[:filter_expression].history.reset(edit[:filter_expression][:expression])
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@expkey, :filter_expression)
      edit[:filter_expression][:exp_table] = controller.send(:exp_build_table, edit[:filter_expression][:expression])
      edit[:filter_expression][:exp_model] = @group.class.to_s
      session[:edit] = edit
      session[:expkey] = :filter_expression
      controller.instance_variable_set(:@edit, edit)
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)

      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(MiqExpression).to receive(:tag_details)
      post :rbac_group_field_changed, :params => { :id => 'new',  :use_filter_expression => "true"}
    end

    it "initializes the group record and tag tree when switching tabs" do
      controller.instance_variable_set(:@edit,
                                       :group_id => @group.id,
                                       :new      => {:use_filter_expression => true,
                                                     :name                  => 'Name',
                                                     :description           => "Test",
                                                     :role                  => @role.id,
                                                     :filter_expression     => @exp.exp,
                                                     :belongsto             => {},
                                                     :filters               => {'managed/env' => '/managed/env'}})
      controller.instance_variable_set(:@sb, :active_rbac_group_tab => 'rbac_customer_tags')
      controller.instance_variable_set(:@_params, :use_filter_expression => "false", :id => @group.id)
      controller.send(:rbac_group_get_form_vars)
      expect(controller.instance_variable_get(:@group).name).to eq(@group.name)
      expect(controller.instance_variable_get(:@tags_tree)).to_not be_nil
    end
  end

  context "rbac_role_edit" do
    before do
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      stub_user(:features => :all)
    end

    it "creates a new user role successfully" do
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@_params, :button => "add")
      new = {:features => ["everything"], :name => "foo"}
      edit = {:key     => "rbac_role_edit__new",
              :new     => new,
              :current => new
      }
      session[:edit] = edit
      controller.send(:rbac_role_edit)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Role \"foo\" was saved")
      expect(controller.send(:flash_errors?)).to be_falsey
    end
  end

  context "rbac_role_set_form_vars" do
    before do
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      stub_user(:features => :all)
      @vm_role = FactoryGirl.create(:miq_user_role, :features => %w(embedded_automation_manager))
    end

    it "the feature list to edit should contain the children roles" do
      EvmSpecHelper.seed_specific_product_features(%w(everything embedded_automation_manager embedded_configuration_script_source_view))
      sb_hash = {:trees => {:active_tree => :rbac_tree, :typ => 'new'}}
      controller.instance_variable_set(:@sb, sb_hash)
      record = MiqUserRole.new
      record.miq_product_features = [MiqProductFeature.find_by(:identifier => MiqProductFeature.feature_root)]
      controller.instance_variable_set(:@record, record)
      allow(controller).to receive(:replace_right_cell)
      allow(controller).to receive(:build_rbac_feature_tree)
      controller.instance_variable_set(:@_params, :button => "add")

      new = {:features => ["everything"], :name => "foo"}
      edit = {:key     => "rbac_role_edit__new",
              :new     => new,
              :current => new}
      session[:edit] = edit
      controller.send(:rbac_role_set_form_vars)
      expect(controller.instance_variable_get(:@edit)[:new][:features]).to include('embedded_configuration_script_source_view')
    end
  end

  render_views

  context "::MiqRegion" do
    before do
      EvmSpecHelper.local_miq_server
      root_tenant = Tenant.seed
      MiqUserRole.seed
      MiqGroup.seed
      MiqRegion.seed
      role = MiqUserRole.find_by_name("EvmRole-SuperAdministrator")
      @t1 = FactoryGirl.create(:tenant, :name => "ten1", :parent => root_tenant)
      @g1 = FactoryGirl.create(:miq_group, :description => 'group1', :tenant => @t1, :miq_user_role => role)
      @u1 = FactoryGirl.create(:user, :miq_groups => [@g1])
      @t2 = FactoryGirl.create(:tenant, :name => "ten2", :parent => root_tenant)
      @g2a  = FactoryGirl.create(:miq_group, :description => 'gr2a', :tenant => @t2, :miq_user_role => role)
      @g2b  = FactoryGirl.create(:miq_group, :description => 'gr2b1', :tenant => @t2, :miq_user_role => role)
      @u2a = FactoryGirl.create(:user, :miq_groups => [@g2a])
      @u2a2 = FactoryGirl.create(:user, :miq_groups => [@g2a])
      @u2b = FactoryGirl.create(:user, :miq_groups => [@g2b])
      @u2b2 = FactoryGirl.create(:user, :miq_groups => [@g2b])
      @u2b3 = FactoryGirl.create(:user, :miq_groups => [@g2b])
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)
    end

    it "displays the access object count for the current tenant" do
      login_as @u1
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)
      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(controller.instance_variable_get(:@groups_count)).to eq(1)
      expect(controller.instance_variable_get(:@tenants_count)).to eq(1)
      expect(controller.instance_variable_get(:@users_count)).to eq(1)
    end

    it "displays the access object count for the current user" do
      login_as @u2a
      session[:sandboxes] = {"ops" => {:active_tree => :rbac_tree}}
      allow(controller).to receive(:replace_right_cell)
      post :tree_select, :params => { :id => 'root', :format => :js }
      expect(controller.instance_variable_get(:@groups_count)).to eq(1)
      expect(controller.instance_variable_get(:@tenants_count)).to eq(1)
      expect(controller.instance_variable_get(:@users_count)).to eq(2)
    end
  end

  describe '#rbac_field_changed' do
    let(:getvars) { "rbac_#{rec_type}_get_form_vars".to_sym }

    before do
      allow(controller).to receive(:load_edit).and_return(true)
      allow(controller).to receive(getvars).and_call_original
      allow(controller).to receive(:render).and_return(true)

      controller.instance_variable_set(:@_params, params)
      controller.instance_variable_set(:@edit, edit)
    end

    subject { controller.instance_variable_get(:@edit)[:new][:group] }

    context 'editing/adding a new user' do
      let(:rec_type) { "user" }
      let(:params) { {:name => "new_user", :id => "new", :chosen_group => "12,34"} }
      let(:edit) { {:new => {:name => nil, :group => []}} }

      it 'sets list of selected groups' do
        controller.send(:rbac_field_changed, rec_type)
        expect(subject.count).to eq(2)
      end
    end

    context 'editing/adding a new group' do
      let(:rec_type) { "group" }
      let(:params) { {:description => "new_group", :id => "new"} }
      let(:edit) { {:new => {:description => nil}} }

      it 'does not set list of selected groups' do
        controller.send(:rbac_field_changed, rec_type)
        expect(subject).to be_nil
      end
    end

    context 'editing/adding a new role' do
      let(:rec_type) { "role" }
      let(:params) { {:description => "new_role", :id => "new"} }
      let(:edit) { {:new => {:description => nil, :features => []}} }

      it 'does not set list of selected groups' do
        controller.send(:rbac_field_changed, rec_type)
        expect(subject).to be_nil
      end
    end
  end
end
