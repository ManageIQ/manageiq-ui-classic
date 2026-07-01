describe MiqAeClassController do
  describe "#set_record_vars" do
    it "Namespace remains unchanged when a class is edited" do
      ns = FactoryBot.create(:miq_ae_namespace)
      cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      ns_id = cls.namespace_id
      new = {:name => "New Name", :description => "New Description", :display_name => "Display Name", :inherits => "Some_Class"}
      controller.instance_variable_set(:@sb,
                                       :trees       => {
                                         :ae_tree => {:active_node => "aec-#{cls.id}"}
                                       },
                                       :active_tree => :ae_tree)
      controller.instance_variable_set(:@edit, :new => new)
      controller.send(:set_record_vars, cls)
      expect(cls.namespace_id).to eq(ns_id)
    end
  end

  describe "#set_right_cell_text" do
    it "check if correct namespace_path is being set" do
      ns = FactoryBot.create(:miq_ae_namespace)
      cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      controller.instance_variable_set(:@sb, {})
      id = "aec-#{cls.id}"
      fq_name = cls.fqname
      controller.send(:set_right_cell_text, id, cls)
      expect(assigns(:sb)[:namespace_path]).to eq(fq_name)

      id = "root"
      fq_name = ""
      controller.send(:set_right_cell_text, id)
      expect(assigns(:sb)[:namespace_path]).to eq(fq_name)
    end
  end

  describe "#domain_lock" do
    it "Marks domain as locked/readonly" do
      stub_user(:features => :all)
      ns = FactoryBot.create(:miq_ae_domain_enabled)
      controller.params = {:id => ns.id}
      allow(controller).to receive(:replace_right_cell)
      controller.send(:domain_lock)
      ns.reload
      expect(ns.contents_locked?).to eq(true)
    end
  end

  describe "#domain_unlock" do
    it "Marks domain as unlocked/editable" do
      stub_user(:features => :all)
      ns = FactoryBot.create(:miq_ae_domain_disabled)
      controller.params = {:id => ns.id}
      allow(controller).to receive(:replace_right_cell)
      controller.send(:domain_unlock)
      ns.reload
      expect(ns.contents_locked?).to eq(false)
    end
  end

  describe "#domains_priority_edit" do
    it "sets priority of domains" do
      stub_user(:features => :all)
      FactoryBot.create(:miq_ae_domain, :name => "test1", :parent => nil, :priority => 1)
      FactoryBot.create(:miq_ae_domain, :name => "test2", :parent => nil, :priority => 2)
      FactoryBot.create(:miq_ae_domain, :name => "test3", :parent => nil, :priority => 3)
      FactoryBot.create(:miq_ae_domain, :name => "test4", :parent => nil, :priority => 4)

      order = %w[test1 test4 test2 test3]

      controller.params = {:button => "save", :domain_order => order}
      controller.instance_variable_set(:@sb, {})

      allow(controller).to receive(:render)

      controller.send(:domains_priority_edit)

      domain_order = []
      MiqAeDomain.order('priority ASC').collect { |d| domain_order.push(d.name) unless d.priority == 0 }
      expect(domain_order).to eq(order)
    end
  end

  describe "#copy_objects" do
    it "does not replace left side explorer tree when copy form is loaded initially" do
      stub_user(:features => :all)
      d1 = FactoryBot.create(:miq_ae_domain, :name => "domain1")
      ns1 = FactoryBot.create(:miq_ae_namespace, :name => "ns1", :parent => d1)
      cls1 = FactoryBot.create(:miq_ae_class, :name => "cls1", :namespace_id => ns1.id)

      node = "aec-#{cls1.id}"
      controller.instance_variable_set(:@sb,
                                       :active_tree => :ae_tree,
                                       :action      => "miq_ae_class_copy",
                                       :trees       => {:ae_tree => {:active_node => node}})
      controller.params = {:button => "reset", :id => cls1.id}
      allow(controller).to receive(:open_parent_nodes)
      expect(controller).to receive(:reload_trees_by_presenter).with(anything, [])
      expect(controller).to receive(:render)
      controller.send(:copy_objects)
      expect(controller.send(:flash_errors?)).not_to be_truthy
    end
  end

  context "get selected Class/Instance/Method record back" do
    let(:miq_ae_domain) { double("MiqAeDomain", :name => "yet_another_fqname", :id => 1, :enabled => true) }
    let(:miq_ae_domain2) { double("MiqAeDomain", :name => "yet_another_fqname2", :id => 2, :enabled => true) }

    let(:miq_ae_class) do
      double("MiqAeClass",
             :id           => 1,
             :fqname       => "cls_fqname",
             :display_name => "FOO",
             :name         => "foo",
             :ae_fields    => [],
             :ae_instances => [],
             :ae_methods   => [],
             :domain       => miq_ae_domain2)
    end

    let(:miq_ae_instance) do
      double("MiqAeInstance",
             :id           => 123,
             :display_name => "some name",
             :name         => "some_name",
             :fqname       => "fqname",
             :created_on   => Time.now,
             :updated_on   => Time.current,
             :updated_by   => "some_user",
             :domain       => miq_ae_domain)
    end

    let(:miq_ae_method) do
      double("MiqAeMethod",
             :id           => 123,
             :display_name => "some name",
             :inputs       => [],
             :name         => "some_name",
             :fqname       => "fqname",
             :created_on   => Time.now,
             :updated_on   => Time.current,
             :updated_by   => "some_user",
             :domain       => miq_ae_domain)
    end

    let(:override) do
      double("MiqAeClass",
             :fqname => "another_fqname/fqname",
             :id     => 1,
             :domain => miq_ae_domain)
    end
    let(:override2) do
      double("MiqAeClass",
             :fqname => "another_fqname2/fqname",
             :id     => 2,
             :domain => miq_ae_domain2)
    end

    before do
      @user =  FactoryBot.create(:user_with_group)
      login_as @user
      allow(MiqAeDomain).to receive(:find_by_name).with("another_fqname").and_return(miq_ae_domain)
      allow(MiqAeDomain).to receive(:find_by_name).with("another_fqname2").and_return(miq_ae_domain2)
    end

    describe "#node_info" do
      it "collect namespace info" do
        stub_user(:features => :all)
        d1 = FactoryBot.create(:miq_ae_domain, :name => "domain1")
        ns1 = FactoryBot.create(:miq_ae_namespace, :name => "ns1", :parent => d1)
        FactoryBot.create(:miq_ae_namespace, :name => "ns2", :parent => ns1)
        FactoryBot.create(:miq_ae_class, :name => "cls1", :namespace_id => ns1.id)
        node = "aen-#{ns1.id}"
        controller.instance_variable_set(:@sb,
                                         :active_tree => :ae_tree,
                                         :trees       => {:ae_tree => {:active_node => node}})
        controller.send(:get_node_info, node)
        expect(assigns(:sb)[:namespace_path]).to eq(ns1.fqname)
      end
    end

    describe "#get_instance_node_info" do
      context "when record does not exist" do
        it "sets active node back to root" do
          id = %w(aei some_id)
          controller.instance_variable_set(:@sb,
                                           :active_tree => :ae_tree,
                                           :trees       => {:ae_tree => {:active_node => "aei-some_id"}})
          controller.send(:get_instance_node_info, id)
          expect(assigns(:sb)[:trees][:ae_tree][:active_node]).to eq("root")
        end
      end

      context "when the record exists" do
        before do
          allow(MiqAeInstance).to receive(:find).with(123).and_return(miq_ae_instance)
          allow(miq_ae_instance).to receive(:ae_class).and_return(miq_ae_class)
          allow(MiqAeInstance).to receive(:get_homonymic_across_domains)
            .with(@user, "fqname").and_return([override, override2])
        end

        it "return instance record and check count of override instances being returned" do
          id = ["aei", miq_ae_instance.id]
          controller.instance_variable_set(:@sb,
                                           :active_tree => :ae_tree,
                                           :trees       => {:ae_tree => {:active_node => id.join("-")}})
          controller.send(:get_instance_node_info, miq_ae_instance.id)
          expect(assigns(:record).name).to eq(miq_ae_instance.name)
          expect(assigns(:domain_overrides).count).to eq(2)
          expect(assigns(:right_cell_text)).to include("Automate Instance [#{miq_ae_instance.display_name}")
        end
      end
    end

    describe "#get_class_node_info" do
      context "when record does not exist" do
        it "sets active node back to root" do
          id = %w(aec some_id)
          controller.instance_variable_set(:@sb,
                                           :active_tree => :ae_tree,
                                           :trees       => {:ae_tree => {:active_node => "aec-some_id"}})
          controller.send(:get_instance_node_info, id)
          expect(assigns(:sb)[:trees][:ae_tree][:active_node]).to eq("root")
        end
      end

      context "when the record exists" do
        before do
          allow(MiqAeClass).to receive(:find).with(1).and_return(miq_ae_class)
          allow(MiqAeClass).to receive(:get_homonymic_across_domains)
            .with(@user, "cls_fqname").and_return([override, override2])
        end

        it "returns class record and check count of override classes being returned" do
          id = ["aec", miq_ae_class.id]
          controller.instance_variable_set(:@sb,
                                           :active_tree => :ae_tree,
                                           :trees       => {:ae_tree => {:active_node => id.join("-")}})
          controller.send(:get_class_node_info, miq_ae_class.id)
          expect(assigns(:record).name).to eq(miq_ae_class.name)
          expect(assigns(:domain_overrides).count).to eq(2)
          expect(assigns(:right_cell_text)).to include(miq_ae_class.display_name)
        end
      end
    end

    describe "#get_method_node_info" do
      context "when record does not exist" do
        it "sets active node back to root" do
          id = %w(aem some_id)
          controller.instance_variable_set(:@sb,
                                           :active_tree => :ae_tree,
                                           :trees       => {:ae_tree => {:active_node => "aem-some_id"}})
          controller.send(:get_instance_node_info, id)
          expect(assigns(:sb)[:trees][:ae_tree][:active_node]).to eq("root")
        end
      end

      context "when the record exists" do
        before do
          allow(MiqAeMethod).to receive(:find).with(123).and_return(miq_ae_method)
          allow(miq_ae_method).to receive(:location).with(no_args).and_return("inline")
          allow(miq_ae_method).to receive(:ae_class).and_return(miq_ae_class)
          allow(MiqAeMethod).to receive(:get_homonymic_across_domains)
            .with(@user, "fqname").and_return([override, override2])
        end

        it "returns method record and check count of override methods being returned" do
          id = ["aem", miq_ae_method.id]
          controller.instance_variable_set(:@sb,
                                           :active_tree => :ae_tree,
                                           :trees       => {:ae_tree => {:active_node => id.join("-")}})
          controller.send(:get_method_node_info, miq_ae_method.id)
          expect(assigns(:record).name).to eq(miq_ae_method.name)
          expect(assigns(:domain_overrides).count).to eq(2)
          expect(assigns(:right_cell_text)).to include("Automate Method [#{miq_ae_method.display_name}")
        end
      end
    end
  end

  describe "#delete_domain" do
    let(:domain1) { FactoryBot.create(:miq_ae_system_domain_enabled) }
    let(:domain2) { FactoryBot.create(:miq_ae_domain_enabled) }
    let(:domain3) { FactoryBot.create(:miq_ae_git_domain) }
    let(:ids) { "aen-#{domain1.id}, aen-#{domain2.id}, aen-#{domain3.id}, aen-someid" }
    let(:git_service) { double("GitBasedDomainImportService") }

    before do
      allow(GitBasedDomainImportService).to receive(:new).and_return(git_service)
      stub_user(:features => :all)
      controller.params = {:miq_grid_checks => ids}
      allow(controller).to receive(:replace_right_cell)
    end

    it "Should only delete editable domains" do
      expect(git_service).to receive(:destroy_domain).with(domain3.id)
      controller.send(:delete_domain)

      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("cannot be deleted")
      expect(flash_messages.first[:level]).to eq(:error)
      expect(flash_messages.second[:message]).to include("Delete successful")
      expect(flash_messages.second[:level]).to eq(:success)
      expect(flash_messages.last[:message]).to include("Delete successful")
      expect(flash_messages.last[:level]).to eq(:success)
    end
  end

  describe "#ae_class_validation" do
    before do
      stub_user(:features => :all)
      ns = FactoryBot.create(:miq_ae_namespace)
      @cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      @cls.ae_fields << FactoryBot.create(:miq_ae_field, :name => 'fred',
                                           :class_id => @cls.id, :priority => 1)
      @cls.save
      @method = FactoryBot.create(:miq_ae_method, :name => "method01", :scope => "class",
        :language => "ruby", :class_id => @cls.id, :data => "exit MIQ_OK", :location => "inline")
      expect(controller).to receive(:render)
      controller.instance_variable_set(:@sb, :trees       => {:ae_tree => {:active_node => "aec-#{@cls.id}"}},
                                             :active_tree => :ae_tree)
      session[:edit] = {
        :key         => "aefields_edit__#{@cls.id}",
        :ae_class_id => @cls.id,
        :new         => {
          :datatypes => [],
          :aetypes   => [],
          :fields    => []
        }
      }
    end

    after(:each) do
      expect(controller.send(:flash_errors?)).to be_truthy
      expect(assigns(:edit)).not_to be_nil
      expect(response.status).to eq(200)
    end

    it "Should not allow to accept schema field without name" do
      field = {:aetype   => "attribute"}
      controller.instance_variable_set(:@edit, session[:edit])
      session[:field_data] = field
      controller.params = {:button => "accept", :id => @cls.id}
      controller.send(:field_accept)

      expect(assigns(:flash_array).first[:message]).to include("Name is required")
    end

    it "Should not allow to accept schema field without type" do
      field = {:name => "name"}
      controller.instance_variable_set(:@edit, session[:edit])
      session[:field_data] = field
      controller.params = {:button => "accept", :id => @cls.id}
      controller.send(:field_accept)

      expect(assigns(:flash_array).first[:message]).to include("Type is required")
    end

    it "Should not allow to accept schema field without name and type" do
      field = {}
      controller.instance_variable_set(:@edit, session[:edit])
      session[:field_data] = field
      controller.params = {:button => "accept", :id => @cls.id}
      controller.send(:field_accept)

      expect(assigns(:flash_array).first[:message]).to include("Name and Type is required")
    end

    it "Should not allow to create two schema fields with identical name" do
      field = {"aetype"   => "attribute",
               "datatype" => "string",
               "name"     => "name01"}
      session[:edit][:new][:fields] = [field, field]
      controller.params = {:button => "save", :id => @cls.id}
      controller.send(:update_fields)
      expect(assigns(:flash_array).first[:message]).to include("Name has already been taken")
    end

    it "Should not allow to add two parameters with identical name to a method" do
      field = {"default_value" => nil,
               "datatype"      => nil,
               "name"          => "name01",
               "method_id"     => @method.id}
      session[:edit] = {
        :key         => "aemethod_edit__#{@method.id}",
        :ae_class_id => @cls.id,
        :new_field   => {},
        :new         => {
          :name   => @method.name,
          :fields => [field, field]
        }
      }
      controller.params = {:button => "save", :id => @method.id}
      controller.send(:update_method)
      expect(assigns(:flash_array).first[:message]).to include("Name has already been taken")
    end

    it "Should not allow to add two parameters with identical name to a newly created method" do
      field = {"default_value" => nil,
               "datatype"      => nil,
               "name"          => "name01",
               "method_id"     => nil}
      session[:edit] = {
        :key         => "aemethod_edit__new",
        :ae_class_id => @cls.id,
        :new_field   => {},
        :new         => {
          :name         => "method01",
          :display_name => nil,
          :embedded_methods => [],
          :fields       => [field, field],
          :scope        => "instance",
          :language     => "ruby"
        }
      }
      controller.params = {:button => "add"}
      controller.send(:create_method)
      expect(assigns(:flash_array).first[:message]).to include("Name has already been taken")
    end
  end

  context "save class/method" do
    before do
      stub_user(:features => :all)
      ns = FactoryBot.create(:miq_ae_namespace)
      @cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      @cls.ae_fields << FactoryBot.create(:miq_ae_field,
                                           :name          => 'fred',
                                           :class_id      => @cls.id,
                                           :default_value => "Wilma",
                                           :priority      => 1)
      @cls.save
      @method = FactoryBot.create(:miq_ae_method, :name => "method01", :scope => "class",
        :language => "ruby", :class_id => @cls.id, :data => "exit MIQ_OK", :location => "inline")
      allow(controller).to receive(:replace_right_cell)
      controller.instance_variable_set(:@sb, :trees       => {:ae_tree => {:active_node => "aec-#{@cls.id}"}},
                                             :active_tree => :ae_tree)
    end

    it "update a method with inputs" do
      field = {"default_value" => nil,
               "datatype"      => nil,
               "name"          => "name01",
               "method_id"     => @method.id}
      session[:edit] = {
        :key              => "aemethod_edit__#{@method.id}",
        :fields_to_delete => [],
        :ae_class_id      => @cls.id,
        :new_field        => {},
        :new              => {
          :name     => @method.name,
          :language => 'ruby',
          :scope    => 'instance',
          :embedded_methods => [],
          :location => 'inline',
          :fields   => [field]
        }
      }
      controller.params = {:button => "save", :id => @method.id}
      controller.send(:update_method)
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.status).to eq(200)
    end

    it "update a class with fields" do
      field = {"aetype"   => "attribute",
               "datatype" => "string",
               "name"     => "name01"}
      session[:edit] = {
        :key              => "aefields_edit__#{@cls.id}",
        :ae_class_id      => @cls.id,
        :fields_to_delete => [],
        :new              => {
          :datatypes => [],
          :aetypes   => [],
          :fields    => [field]
        }
      }
      controller.params = {:button => "save", :id => @cls.id}
      controller.send(:update_fields)
      expect(controller.send(:flash_errors?)).to be_falsey
      expect(response.status).to eq(200)
    end

    it "update a default value of existing class field" do
      field = {"aetype"        => "attribute",
               "default_value" => "Wilma",
               "name"          => "name01"}
      session[:field_data] = field
      session[:edit] = {
        :key              => "aefields_edit__#{@cls.id}",
        :ae_class_id      => @cls.id,
        :fields_to_delete => [],
        :new_field        => {},
        :new              => {
          :datatypes => [],
          :name      => 'freddie',
          :aetypes   => [],
          :fields    => [@cls.ae_fields.first]
        }
      }
      controller.params = {"fields_default_value_0" => "Pebbles",
                           "fields_name_0"          => "freddie",
                           :id                      => @cls.id}
      allow(controller).to receive(:render)
      controller.send(:fields_form_field_changed)
      expect(@cls.ae_fields.first.default_value).to eq("Wilma")
      controller.params = {:button => "save", :id => @cls.id}
      controller.send(:update_fields)
      @cls.reload
      expect(@cls.ae_fields.first.name).to eq("freddie")
      expect(@cls.ae_fields.first.default_value).to eq("Pebbles")
    end

    it "adds a new field to a class and saves the class with new field" do
      field = {:aetype        => "attribute",
               :default_value => "Wilma",
               :name          => "name01"}
      session[:field_data] = field
      session[:edit] = {
        :key              => "aefields_edit__#{@cls.id}",
        :ae_class_id      => @cls.id,
        :fields_to_delete => [],
        :new_field        => {:name => "Bar", :default_value => "Foo"},
        :new              => {
          :datatypes => [],
          :name      => 'fred',
          :aetypes   => [],
          :fields    => [@cls.ae_fields.first]
        }
      }
      controller.params = {"fields_default_value" => "Foo",
                           "fields_name"          => "Bar",
                           :id                    => @cls.id,
                           :button                => 'accept'}
      allow(controller).to receive(:render)
      controller.send(:fields_form_field_changed)
      controller.params = {:button => "save", :id => @cls.id}
      controller.send(:update_fields)
      @cls.reload
      expect(@cls.ae_fields.last.name).to eq("Bar")
      expect(@cls.ae_fields.last.default_value).to eq("Foo")
    end

    it "#new_method" do
      controller.send(:new_method)
      expect(session['edit'][:new][:embedded_methods].count).to eq(0)
    end
  end

  describe "#copy_objects_edit_screen" do
    it "sets only current tenant's domains to be displayed in To Domain pull down" do
      dom1 = FactoryBot.create(:miq_ae_domain, :tenant => Tenant.seed)
      FactoryBot.create(:miq_ae_domain, :tenant => FactoryBot.create(:tenant))
      controller.instance_variable_set(:@sb, {})
      ns = FactoryBot.create(:miq_ae_namespace, :domain => dom1)
      controller.send(:copy_objects_edit_screen, MiqAeNamespace, [ns.id], "miq_ae_namespace_copy")
      expect(assigns(:edit)[:domains].count).to eq(1)
    end
  end

  describe "#delete_namespaces_or_classes" do
    before do
      stub_user(:features => :all)
      domain = FactoryBot.create(:miq_ae_domain, :tenant => Tenant.seed)
      @namespace = FactoryBot.create(:miq_ae_namespace, :name => "foo_namespace", :parent => domain)
      @ae_class = FactoryBot.create(:miq_ae_class, :name => "foo_class", :domain => domain)
      controller.instance_variable_set(:@sb,
                                       :trees       => {},
                                       :active_tree => :ae_tree)
      allow(controller).to receive(:replace_right_cell)
      controller.x_node = "aen-#{@namespace.id}"
    end

    it "Should delete multiple selected items from list" do
      controller.params = {:miq_grid_checks => "aec-#{@ae_class.id},aen-#{@namespace.id}",
                           :id              => @namespace.id}
      controller.send(:delete_namespaces_or_classes)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Namespace \"foo_namespace\": Delete successful")
      expect(flash_messages.last[:message]).to include("Automate Class \"foo_class\": Delete successful")
    end

    it "Should delete selected namespace in the tree" do
      controller.params = {:id => @namespace.id}

      controller.send(:delete_namespaces_or_classes)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Namespace \"foo_namespace\": Delete successful")
    end

    it "Should use description in flash message when available" do
      controller.params = {:miq_grid_checks => "aen-#{@namespace.id}",
                           :id              => @namespace.id}
      @namespace.update_column(:description, "foo_description")
      @namespace.reload
      controller.send(:delete_namespaces_or_classes)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Namespace \"foo_namespace\": Delete successful")
    end
  end

  describe "#update_namespace" do
    before do
      stub_user(:features => :all)
      domain = FactoryBot.create(:miq_ae_domain, :tenant => Tenant.seed)
      @namespace = FactoryBot.create(:miq_ae_namespace,
                                      :name        => "foo_namespace",
                                      :description => "foo_description",
                                      :parent      => domain)
      session[:edit] = {
        :ae_ns_id => @namespace.id,
        :typ      => "MiqAeNamespace",
        :key      => "aens_edit__#{@namespace.id}",
        :rec_id   => @namespace.id,
        :new      => {
          :ns_name        => "test1",
          :ns_description => "desc",
          :enabled        => true
        },
        :current  => {
          :ns_name        => "test",
          :ns_description => "desc",
          :enabled        => true
        }
      }
      controller.instance_variable_set(:@sb,
                                       :trees       => {},
                                       :active_tree => :ae_tree)
      allow(controller).to receive(:replace_right_cell)
      controller.x_node = "aen-#{@namespace.id}"
      allow(controller).to receive(:find_records_with_rbac).and_return([@namespace])
    end

    it "Should use description in flash message when editing a namespace" do
      controller.params = {:button      => "save",
                           :name        => 'name',
                           :description => 'desc',
                           :id          => @namespace.id}
      controller.send(:update_namespace)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Namespace \"name\" was saved")
    end
  end

  describe "#deleteclasses" do
    before do
      stub_user(:features => :all)
      domain = FactoryBot.create(:miq_ae_domain, :tenant => Tenant.seed)
      @namespace = FactoryBot.create(:miq_ae_namespace, :name => "foo_namespace", :parent => domain)
      @ae_class = FactoryBot.create(:miq_ae_class, :name => "foo_class", :namespace_id => @namespace.id)
      controller.instance_variable_set(:@sb,
                                       :trees       => {},
                                       :active_tree => :ae_tree)
      allow(controller).to receive(:replace_right_cell)
    end

    it "Should delete selected class in the tree" do
      controller.x_node = "aec-#{@ae_class.id}"
      controller.params = {:id => @namespace.id}

      controller.send(:deleteclasses)
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Class \"foo_class\": Delete successful")
      expect(controller.x_node).to eq("aen-#{@namespace.id}")
    end
  end

  describe "#set_field_vars" do
    it "sets priority of new schema fields" do
      ns = FactoryBot.create(:miq_ae_namespace)
      cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      field1 = FactoryBot.create(:miq_ae_field,
                                  "aetype"   => "attribute",
                                  "datatype" => "string",
                                  "name"     => "name01",
                                  "class_id" => cls.id,
                                  "priority" => 1)
      field2 = FactoryBot.create(:miq_ae_field,
                                  "aetype"   => "attribute",
                                  "datatype" => "string",
                                  "name"     => "name02",
                                  "class_id" => cls.id,
                                  "priority" => 2)
      field3 = {"aetype"   => "attribute",
                "datatype" => "string",
                "name"     => "name03"}
      edit = {:fields_to_delete => [], :new => {:fields => [field2, field3, field1]}}
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@ae_class, cls)
      fields = controller.send(:set_field_vars, cls)
      priorities = fields.collect(&:priority)
      expect(priorities).to eq([1, 2, 3])
    end
  end

  describe "#fields_seq_field_changed" do
    before do
      ns = FactoryBot.create(:miq_ae_namespace, :name => 'foo')
      @cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      FactoryBot.create(:miq_ae_field,
                         :aetype   => "attribute",
                         :datatype => "string",
                         :name     => "name01",
                         :class_id => @cls.id,
                         :priority => 1)
      FactoryBot.create(:miq_ae_field,
                         :aetype   => "attribute",
                         :datatype => "string",
                         :name     => "name02",
                         :class_id => @cls.id,
                         :priority => 2)
      stub_user(:features => %w[miq_ae_field_seq])
    end

    it "moves selected field down" do
      controller.send(:fields_seq_edit_screen, @cls.id)
      expect(assigns(:edit)[:new][:fields_list]).to match_array(["(name01)", "(name02)"])
      controller.params = {:button => 'down', :id => 'seq', :seq_fields => "['(name01)']"}
      expect(controller).to receive(:render)
      controller.fields_seq_field_changed
      expect(assigns(:edit)[:new][:fields_list]).to match_array(["(name02)", "(name01)"])
    end

    it "moves selected field up" do
      controller.send(:fields_seq_edit_screen, @cls.id)
      expect(assigns(:edit)[:new][:fields_list]).to match_array(["(name01)", "(name02)"])
      controller.params = {:button => 'up', :id => 'seq', :seq_fields => "['(name02)']"}
      expect(controller).to receive(:render)
      controller.fields_seq_field_changed
      expect(assigns(:edit)[:new][:fields_list]).to match_array(["(name02)", "(name01)"])
    end
  end

  describe "#replace_right_cell" do
    before do
      ns = FactoryBot.create(:miq_ae_namespace)
      cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      seed_session_trees('miq_ae_class', :ae, "aec-#{cls.id}")
      session_to_sb
    end

    it "Can build the AE tree" do
      allow(User).to receive_message_chain(:current_tenant, :visible_domains).and_return([])
      allow(controller).to receive(:domain_overrides)

      expect(controller).to receive(:reload_trees_by_presenter).with(
        instance_of(ExplorerPresenter),
        array_including(
          instance_of(TreeBuilderAeClass),
        )
      )
      expect(controller).to receive(:render)

      controller.send(:replace_right_cell, :replace_trees => %i(ae))
    end
  end

  context "method data edit" do
    before do
      stub_user(:features => :all)
      @method = FactoryBot.create(:miq_ae_method, :name => "method01", :scope => "class", :data => "exit MIQ_OK")
      controller.instance_variable_set(:@sb,
                                       :trees       => {:ae_tree => {:active_node => "aec-#{@method.class_id}"}},
                                       :active_tree => :ae_tree,
                                       :action      => "miq_ae_class_edit")
    end

    it "make sure data in data field still exists when edititng that field" do
      new = {
        :name     => @method.name,
        :language => 'ruby',
        :scope    => 'instance',
        :location => 'inline',
        :data     => "exit MIQ_OK",
        :fields   => []
      }
      session[:edit] = {
        :key              => "aemethod_edit__#{@method.id}",
        :fields_to_delete => [],
        :ae_class_id      => @method.class_id.to_s,
        :new_field        => {},
        :new              => new,
        :current          => new
      }
      controller.params = {:transOne => "1", :id => @method.id}
      allow(controller).to receive(:render)
      controller.send(:form_method_field_changed)
      expect(assigns(:edit)[:new][:data]).to eq("exit MIQ_OK...")
    end
  end

  describe "#open_parent_nodes" do
    it "returns parent nodes hash for newly added item in tree" do
      ns = FactoryBot.create(:miq_ae_namespace)
      cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id, :name => "foo_cls")
      method = FactoryBot.create(:miq_ae_method,
                                  :name     => "method01",
                                  :scope    => "class",
                                  :language => "ruby",
                                  :class_id => cls.id,
                                  :data     => "exit MIQ_OK",
                                  :location => "inline")
      dom = cls.domain
      controller.instance_variable_set(:@record, cls)
      controller.instance_variable_set(
        :@sb,
        :trees       => {
          :ae_tree => {
            :active_node => "aec-#{cls.id}",
            :open_nodes  => [],
            :klass_name  => "TreeBuilderAeClass"
          }
        },
        :active_tree => :ae_tree
      )
      tree_node = controller.send(:open_parent_nodes, method)
      node_to_add = {
        :key   => "aen-#{dom.id}",
        :nodes => [
          {
            :key        => "aen-#{ns.id}",
            :text       => ns.name,
            :tooltip    => "Automate Namespace: #{ns.name}",
            :icon       => "pficon pficon-folder-close",
            :selectable => true,
            :fqname     => ns.fqname,
            :state      => {:expanded => true},
            :nodes      => [
              {
                :key        => "aec-#{cls.id}",
                :text       => cls.name,
                :tooltip    => "Automate Class: #{cls.name}",
                :icon       => "ff ff-class",
                :selectable => true,
                :lazyLoad   => true,
                :fqname     => cls.fqname,
                :state      => {:expanded => false},
              }
            ]
          }
        ]
      }
      expect(tree_node).to eq(node_to_add)
    end
  end

  describe "#deleteinstances" do
    before do
      stub_user(:features => :all)
      domain = FactoryBot.create(:miq_ae_domain, :tenant => Tenant.seed)
      @namespace = FactoryBot.create(:miq_ae_namespace, :name => "foo_namespace", :parent => domain)
      @ae_class = FactoryBot.create(:miq_ae_class, :name => "foo_class", :namespace_id => @namespace.id)
      controller.instance_variable_set(:@sb,
                                       :trees       => {},
                                       :active_tree => :ae_tree)
      @instance = FactoryBot.create(:miq_ae_instance, :name => "instance01", :class_id => @ae_class.id)
      allow(controller).to receive(:replace_right_cell)
    end

    it "Should delete selected instance from details screen" do
      controller.x_node = "aei-#{@instance.id}"
      controller.params = {:pressed => "miq_ae_instance_delete",
                           :id      => @instance.id}
      controller.send(:deleteinstances)
    end

    it "Should delete selected instance in the list" do
      controller.x_node = "aec-#{@ae_class.id}"
      controller.params = {:miq_grid_checks => "aei-#{@instance.id}",
                           :pressed         => "miq_ae_instance_delete",
                           :id              => @ae_class.id}
      controller.send(:deleteinstances)
    end

    after(:each) do
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Instance \"#{@instance.name}\": Delete successful")
      expect(controller.x_node).to eq("aec-#{@ae_class.id}")
    end
  end

  describe "#deletemethods" do
    before do
      stub_user(:features => :all)
      domain = FactoryBot.create(:miq_ae_domain, :tenant => Tenant.seed)
      @namespace = FactoryBot.create(:miq_ae_namespace, :name => "foo_namespace", :parent => domain)
      @ae_class = FactoryBot.create(:miq_ae_class, :name => "foo_class", :namespace_id => @namespace.id)
      controller.instance_variable_set(:@sb,
                                       :trees       => {},
                                       :active_tree => :ae_tree)
      @method = FactoryBot.create(:miq_ae_method, :name => "method01", :scope => "class",
                                   :language => "ruby", :class_id => @ae_class.id, :data => "exit MIQ_OK", :location => "inline")
      @method2 = FactoryBot.create(:miq_ae_method, :name => "method012", :scope => "class",
                                   :language => "ruby", :class_id => @ae_class.id, :data => "exit MIQ_OK", :location => "inline")
      allow(controller).to receive(:replace_right_cell)
    end

    it "Should delete selected method from details screen" do
      controller.x_node = "aem-#{@method.id}"
      controller.params = {:pressed => "miq_ae_method_delete",
                           :id      => @method.id}
      controller.send(:deletemethods)
    end

    it "Should delete selected method in the list" do
      controller.x_node = "aec-#{@ae_class.id}"
      controller.params = {:miq_grid_checks => "aem-#{@method.id},aem-#{@method2.id}",
                           :pressed         => "miq_ae_method_delete",
                           :id              => @ae_class.id}
      controller.send(:deletemethods)
    end

    after(:each) do
      flash_messages = assigns(:flash_array)
      expect(flash_messages.first[:message]).to include("Automate Method \"#{@method.name}\": Delete successful")
      expect(controller.x_node).to eq("aec-#{@ae_class.id}")
    end
  end

  describe '#edit_method' do
    let(:method) do
      ns = FactoryBot.create(:miq_ae_namespace)
      cls = FactoryBot.create(:miq_ae_class, :namespace_id => ns.id)
      cls.ae_fields << FactoryBot.create(:miq_ae_field, :name => 'fred', :class_id => cls.id, :priority => 1)
      cls.save
      @method = FactoryBot.create(:miq_ae_method,
                                  :name     => "method01",
                                  :scope    => "class",
                                  :language => "ruby",
                                  :class_id => cls.id,
                                  :data     => "exit MIQ_OK",
                                  :location => "inline")
    end

    it 'builds the regex for selectable methods' do
      stub_user(:features => :all)
      allow(controller).to receive(:x_node).and_return("aem-#{method.id}")
      allow(controller).to receive(:set_method_form_vars)
      allow(controller).to receive(:replace_right_cell)
      expect(controller).to receive(:embedded_method_regex)
      controller.send(:edit_method)
    end
  end

  describe '#embedded_method_regex' do
    let(:one) { OpenStruct.new(:id => 1) }
    let(:two) { OpenStruct.new(:id => 2) }
    let(:three) { OpenStruct.new(:id => 3) }

    it 'wraps ids in parentheses and joins them with pipes' do
      allow(MiqAeMethod).to receive(:get_homonymic_across_domains).and_return([one, two, three])
      expect(controller.send(:embedded_method_regex, 'foo')).to eq("(1)|(2)|(3)")
    end
  end

  describe '#show' do
    let(:ae_domain) { FactoryBot.create(:miq_ae_domain) }

    before do
      stub_user(:features => :all)
      controller.instance_variable_set(:@sb, {})
      controller.params = {:id => ae_domain.id}
    end

    it 'calls build_accordions_and_trees, get_node_info and sets @explorer' do
      expect(controller).to receive(:get_node_info).with("aen-#{ae_domain.id}")
      expect(controller).to receive(:build_accordions_and_trees)
      expect(controller).to receive(:render).with(:layout => 'application')
      controller.send(:show)
      expect(controller.instance_variable_get(:@explorer)).to be(true)
    end
  end

  describe "Instance Workflows" do
    before do
      stub_user(:features => :all)
      @domain = FactoryBot.create(:miq_ae_domain, :name => "test_domain")
      @namespace = FactoryBot.create(:miq_ae_namespace, :name => "test_ns", :parent => @domain)
      @ae_class = FactoryBot.create(:miq_ae_class, :name => "test_class", :namespace_id => @namespace.id)
      @ae_field1 = FactoryBot.create(:miq_ae_field, :name => "field1", :aetype => "attribute", :datatype => "string", :class_id => @ae_class.id, :priority => 1)
      @ae_field2 = FactoryBot.create(:miq_ae_field, :name => "field2", :aetype => "attribute", :datatype => "integer", :class_id => @ae_class.id, :priority => 2)
    end

    describe "#new_instance" do
      it "sets up form for adding a new instance" do
        node = "aec-#{@ae_class.id}"
        controller.instance_variable_set(:@sb, :active_tree => :ae_tree, :trees => {:ae_tree => {:active_node => node}})
        allow(controller).to receive(:replace_right_cell)

        controller.send(:new_instance)

        expect(assigns(:record_id)).to be_nil
        expect(assigns(:class_id)).to eq(@ae_class.id.to_s)
        expect(assigns(:in_a_form)).to be_truthy
        expect(assigns(:hide_bottom_bar)).to be_truthy
        expect(assigns(:sb)[:action]).to eq("miq_ae_instance_new")
        expect(assigns(:right_cell_text)).to eq("Adding a new Automate Instance")
      end

      it "asserts privileges for new instance" do
        expect(controller).to receive(:assert_privileges).with("miq_ae_instance_new")
        allow(controller).to receive(:replace_right_cell)
        node = "aec-#{@ae_class.id}"
        controller.instance_variable_set(:@sb, :active_tree => :ae_tree, :trees => {:ae_tree => {:active_node => node}})

        controller.send(:new_instance)
      end
    end

    describe "#edit_instance" do
      before do
        @ae_instance = FactoryBot.create(:miq_ae_instance, :name => "test_instance", :class_id => @ae_class.id)
      end

      it "sets up form for editing an existing instance" do
        node = "aei-#{@ae_instance.id}"
        controller.instance_variable_set(:@sb, :active_tree => :ae_tree, :trees => {:ae_tree => {:active_node => node}})
        allow(controller).to receive(:replace_right_cell)

        controller.send(:edit_instance)

        expect(assigns(:record_id)).to eq(@ae_instance.id.to_s)
        expect(assigns(:class_id)).to be_nil
        expect(assigns(:in_a_form)).to be_truthy
        expect(assigns(:hide_bottom_bar)).to be_truthy
        expect(assigns(:sb)[:action]).to eq("miq_ae_instance_edit")
        expect(assigns(:right_cell_text)).to eq("Editing Automate Instance \"test_instance\"")
      end

      it "handles checked items for edit" do
        controller.params = {}
        controller.instance_variable_set(:@sb, :row_selected => "aei-#{@ae_instance.id}")
        allow(controller).to receive(:find_checked_items).and_return(["aei-#{@ae_instance.id}"])
        allow(controller).to receive(:replace_right_cell)

        controller.send(:edit_instance)

        expect(assigns(:record_id)).to eq(@ae_instance.id.to_s)
      end

      it "asserts privileges for edit instance" do
        expect(controller).to receive(:assert_privileges).with("miq_ae_instance_edit")
        allow(controller).to receive(:replace_right_cell)
        node = "aei-#{@ae_instance.id}"
        controller.instance_variable_set(:@sb, :active_tree => :ae_tree, :trees => {:ae_tree => {:active_node => node}})

        controller.send(:edit_instance)
      end
    end

    describe "#instance_form_data" do
      context "for new instance" do
        it "returns form data with empty instance and class fields" do
          get :instance_form_data, :params => {:id => "new", :class_id => @ae_class.id}

          json_response = JSON.parse(response.body)
          expect(json_response["instance"]["name"]).to eq("")
          expect(json_response["instance"]["display_name"]).to eq("")
          expect(json_response["instance"]["description"]).to eq("")
          expect(json_response["fields"].length).to eq(2)
          expect(json_response["fields"][0]["name"]).to eq("field1")
          expect(json_response["fields"][1]["name"]).to eq("field2")
          expect(json_response["is_state_class"]).to be_falsey
        end

        it "requires class_id parameter for new instance" do
          get :instance_form_data, :params => {:id => "new"}

          expect(response.status).to eq(400)
          json_response = JSON.parse(response.body)
          expect(json_response["error"]).to include("class_id parameter is required")
        end

        it "includes field icons and metadata" do
          get :instance_form_data, :params => {:id => "new", :class_id => @ae_class.id}

          json_response = JSON.parse(response.body)
          field = json_response["fields"][0]
          expect(field["icons"]).to be_an(Array)
          expect(field["aetype"]).to eq("attribute")
          expect(field["datatype"]).to eq("string")
        end
      end

      context "for existing instance" do
        before do
          @ae_instance = FactoryBot.create(:miq_ae_instance, :name => "test_instance", :display_name => "Test Instance", :description => "Test Description", :class_id => @ae_class.id)
          @ae_value1 = FactoryBot.create(:miq_ae_value, :field_id => @ae_field1.id, :instance_id => @ae_instance.id, :value => "test_value")
        end

        it "returns form data with instance details and values" do
          get :instance_form_data, :params => {:id => @ae_instance.id}

          json_response = JSON.parse(response.body)
          expect(json_response["instance"]["name"]).to eq("test_instance")
          expect(json_response["instance"]["display_name"]).to eq("Test Instance")
          expect(json_response["instance"]["description"]).to eq("Test Description")
          expect(json_response["fields"].length).to eq(2)
          expect(json_response["fields"][0]["value"]).to eq("test_value")
        end

        it "masks password field values" do
          password_field = FactoryBot.create(:miq_ae_field, :name => "password_field", :aetype => "attribute", :datatype => "password", :class_id => @ae_class.id, :priority => 3)
          FactoryBot.create(:miq_ae_value, :field_id => password_field.id, :instance_id => @ae_instance.id, :value => "secret")
          get :instance_form_data, :params => {:id => @ae_instance.id}

          json_response = JSON.parse(response.body)
          password_field_data = json_response["fields"].find { |f| f["name"] == "password_field" }
          expect(password_field_data["value"]).to eq("********")
        end
      end

      context "for state machine class" do
        before do
          @state_class = FactoryBot.create(:miq_ae_class, :name => "state_class", :namespace_id => @namespace.id)
          allow_any_instance_of(MiqAeClass).to receive(:state_machine?).and_return(true)
          @state_field = FactoryBot.create(:miq_ae_field, :name => "state1", :aetype => "state", :class_id => @state_class.id, :priority => 1)
        end

        it "returns is_state_class as true" do
          get :instance_form_data, :params => {:id => "new", :class_id => @state_class.id}

          json_response = JSON.parse(response.body)
          expect(json_response["is_state_class"]).to be_truthy
        end
      end
    end

    describe "#instance_create" do
      it "creates a new instance with valid parameters" do
        params = {
          :class_id     => @ae_class.id,
          :name         => "new_instance",
          :display_name => "New Instance",
          :description  => "New Description",
          :ae_values    => [
            {:value => "value1", :collect => ""},
            {:value => "value2", :collect => ""}
          ]
        }

        expect {
          post :instance_create, :params => params
        }.to change(MiqAeInstance, :count).by(1)

        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be_truthy
        expect(json_response["message"]).to include("was added")

        new_instance = MiqAeInstance.last
        expect(new_instance.name).to eq("new_instance")
        expect(new_instance.display_name).to eq("New Instance")
        expect(new_instance.ae_values.count).to eq(2)
      end

      it "requires name parameter" do
        params = {
          :class_id     => @ae_class.id,
          :name         => "",
          :display_name => "New Instance"
        }

        post :instance_create, :params => params

        expect(response.status).to eq(400)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to include("Name is required")
      end

      it "handles state machine fields" do
        state_class = FactoryBot.create(:miq_ae_class, :name => "state_class", :namespace_id => @namespace.id)
        allow_any_instance_of(MiqAeClass).to receive(:state_machine?).and_return(true)
        FactoryBot.create(:miq_ae_field, :name => "state1", :aetype => "state", :class_id => state_class.id, :priority => 1)

        params = {
          :class_id  => state_class.id,
          :name      => "state_instance",
          :ae_values => [
            {
              :value       => "value1",
              :on_entry    => "on_entry_method",
              :on_exit     => "on_exit_method",
              :on_error    => "on_error_method",
              :max_retries => "3",
              :max_time    => "60"
            }
          ]
        }

        post :instance_create, :params => params

        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be_truthy

        new_instance = MiqAeInstance.last
        ae_value = new_instance.ae_values.first
        expect(ae_value.on_entry).to eq("on_entry_method")
        expect(ae_value.on_exit).to eq("on_exit_method")
        expect(ae_value.on_error).to eq("on_error_method")
      end

      it "handles database errors gracefully" do
        params = {
          :class_id => @ae_class.id,
          :name     => "new_instance"
        }

        allow_any_instance_of(MiqAeInstance).to receive(:save!).and_raise(StandardError.new("Database error"))

        post :instance_create, :params => params

        expect(response.status).to eq(400)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to include("Database error")
      end
    end

    describe "#instance_update" do
      before do
        @ae_instance = FactoryBot.create(:miq_ae_instance, :name => "test_instance", :class_id => @ae_class.id)
        @ae_value1 = FactoryBot.create(:miq_ae_value, :field_id => @ae_field1.id, :instance_id => @ae_instance.id, :value => "old_value")
      end

      it "updates an existing instance with valid parameters" do
        params = {
          :id           => @ae_instance.id,
          :name         => "updated_instance",
          :display_name => "Updated Instance",
          :description  => "Updated Description",
          :ae_values    => [
            {:value => "new_value1", :collect => ""},
            {:value => "new_value2", :collect => ""}
          ]
        }

        post :instance_update, :params => params

        json_response = JSON.parse(response.body)
        expect(json_response["success"]).to be_truthy
        expect(json_response["message"]).to include("was saved")

        @ae_instance.reload
        expect(@ae_instance.name).to eq("updated_instance")
        expect(@ae_instance.display_name).to eq("Updated Instance")
      end

      it "requires name parameter" do
        params = {
          :id   => @ae_instance.id,
          :name => ""
        }

        post :instance_update, :params => params

        expect(response.status).to eq(400)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to include("Name is required")
      end

      it "updates ae_values correctly" do
        params = {
          :id        => @ae_instance.id,
          :name      => "test_instance",
          :ae_values => [
            {:value => "updated_value", :collect => "collect_value"},
            {:value => "value2", :collect => ""}
          ]
        }

        post :instance_update, :params => params

        @ae_instance.reload
        updated_value = @ae_instance.ae_values.find_by(:field_id => @ae_field1.id)
        expect(updated_value.value).to eq("updated_value")
        expect(updated_value.collect).to eq("collect_value")
      end

      it "handles state machine field updates" do
        state_class = FactoryBot.create(:miq_ae_class, :name => "state_class", :namespace_id => @namespace.id)
        allow_any_instance_of(MiqAeClass).to receive(:state_machine?).and_return(true)
        state_field = FactoryBot.create(:miq_ae_field, :name => "state1", :aetype => "state", :class_id => state_class.id, :priority => 1)
        state_instance = FactoryBot.create(:miq_ae_instance, :name => "state_instance", :class_id => state_class.id)
        FactoryBot.create(:miq_ae_value, :field_id => state_field.id, :instance_id => state_instance.id)

        params = {
          :id        => state_instance.id,
          :name      => "state_instance",
          :ae_values => [
            {
              :value       => "updated_value",
              :on_entry    => "updated_on_entry",
              :on_exit     => "updated_on_exit",
              :on_error    => "updated_on_error",
              :max_retries => "5",
              :max_time    => "120"
            }
          ]
        }

        post :instance_update, :params => params

        state_instance.reload
        ae_value = state_instance.ae_values.first
        expect(ae_value.on_entry).to eq("updated_on_entry")
        expect(ae_value.on_exit).to eq("updated_on_exit")
        expect(ae_value.max_retries).to eq("5")
      end

      it "handles database errors gracefully" do
        params = {
          :id   => @ae_instance.id,
          :name => "updated_instance"
        }

        allow_any_instance_of(MiqAeInstance).to receive(:save!).and_raise(StandardError.new("Update error"))

        post :instance_update, :params => params

        expect(response.status).to eq(400)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to include("Update error")
      end
    end
  end

  describe "Copy Workflows" do
    before do
      stub_user(:features => :all)
      @domain1 = FactoryBot.create(:miq_ae_domain, :name => "domain1")
      @domain2 = FactoryBot.create(:miq_ae_domain, :name => "domain2")
      @namespace1 = FactoryBot.create(:miq_ae_namespace, :name => "ns1", :parent => @domain1)
      @namespace2 = FactoryBot.create(:miq_ae_namespace, :name => "ns2", :parent => @domain2)
      @ae_class = FactoryBot.create(:miq_ae_class, :name => "test_class", :namespace_id => @namespace1.id)
      @ae_instance = FactoryBot.create(:miq_ae_instance, :name => "test_instance", :class_id => @ae_class.id)
      controller.instance_variable_set(:@sb, {})
    end

    describe "#copy_objects_save" do
      context "copying a class" do
        it "successfully copies class to different namespace" do
          selected_items = {@ae_class.id => @ae_class.name}
          edit = {
            :key            => "copy_objects__#{@ae_class.id}",
            :new            => {
              :domain            => @domain2.id,
              :namespace         => @namespace2.fqname,
              :override_existing => false,
              :new_name          => nil
            },
            :typ            => MiqAeClass,
            :rec_id         => @ae_class.id,
            :selected_items => selected_items,
            :old_name       => @ae_class.name,
            :fqname         => @ae_class.fqname
          }

          controller.params = {:id => @ae_class.id}
          controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
          controller.instance_variable_set(:@edit, edit)
          session[:edit] = edit

          allow(controller).to receive(:build_automate_tree)
          allow(controller).to receive(:render)

          expect {
            controller.send(:copy_objects_save)
          }.to change(MiqAeClass, :count).by(1)

          expect(controller).to have_received(:render).with(:json => hash_including(:message, :redirect_url))
        end

        it "copies class with new name" do
          selected_items = {@ae_class.id => @ae_class.name}
          edit = {
            :key            => "copy_objects__#{@ae_class.id}",
            :new            => {
              :domain            => @domain2.id,
              :namespace         => @namespace2.fqname,
              :override_existing => false,
              :new_name          => "copied_class"
            },
            :typ            => MiqAeClass,
            :rec_id         => @ae_class.id,
            :selected_items => selected_items,
            :old_name       => @ae_class.name,
            :fqname         => @ae_class.fqname
          }

          controller.params = {:id => @ae_class.id}
          controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
          controller.instance_variable_set(:@edit, edit)
          session[:edit] = edit

          allow(controller).to receive(:build_automate_tree)
          allow(controller).to receive(:render)

          controller.send(:copy_objects_save)

          expect(controller).to have_received(:render).with(:json => hash_including(:message, :redirect_url))
          expect(MiqAeClass.find_by(:name => "copied_class")).not_to be_nil
        end

        it "handles override_existing flag" do
          FactoryBot.create(:miq_ae_class, :name => @ae_class.name, :namespace_id => @namespace2.id)

          selected_items = {@ae_class.id => @ae_class.name}
          edit = {
            :key            => "copy_objects__#{@ae_class.id}",
            :new            => {
              :domain            => @domain2.id,
              :namespace         => @namespace2.fqname,
              :override_existing => true,
              :new_name          => nil
            },
            :typ            => MiqAeClass,
            :rec_id         => @ae_class.id,
            :selected_items => selected_items,
            :old_name       => @ae_class.name,
            :fqname         => @ae_class.fqname
          }

          controller.params = {:id => @ae_class.id}
          controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
          controller.instance_variable_set(:@edit, edit)
          session[:edit] = edit

          allow(controller).to receive(:build_automate_tree)
          allow(controller).to receive(:render)

          controller.send(:copy_objects_save)

          expect(controller).to have_received(:render).with(:json => hash_including(:message, :redirect_url))
        end
      end

      context "copying an instance" do
        it "successfully copies instance to different class" do
          FactoryBot.create(:miq_ae_class, :name => "target_class", :namespace_id => @namespace2.id)
          selected_items = {@ae_instance.id => @ae_instance.name}
          edit = {
            :key            => "copy_objects__#{@ae_instance.id}",
            :new            => {
              :domain            => @domain2.id,
              :namespace         => @namespace2.fqname,
              :override_existing => false,
              :new_name          => nil
            },
            :typ            => MiqAeInstance,
            :rec_id         => @ae_instance.id,
            :selected_items => selected_items,
            :old_name       => @ae_instance.name,
            :fqname         => @ae_instance.fqname
          }

          controller.params = {:id => @ae_instance.id}
          controller.instance_variable_set(:@sb, :action => "miq_ae_instance_copy")
          controller.instance_variable_set(:@edit, edit)
          session[:edit] = edit

          allow(controller).to receive(:build_automate_tree)
          allow(controller).to receive(:render)

          expect {
            controller.send(:copy_objects_save)
          }.to change(MiqAeInstance, :count).by(1)

          expect(controller).to have_received(:render).with(:json => hash_including(:message, :redirect_url))
        end

        it "copies instance with new name" do
          selected_items = {@ae_instance.id => @ae_instance.name}
          edit = {
            :key            => "copy_objects__#{@ae_instance.id}",
            :new            => {
              :domain            => @domain2.id,
              :namespace         => @namespace2.fqname,
              :override_existing => false,
              :new_name          => "copied_instance"
            },
            :typ            => MiqAeInstance,
            :rec_id         => @ae_instance.id,
            :selected_items => selected_items,
            :old_name       => @ae_instance.name,
            :fqname         => @ae_instance.fqname
          }

          controller.params = {:id => @ae_instance.id}
          controller.instance_variable_set(:@sb, :action => "miq_ae_instance_copy")
          controller.instance_variable_set(:@edit, edit)
          session[:edit] = edit

          allow(controller).to receive(:build_automate_tree)
          allow(controller).to receive(:render)

          controller.send(:copy_objects_save)

          expect(controller).to have_received(:render).with(:json => hash_including(:message, :redirect_url))
        end
      end

      it "handles copy errors gracefully" do
        selected_items = {@ae_class.id => @ae_class.name}
        edit = {
          :key            => "copy_objects__#{@ae_class.id}",
          :new            => {
            :domain            => @domain2.id,
            :namespace         => @namespace2.fqname,
            :override_existing => false,
            :new_name          => nil
          },
          :typ            => MiqAeClass,
          :rec_id         => @ae_class.id,
          :selected_items => selected_items,
          :old_name       => @ae_class.name,
          :fqname         => @ae_class.fqname
        }

        controller.params = {:id => @ae_class.id}
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit

        allow(controller).to receive(:build_automate_tree)
        allow(MiqAeClass).to receive(:copy).and_raise(StandardError.new("Copy failed"))
        allow(controller).to receive(:render)

        controller.send(:copy_objects_save)

        expect(controller).to have_received(:render).with(:json => hash_including(:error), :status => :bad_request)
      end

      it "clears session data after successful copy" do
        selected_items = {@ae_class.id => @ae_class.name}
        edit = {
          :key            => "copy_objects__#{@ae_class.id}",
          :new            => {
            :domain            => @domain2.id,
            :namespace         => @namespace2.fqname,
            :override_existing => false,
            :new_name          => nil
          },
          :typ            => MiqAeClass,
          :rec_id         => @ae_class.id,
          :selected_items => selected_items,
          :old_name       => @ae_class.name,
          :fqname         => @ae_class.fqname
        }

        controller.params = {:id => @ae_class.id}
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit

        allow(controller).to receive(:build_automate_tree)
        allow(controller).to receive(:render)

        controller.send(:copy_objects_save)

        expect(assigns(:in_a_form)).to be_falsey
        expect(assigns(:changed)).to be_falsey
        expect(assigns(:sb)[:action]).to be_nil
        expect(assigns(:edit)).to be_nil
      end
    end

    describe "#get_automate_tree_data" do
      it "returns tree data for namespace selection" do
        edit = {:new => {}}
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit

        allow(controller).to receive(:build_automate_tree)
        allow(controller).to receive(:url_for_only_path).and_return("/miq_ae_class/ae_tree_select")
        allow(controller).to receive(:render)

        tree_double = double("tree", :name => "automate_tree", :locals_for_render => {:bs_tree => "tree_data"})
        controller.instance_variable_set(:@automate_tree, tree_double)

        controller.send(:get_automate_tree_data)

        expect(controller).to have_received(:render).with(:json => hash_including(:tree_name, :bs_tree, :click_url, :onclick))
      end
    end

    describe "#get_namespace_path" do
      it "returns namespace path for valid namespace node" do
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.params = {:node_id => "aen-#{@namespace1.id}", :include_domain => "false"}

        allow(controller).to receive(:render)

        controller.send(:get_namespace_path)

        expect(controller).to have_received(:render).with(:json => hash_including(:path))
      end

      it "includes domain when requested" do
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.params = {:node_id => "aen-#{@namespace1.id}", :include_domain => "true"}

        allow(controller).to receive(:render)

        controller.send(:get_namespace_path)

        expect(controller).to have_received(:render).with(:json => hash_including(:path))
      end

      it "returns error for invalid node type" do
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.params = {:node_id => "invalid-123"}

        allow(controller).to receive(:render)

        controller.send(:get_namespace_path)

        expect(controller).to have_received(:render).with(:json => hash_including(:error), :status => 400)
      end

      it "returns error for domain node" do
        controller.instance_variable_set(:@sb, :action => "miq_ae_class_copy")
        controller.params = {:node_id => "aen-#{@domain1.id}"}

        allow(controller).to receive(:render)

        controller.send(:get_namespace_path)

        expect(controller).to have_received(:render).with(:json => hash_including(:error), :status => 400)
      end
    end
  end
end
