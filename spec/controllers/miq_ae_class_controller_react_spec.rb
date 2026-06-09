describe MiqAeClassController do
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
        
        controller.send(:new_instance_react)
        
        expect(assigns(:record_id)).to be_nil
        expect(assigns(:class_id)).to eq(@ae_class.id.to_s)
        expect(assigns(:in_a_form)).to be_truthy
        expect(assigns(:angular_form)).to be_truthy
        expect(assigns(:sb)[:action]).to eq("miq_ae_instance_new")
        expect(assigns(:right_cell_text)).to eq("Adding a new Automate Instance")
      end

      it "asserts privileges for new instance" do
        expect(controller).to receive(:assert_privileges).with("miq_ae_instance_new")
        allow(controller).to receive(:replace_right_cell)
        node = "aec-#{@ae_class.id}"
        controller.instance_variable_set(:@sb, :active_tree => :ae_tree, :trees => {:ae_tree => {:active_node => node}})
        
        controller.send(:new_instance_react)
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
        
        controller.send(:edit_instance_react)
        
        expect(assigns(:record_id)).to eq(@ae_instance.id.to_s)
        expect(assigns(:class_id)).to be_nil
        expect(assigns(:in_a_form)).to be_truthy
        expect(assigns(:angular_form)).to be_truthy
        expect(assigns(:sb)[:action]).to eq("miq_ae_instance_edit")
        expect(assigns(:right_cell_text)).to eq("Editing Automate Instance \"test_instance\"")
      end

      it "handles checked items for edit" do
        controller.params = {}
        controller.instance_variable_set(:@sb, :row_selected => "aei-#{@ae_instance.id}")
        allow(controller).to receive(:find_checked_items).and_return(["aei-#{@ae_instance.id}"])
        allow(controller).to receive(:replace_right_cell)
        
        controller.send(:edit_instance_react)
        
        expect(assigns(:record_id)).to eq(@ae_instance.id.to_s)
      end

      it "asserts privileges for edit instance" do
        expect(controller).to receive(:assert_privileges).with("miq_ae_instance_edit")
        allow(controller).to receive(:replace_right_cell)
        node = "aei-#{@ae_instance.id}"
        controller.instance_variable_set(:@sb, :active_tree => :ae_tree, :trees => {:ae_tree => {:active_node => node}})
        
        controller.send(:edit_instance_react)
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
          :class_id => @ae_class.id,
          :name => "new_instance",
          :display_name => "New Instance",
          :description => "New Description",
          :ae_values => [
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
          :class_id => @ae_class.id,
          :name => "",
          :display_name => "New Instance"
        }
        
        post :instance_create, :params => params
        
        expect(response.status).to eq(400)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to include("Name is required")
      end

      # it "requires class_id parameter" do
      #   controller.params = {:name => "new_instance"}
        
      #   expect {
      #     controller.send(:instance_create)
      #   }.to raise_error(RuntimeError, "class_id parameter is required")
      # end

      it "handles state machine fields" do
        state_class = FactoryBot.create(:miq_ae_class, :name => "state_class", :namespace_id => @namespace.id)
        allow_any_instance_of(MiqAeClass).to receive(:state_machine?).and_return(true)
        state_field = FactoryBot.create(:miq_ae_field, :name => "state1", :aetype => "state", :class_id => state_class.id, :priority => 1)
        
        params = {
          :class_id => state_class.id,
          :name => "state_instance",
          :ae_values => [
            {
              :value => "value1",
              :on_entry => "on_entry_method",
              :on_exit => "on_exit_method",
              :on_error => "on_error_method",
              :max_retries => "3",
              :max_time => "60"
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
          :name => "new_instance"
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
          :id => @ae_instance.id,
          :name => "updated_instance",
          :display_name => "Updated Instance",
          :description => "Updated Description",
          :ae_values => [
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
          :id => @ae_instance.id,
          :name => ""
        }
        
        post :instance_update, :params => params
        
        expect(response.status).to eq(400)
        json_response = JSON.parse(response.body)
        expect(json_response["error"]).to include("Name is required")
      end

      it "updates ae_values correctly" do
        params = {
          :id => @ae_instance.id,
          :name => "test_instance",
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
        state_value = FactoryBot.create(:miq_ae_value, :field_id => state_field.id, :instance_id => state_instance.id)
        
        params = {
          :id => state_instance.id,
          :name => "state_instance",
          :ae_values => [
            {
              :value => "updated_value",
              :on_entry => "updated_on_entry",
              :on_exit => "updated_on_exit",
              :on_error => "updated_on_error",
              :max_retries => "5",
              :max_time => "120"
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
          :id => @ae_instance.id,
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
            :key => "copy_objects__#{@ae_class.id}",
            :new => {
              :domain => @domain2.id,
              :namespace => @namespace2.fqname,
              :override_existing => false,
              :new_name => nil
            },
            :typ => MiqAeClass,
            :rec_id => @ae_class.id,
            :selected_items => selected_items,
            :old_name => @ae_class.name,
            :fqname => @ae_class.fqname
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
            :key => "copy_objects__#{@ae_class.id}",
            :new => {
              :domain => @domain2.id,
              :namespace => @namespace2.fqname,
              :override_existing => false,
              :new_name => "copied_class"
            },
            :typ => MiqAeClass,
            :rec_id => @ae_class.id,
            :selected_items => selected_items,
            :old_name => @ae_class.name,
            :fqname => @ae_class.fqname
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
          # Create existing class in target namespace
          FactoryBot.create(:miq_ae_class, :name => @ae_class.name, :namespace_id => @namespace2.id)
          
          selected_items = {@ae_class.id => @ae_class.name}
          edit = {
            :key => "copy_objects__#{@ae_class.id}",
            :new => {
              :domain => @domain2.id,
              :namespace => @namespace2.fqname,
              :override_existing => true,
              :new_name => nil
            },
            :typ => MiqAeClass,
            :rec_id => @ae_class.id,
            :selected_items => selected_items,
            :old_name => @ae_class.name,
            :fqname => @ae_class.fqname
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
          target_class = FactoryBot.create(:miq_ae_class, :name => "target_class", :namespace_id => @namespace2.id)
          selected_items = {@ae_instance.id => @ae_instance.name}
          edit = {
            :key => "copy_objects__#{@ae_instance.id}",
            :new => {
              :domain => @domain2.id,
              :namespace => @namespace2.fqname,
              :override_existing => false,
              :new_name => nil
            },
            :typ => MiqAeInstance,
            :rec_id => @ae_instance.id,
            :selected_items => selected_items,
            :old_name => @ae_instance.name,
            :fqname => @ae_instance.fqname
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
            :key => "copy_objects__#{@ae_instance.id}",
            :new => {
              :domain => @domain2.id,
              :namespace => @namespace2.fqname,
              :override_existing => false,
              :new_name => "copied_instance"
            },
            :typ => MiqAeInstance,
            :rec_id => @ae_instance.id,
            :selected_items => selected_items,
            :old_name => @ae_instance.name,
            :fqname => @ae_instance.fqname
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
          :key => "copy_objects__#{@ae_class.id}",
          :new => {
            :domain => @domain2.id,
            :namespace => @namespace2.fqname,
            :override_existing => false,
            :new_name => nil
          },
          :typ => MiqAeClass,
          :rec_id => @ae_class.id,
          :selected_items => selected_items,
          :old_name => @ae_class.name,
          :fqname => @ae_class.fqname
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
          :key => "copy_objects__#{@ae_class.id}",
          :new => {
            :domain => @domain2.id,
            :namespace => @namespace2.fqname,
            :override_existing => false,
            :new_name => nil
          },
          :typ => MiqAeClass,
          :rec_id => @ae_class.id,
          :selected_items => selected_items,
          :old_name => @ae_class.name,
          :fqname => @ae_class.fqname
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
        
        # Mock the tree object
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
