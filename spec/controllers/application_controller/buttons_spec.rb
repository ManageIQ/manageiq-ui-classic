describe ApplicationController do
  context "#custom_buttons" do
    let(:resource_action) { FactoryBot.create(:resource_action, :dialog_id => 1) }
    let(:button)          { FactoryBot.create(:custom_button, :name => "My Button", :applies_to_class => "Vm", :resource_action => resource_action) }
    let(:host)            { FactoryBot.create(:host_vmware) }
    let(:vm)              { FactoryBot.create(:vm_vmware, :name => "My VM") }
    let(:service)         { FactoryBot.create(:service) }

    context "with a resource_action dialog" do
      it "Vm button" do
        controller.params = {:id => vm.id, :button_id => button.id}
        expect(controller).to receive(:dialog_initialize) do |action, options|
          expect(action).to eq(resource_action)
          expect(options[:target_id]).to eq(vm.id)
          expect(options[:target_kls]).to eq(vm.class.name)
        end

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(vm.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end

      it "Host button" do
        button.applies_to = host
        button.save
        controller.params = {:id => host.id, :button_id => button.id}

        expect(controller).to receive(:dialog_initialize) do |action, options|
          expect(action).to eq(resource_action)
          expect(options[:target_id]).to eq(host.id)
          expect(options[:target_kls]).to eq(host.class.name)
        end

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(host.name)
        expect(controller.instance_variable_get(:@explorer)).to be_falsy
      end
    end

    it "Host button with a subclass, not base_class in applies_to_class" do
      button.update_attributes(:applies_to_class => host.class.name)
      controller.params = {:id => host.id, :button_id => button.id}
      expect { controller.send(:custom_buttons) }.to raise_error(ArgumentError)
    end

    context "with a button with open_url" do
      before do
        resource_action.update_attribute(:dialog_id, nil)
        button.update_attributes(:options => {:open_url => true})
        expect(controller).to receive(:render)
      end

      it "Vm button" do
        controller.params = {:id => vm.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke_async).with(vm, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(vm.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end
    end

    context "without a resource_action dialog" do
      before do
        resource_action.update_attribute(:dialog_id, nil)
        expect(controller).to receive(:render)
      end

      it "Vm button" do
        controller.params = {:id => vm.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke).with(vm, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(vm.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end

      it "Host button" do
        button.applies_to = host
        button.save
        controller.params = {:id => host.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke).with(host, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(host.name)
        expect(controller.instance_variable_get(:@explorer)).to be_falsy
      end

      it "ServiceTemplate button" do
        button.applies_to = ServiceTemplate
        button.save
        controller.params = {:id => service.id, :button_id => button.id}
        expect_any_instance_of(CustomButton).to receive(:invoke).with(service, 'UI')

        controller.send(:custom_buttons)
        expect(assigns(:right_cell_text)).to include(service.name)
        expect(controller.instance_variable_get(:@explorer)).to be_truthy
      end
    end

    context "#button_create_update" do
      it "no need to set @record when add/cancel form buttons are pressed" do
        custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host")
        controller.params = {:button => "cancel", :id => custom_button.id}
        edit = {
          :new           => {},
          :current       => {},
          :custom_button => custom_button
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.instance_variable_set(:@sb,
                                         :trees       => {:ab_tree => {:active_node => "-ub-Host"}},
                                         :active_tree => :ab_tree)
        allow(controller).to receive(:ab_get_node_info)
        allow(controller).to receive(:replace_right_cell)
        controller.send(:button_create_update, "add")
        expect(@record).to be_nil
      end

      it "the active tab is Advanced when the button pressed is an expression" do
        custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host")
        controller.params = {:button => "enablement_expression", :id => custom_button.id}
        edit = {:new           => {},
                :current       => {},
                :custom_button => custom_button}
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.instance_variable_set(:@sb,
                                         :trees       => {:ab_tree => {:active_node => "-ub-Host"}},
                                         :active_tree => :ab_tree)
        allow(controller).to receive(:ab_get_node_info)
        allow(controller).to receive(:exp_build_table_or_nil).and_return(nil)
        allow(controller).to receive(:replace_right_cell)
        controller.send(:button_create_update, "add")
        expect(assigns(:sb)[:active_tab]).to eq("ab_advanced_tab")
      end

      it "calls replace_right_cell with action='button_edit' when the edit expression button was pressed" do
        custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host")
        controller.params = {:button => "enablement_expression", :id => custom_button.id}
        edit = {:new           => {},
                :current       => {},
                :custom_button => custom_button}
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.instance_variable_set(:@sb,
                                         :trees       => {:ab_tree => {:active_node => "-ub-Host"}},
                                         :active_tree => :ab_tree)
        allow(controller).to receive(:ab_get_node_info)
        allow(controller).to receive(:exp_build_table_or_nil).and_return(nil)
        expect(controller).to receive(:replace_right_cell).with(:action => 'button_edit')
        controller.send(:button_create_update, "edit")
      end

      it "calls replace_right_cell with action='button_edit' when the edit expression button was pressed" do
        custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host")
        controller.params = {:button => "enablement_expression", :id => custom_button.id}
        edit = {:new           => {},
                :current       => {},
                :custom_button => custom_button}
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
        controller.instance_variable_set(:@sb,
                                         :trees       => {:ab_tree => {:active_node => "-ub-Host"}},
                                         :active_tree => :ab_tree)
        allow(controller).to receive(:ab_get_node_info)
        allow(controller).to receive(:exp_build_table_or_nil).and_return(nil)
        expect(controller).to receive(:replace_right_cell).with(:action => 'button_edit')
        controller.send(:button_create_update, "reset")
      end
    end
  end

  context "#button_set_form_vars" do
    it "check button_set_form_vars sets correct applies_to_class when editing a button" do
      # button_set_form_vars expects that the simulation screen will be built,
      #   which, in turn, needs *something* to come back from automate
      allow(MiqAeClass).to receive_messages(:find_distinct_instances_across_domains => [double(:name => "foo")])

      custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Vm", :options => {:display => false, :button_icon => "fa fa-info"})
      custom_button.uri_path, custom_button.uri_attributes, custom_button.uri_message = CustomButton.parse_uri("/test/")
      custom_button.uri_attributes["request"] = "req"
      custom_button.save
      controller.params = {:id => custom_button.id}
      controller.instance_variable_set(:@custom_button, custom_button)
      controller.instance_variable_set(:@sb,
                                       :trees       => {
                                         :ab_tree => {:active_node => "-ub-Vm_cb-10r51"}
                                       },
                                       :active_tree => :ab_tree)
      controller.send(:button_set_form_vars)
      expect(assigns(:edit)[:new][:target_class]).to eq("Vm")
      expect(assigns(:edit)[:new][:display]).to eq(false)
      expect(assigns(:edit)[:new][:button_icon]).to eq('fa fa-info')
      expect(assigns(:edit)[:new][:open_url]).to eq(false)
      expect(assigns(:edit)[:new][:dialog_id]).to eq(nil)
      expect(assigns(:edit)[:new][:disabled_open_url]).to eq(false)

      controller.instance_variable_set(:@sb,
                                       :trees       => {
                                         :ab_tree => {:active_node => "xx-ab_Vm_cbg-10r96_cb-10r7"}
                                       },
                                       :active_tree => :ab_tree)
      controller.send(:button_set_form_vars)
      expect(assigns(:edit)[:new][:target_class]).to eq("Vm")
    end

    it "check button_set_form_vars sets correctly loads the filtering expressions when editing a button" do
      allow(MiqAeClass).to receive_messages(:find_distinct_instances_across_domains => [double(:name => "foo")])
      e_expression = MiqExpression.new("=" => {:field => "Vm.name", :value => "Test"}, :token => 1)
      v_expression = MiqExpression.new("!=" => {:field => "Vm.description", :value => "DescriptionTest"}, :token => 1)

      custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Vm", :visibility_expression => v_expression, :enablement_expression => e_expression, :options => {:display => false, :button_icon => "5"})
      custom_button.uri_path, custom_button.uri_attributes, custom_button.uri_message = CustomButton.parse_uri("/test/")
      custom_button.uri_attributes["request"] = "test_req"
      custom_button.resource_action.dialog_id = 42
      custom_button.save
      controller.params = {:id => custom_button.id}
      controller.instance_variable_set(:@custom_button, custom_button)
      controller.instance_variable_set(:@sb,
                                       :trees       => {:ab_tree => {:active_node => "-ub-Vm_cb-10r51"}},
                                       :active_tree => :ab_tree)
      controller.send(:button_set_form_vars)
      expect(assigns(:edit)[:new][:target_class]).to eq("Vm")
      expect(assigns(:edit)[:new][:display]).to eq(false)
      expect(assigns(:edit)[:new][:button_icon]).to eq('5')
      expect(assigns(:edit)[:new][:open_url]).to eq(false)
      expect(assigns(:edit)[:new][:enablement_expression]).to eq(e_expression.exp)
      expect(assigns(:edit)[:new][:visibility_expression]).to eq(v_expression.exp)
      expect(assigns(:edit)[:new][:dialog_id]).to eq(42)
      expect(assigns(:edit)[:new][:disabled_open_url]).to eq(false)

      controller.instance_variable_set(:@sb,
                                       :trees       => { :ab_tree => {:active_node => "xx-ab_Vm_cbg-10r96_cb-10r7"}},
                                       :active_tree => :ab_tree)
      controller.send(:button_set_form_vars)
      expect(assigns(:edit)[:new][:target_class]).to eq("Vm")
    end

    it "check button_set_form_vars sets correct values when editing a playbook button" do
      # button_set_form_vars expects that the simulation screen will be built,
      #   which, in turn, needs *something* to come back from automate
      allow(MiqAeClass).to receive_messages(:find_distinct_instances_across_domains => [double(:name => "foo")])
      service_template = FactoryBot.create(:service_template_ansible_playbook, :name => "playbook_test")
      custom_button = FactoryBot.create(:custom_button,
                                         :applies_to_class => "Vm",
                                         :options          => {:display     => false,
                                                               :button_icon => "fa fa-info",
                                                               :button_type => "ansible_playbook"})
      custom_button.uri_path, custom_button.uri_attributes, custom_button.uri_message = CustomButton.parse_uri("/test/")
      custom_button.uri_attributes[:service_template_name] = "playbook_test"
      custom_button.uri_attributes[:inventory_type] = "localhost"
      custom_button.uri_attributes["request"] = "Order_Ansible_Playbook"
      custom_button.save
      controller.params = {:id => custom_button.id}
      controller.instance_variable_set(:@custom_button, custom_button)
      controller.instance_variable_set(:@sb,
                                       :trees       => {:ab_tree => {:active_node => "-ub-Vm_cb-10r51"}},
                                       :active_tree => :ab_tree)
      controller.send(:button_set_form_vars)
      expect(assigns(:edit)[:new][:target_class]).to eq("Vm")
      expect(assigns(:edit)[:new][:display]).to eq(false)
      expect(assigns(:edit)[:new][:button_icon]).to eq('fa fa-info')
      expect(assigns(:edit)[:new][:open_url]).to eq(false)
      expect(assigns(:edit)[:new][:button_type]).to eq('ansible_playbook')
      expect(assigns(:edit)[:new][:object_request]).to eq('Order_Ansible_Playbook')
      expect(assigns(:edit)[:new][:service_template_id]).to eq(service_template.id)
      expect(assigns(:edit)[:new][:inventory_type]).to eq('localhost')
      expect(assigns(:edit)[:new][:disabled_open_url]).to eq(false)

      controller.instance_variable_set(:@sb,
                                       :trees       => {:ab_tree => {:active_node => "xx-ab_Vm_cbg-10r96_cb-10r7"}},
                                       :active_tree => :ab_tree)
      controller.send(:button_set_form_vars)
      expect(assigns(:edit)[:new][:target_class]).to eq("Vm")
    end
  end

  context "#button_valid?" do
    it "check button_validity and display appropriate flash messages" do
      edit = {
        :new => {}
      }

      controller.send(:button_valid?, edit[:new])
      flash_messages = [
        {:message => "Button Text is required", :level => :error},
        {:message => "Button Icon must be selected", :level => :error},
        {:message => "Button Hover Text is required", :level => :error},
        {:message => "Starting Process is required", :level => :error},
        {:message => "Request is required", :level => :error}
      ]
      expect(assigns(:flash_array)).to eq(flash_messages)
    end

    it "display appropriate error messages for display = list" do
      edit = {
        :new => {:name           => 'testCB',
                 :description    => 'testCB',
                 :button_icon    => 'img',
                 :object_request => 'request',
                 :dialog_id      => 0,
                 :open_url       => true,
                 :display_for    => :list}
      }
      flash_errors = [{:message => "Starting Process is required", :level => :error},
                      {:message => 'URL can be opened only by buttons for a single entity', :level => :error}]

      controller.send(:button_valid?, edit[:new])
      expect(assigns(:flash_array)).to match(flash_errors)
    end
  end

  context "#button_set_record_vars" do
    let(:role) { FactoryBot.create(:miq_user_role, :name => "foo") }
    let(:old_role) { FactoryBot.create(:miq_user_role, :name => "bar") }
    let(:custom_button) { FactoryBot.create(:custom_button, :applies_to_class => "Vm", :options => {:display => false, :button_icon => "5"}) }
    let(:edit) {
      {:uri => '/test/',
       :new => {:name           => 'testCB',
                :description    => 'testCB',
                :button_icon    => 'img',
                :object_request => 'request',
                :open_url       => true,
                :visibility_typ => 'role',
                :roles          => [role.id.to_s],
                :display_for    => :list}
      }
    }

    before do
      custom_button.uri_path, custom_button.uri_attributes, custom_button.uri_message = CustomButton.parse_uri("/test/")
      custom_button.uri_attributes["request"] = "test_req"
      custom_button.save
      session[:edit] = edit
      controller.instance_variable_set(:@edit, edit)
    end

    it "sets new role visibility for custom button" do
      controller.send(:button_set_record_vars, custom_button)
      expect(custom_button.visibility[:roles]).to eq([role.name])
    end

    it "sets new role and preserves old role for custom button" do
      edit[:new][:roles] = [old_role.id, role.id.to_s] # old roles are represented by int and new ones by string
      controller.send(:button_set_record_vars, custom_button)
      expect(custom_button.visibility[:roles]).to eq([old_role.name, role.name])
    end
  end

  context "#automate_button_field_changed" do
    context 'sets dialog_id' do
      let(:resource_action) { FactoryBot.create(:resource_action, :dialog_id => 1) }
      let(:button)          { FactoryBot.create(:custom_button, :name => "My Button", :applies_to_class => "Vm", :resource_action => resource_action) }
      before do
        controller.instance_variable_set(:@custom_button, button)
        allow(controller).to receive(:render).and_return(nil)
        edit = {
          :new           => {},
          :current       => {},
          :custom_button => button
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
      end

      it "to id of selected dialog" do
        controller.params = {:id => button.id, :dialog_id => 42}.with_indifferent_access
        controller.instance_variable_set(:@resolve, :target_class => "VM and Instance")
        controller.send(:automate_button_field_changed)
        expect(assigns(:edit)[:new][:dialog_id]).to eq(42)
      end

      it "to nil if no dialog selected" do
        controller.params = {"id" => button.id, "dialog_id" => ""}
        controller.instance_variable_set(:@resolve, :target_class => "VM and Instance")
        controller.send(:automate_button_field_changed)
        expect(assigns(:edit)[:new][:dialog_id]).to eq(nil)
      end
    end

    context 'sets @edit[:new][:disabled_open_url]' do
      let(:resource_action) { FactoryBot.create(:resource_action, :dialog_id => 1) }
      let(:button_for_vm) { FactoryBot.create(:custom_button, :name => "My Button", :applies_to_class => "Vm", :resource_action => resource_action) }
      let(:button_for_az) { FactoryBot.create(:custom_button, :name => "My Button", :applies_to_class => "AvailabilityZone", :resource_action => resource_action) }
      before do
        allow(controller).to receive(:render).and_return(nil)
        edit = {
          :new           => {:display_for => 'single'},
          :current       => {},
          :custom_button => {}
        }
        controller.instance_variable_set(:@edit, edit)
        session[:edit] = edit
      end
      it "to false for Vm and Template" do
        controller.params = {"id" => button_for_vm.id, "dialog_id" => ""}
        controller.instance_variable_set(:@resolve, :target_class => "Vm")
        controller.instance_variable_set(:@custom_button, button_for_vm)
        controller.send(:automate_button_field_changed)
        expect(assigns(:edit)[:new][:disabled_open_url]).to be false
      end

      it "to true for Availability Zone" do
        controller.params = {"id" => button_for_az.id, "dialog_id" => ""}
        controller.instance_variable_set(:@resolve, :target_class => "Availability Zone")
        controller.instance_variable_set(:@custom_button, button_for_az)
        controller.send(:automate_button_field_changed)
        expect(assigns(:edit)[:new][:disabled_open_url]).to be true
      end
    end
  end
end
