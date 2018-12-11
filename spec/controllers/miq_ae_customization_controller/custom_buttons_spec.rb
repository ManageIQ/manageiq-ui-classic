describe MiqAeCustomizationController do
  before do
    stub_user(:features => :all)
  end
  context "::CustomButtons" do
    context "#ab_get_node_info" do
      it "correct target class gets set when assigned button node is clicked" do
        custom_button = FactoryBot.create(:custom_button, :applies_to_class => "Host", :name => "Some Name")
        target_classes = {}
        CustomButton.button_classes.each { |db| target_classes[ui_lookup(:model => db)] = db }
        controller.instance_variable_set(:@sb, :target_classes => target_classes)
        controller.send(:ab_get_node_info, "xx-ab_Host_cbg-10r95_cb-#{custom_button.id}")
        expect(assigns(:resolve)[:new][:target_class]).to eq("Host / Node")
      end
    end
  end
  render_views
  describe "#ab_form" do
    it "displays the layout" do
      allow(MiqAeClass).to receive_messages(:find_distinct_instances_across_domains => [double(:name => "foo")])
      @sb = {:active_tree => :ab_tree,
             :trees       => {:ab_tree => {:tree => :ab_tree}},
             :params      => {:instance_name => 'CustomButton_1'}}
      controller.instance_variable_set(:@sb, @sb)
      controller.instance_variable_set(:@breadcrumbs, [])

      edit = {
        :new               => {:available_dialogs => {:id => '01', :name => '02'},
                               :instance_name     => 'CustomButton_1',
                               :attrs             => [%w(Attr1 01), %w(Attr2 02), %w(Attr3 03), %w(Attr4 04), %w(Attr5 05)],
                               :visibility_typ    => 'Type1'},
        :instance_names    => %w(CustomButton_1 CustomButton_2),
        :visibility_types  => %w(Type1 Type2),
        :ansible_playbooks => [],
        :current           => {}
      }
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      session[:resolve] = {}
      post :automate_button_field_changed, :params => { :instance_name => 'CustomButton', :name => 'test', :button_icon => 'fa fa-star' }
      expect(response.status).to eq(200)
    end

    it "displays disabled text" do
      allow(MiqAeClass).to receive_messages(:find_distinct_instances_across_domains => [double(:name => "foo")])
      e_expression = MiqExpression.new("=" => {:field => "Vm.name", :value => "TestVMForEnablementExpression"}, :token => 1)
      v_expression = MiqExpression.new("!=" => {:field => "Vm.description", :value => "TestVMDescriptionForVisibilityExpression"}, :token => 1)

      @sb = {:active_tree => :ab_tree,
             :trees       => {:ab_tree => {:tree => :ab_tree}},
             :params      => {:instance_name => 'CustomButton_1'}}
      controller.instance_variable_set(:@sb, @sb)
      controller.instance_variable_set(:@breadcrumbs, [])

      edit = {:new                   => {:button_images  => %w(01 02 03), :available_dialogs => {:id => '01', :name => '02'},
                                         :display_for    => 'single',
                                         :instance_name  => 'CustomButton_1',
                                         :attrs          => [%w(Attr1 01), %w(Attr2 02), %w(Attr3 03), %w(Attr4 04), %w(Attr5 05)],
                                         :disabled_text  => 'a_disabled_text',
                                         :visibility_typ => 'Type1'},
              :instance_names        => %w(CustomButton_1 CustomButton_2),
              :visibility_expression => v_expression.exp,
              :enablement_expression => e_expression.exp,
              :visibility_types      => %w(Type1 Type2),
              :ansible_playbooks     => [],
              :current               => {}}
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      session[:resolve] = {}
      post :automate_button_field_changed, :params => {:instance_name => 'CustomButton',
                                                       :name          => 'test',
                                                       :button_image  => '01',
                                                       :disabled_text => 'a_new_disabled_text'}
      expect(response.status).to eq(200)
      expect(response.body).to include('name=\"disabled_text\" id=\"disabled_text\" value=\"a_new_disabled_text\"')
    end

    it "the active tab is Advanced when the System/process field is updated" do
      @sb = {:active_tree => :ab_tree,
             :trees       => {:ab_tree => {:tree => :ab_tree}},
             :params      => {:instance_name => 'MiqEvent'}}
      controller.instance_variable_set(:@sb, @sb)
      controller.instance_variable_set(:@breadcrumbs, [])

      edit = {:new               => {:button_images => %w(01 02 03), :available_dialogs => {:id => '01', :name => '02'},
                                    :instance_name  => 'MiqEvent',
                                    :attrs          => [%w(Attr1 01), %w(Attr2 02), %w(Attr3 03), %w(Attr4 04), %w(Attr5 05)],
                                    :disabled_text  => 'a_disabled_text',
                                    :visibility_typ => 'Type1'},
              :instance_names    => %w(CustomButton_1 CustomButton_2),
              :visibility_types  => %w(Type1 Type2),
              :ansible_playbooks => [],
              :current           => {}}
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      session[:resolve] = {}
      post :automate_button_field_changed, :params => {:id => 'new', :instance_name => "Request"}
      expect(assigns(:sb)[:active_tab]).to eq("ab_advanced_tab")
    end

    it "the request field is cleared when the button type is changed from Playbook to Default" do
      @sb = {:active_tree => :ab_tree,
             :trees       => {:ab_tree => {:tree => :ab_tree}},
             :params      => {:instance_name => 'MiqEvent'}}
      controller.instance_variable_set(:@sb, @sb)
      controller.instance_variable_set(:@breadcrumbs, [])

      edit = {:new               => {:button_images  => %w(01 02 03), :available_dialogs => {:id => '01', :name => '02'},
                                     :instance_name  => 'MiqEvent',
                                     :attrs          => [%w(Attr1 01), %w(Attr2 02), %w(Attr3 03), %w(Attr4 04), %w(Attr5 05)],
                                     :disabled_text  => 'a_disabled_text',
                                     :object_request => CustomButton::PLAYBOOK_METHOD,
                                     :button_type    => 'ansible_playbook'},
              :instance_names    => %w(CustomButton_1 CustomButton_2),
              :visibility_types  => %w(Type1 Type2),
              :ansible_playbooks => [],
              :current           => {}}
      controller.instance_variable_set(:@edit, edit)
      session[:edit] = edit
      session[:resolve] = {}
      post :automate_button_field_changed, :params => {:id => 'new', :button_type => "default"}
      @edit = controller.instance_variable_get(:@edit)
      expect(@edit[:new][:object_request]).to be_nil
    end

    it "uses available expression fields when editing the custom buttons expressions" do
      allow(MiqAeClass).to receive_messages(:find_distinct_instances_across_domains => [double(:name => "foo")])

      e_exp = MiqExpression.new("=" => {:field => "MiqGroup.name", :value => "TestEnablementExpression"}, :token => 1)

      @sb = {:active_tree => :ab_tree,
             :trees       => {:ab_tree => {:tree => :ab_tree}},
             :params      => {:instance_name => 'CustomButton_1'}}
      controller.instance_variable_set(:@sb, @sb)
      controller.instance_variable_set(:@breadcrumbs, [])

      edit = {:new               => {:button_images         => %w(01 02 03), :available_dialogs => {:id => '01', :name => '02'},
                                     :instance_name         => 'CustomButton_1',
                                     :attrs                 => [%w(Attr1 01), %w(Attr2 02), %w(Attr3 03), %w(Attr4 04), %w(Attr5 05)],
                                     :enablement_expression => e_exp.exp},
              :instance_names    => %w(CustomButton_1 CustomButton_2),
              :exp_key           => 'foo',
              :ansible_playbooks => [],
              :current           => {}}
      edit[:enablement_expression] ||= ApplicationController::Filter::Expression.new
      edit[:enablement_expression][:expression] = {:test => "foo", :token => 1}
      edit[:new][:enablement_expression] = copy_hash(edit[:enablement_expression][:expression])
      edit[:enablement_expression].history.reset(edit[:enablement_expression][:expression])
      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@expkey, :enablement_expression)
      edit[:enablement_expression][:exp_table] = controller.send(:exp_build_table, edit[:enablement_expression][:expression])
      edit[:enablement_expression][:exp_model] = 'MiqGroup'
      session[:edit] = edit
      session[:expkey] = :enablement_expression
      controller.instance_variable_set(:@edit, edit)
      post :exp_token_pressed, :params => {:id => 'new', :token => 1}
      @edit = controller.instance_variable_get(:@edit)
      expect(@edit[:enablement_expression][:exp_typ]).to be_nil
    end
  end
end
