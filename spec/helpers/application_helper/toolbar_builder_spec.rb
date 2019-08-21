describe ApplicationHelper, "::ToolbarBuilder" do
  let(:toolbar_builder) do
    helper._toolbar_builder.tap do |h|
      # Publicize ToolbarBuilder's private interface for easier testing (Legacy reasons)
      h.class.send(:public, *h.private_methods)
    end
  end

  before do
    controller.extend(ApplicationController::CurrentUser)
    controller.class.include(ApplicationController::CurrentUser)
  end

  describe "custom_buttons" do
    let(:user) { FactoryBot.create(:user, :role => "super_administrator") }

    shared_examples "no custom buttons" do
      it "#get_custom_buttons" do
        expect(toolbar_builder.get_custom_buttons(subject.class, subject, Mixins::CustomButtons::Result.new(:single))).to be_blank
      end

      it "#custom_button_selects" do
        expect(toolbar_builder.custom_button_selects(subject.class, subject, Mixins::CustomButtons::Result.new(:single))).to be_blank
      end

      it "#build_custom_toolbar_class" do
        expect(toolbar_builder.build_custom_toolbar_class(subject.class, subject, Mixins::CustomButtons::Result.new(:single)).definition).to be_blank
      end

      it("#record_to_service_buttons") { expect(toolbar_builder.record_to_service_buttons(subject)).to be_blank }
    end

    shared_examples "with custom buttons" do
      def add_button_to_set(button_set, button)
        button_set.add_member(button)
        button_set.set_data[:button_order] ||= []
        button_set.set_data[:button_order].push(button.id)
        button_set.save
      end

      before do
        allow(MiqServer).to receive(:my_server) { FactoryBot.create(:miq_server) }
        @button_set = FactoryBot.create(:custom_button_set, :set_data => {:applies_to_class => applies_to_class, :button_icon => 'fa fa-cogs'})
        login_as user
        @button1 = FactoryBot.create(:custom_button, :applies_to_class => applies_to_class, :visibility => {:roles => ["_ALL_"]}, :options => {:button_icon => 'fa fa-star'})
        add_button_to_set(@button_set, @button1)
      end

      it "#get_custom_buttons" do
        expected_button1 = {
          :id            => @button1.id,
          :class         => @button1.applies_to_class,
          :name          => @button1.name,
          :description   => @button1.description,
          :image         => @button1.options[:button_icon],
          :color         => nil,
          :text_display  => @button1.options.key?(:display) ? @button1.options[:display] : true,
          :enabled       => true,
          :disabled_text => nil,
          :target_object => subject.id
        }
        expected_button_set = {
          :id           => @button_set.id,
          :text         => @button_set.name,
          :description  => @button_set.description,
          :image        => @button_set.set_data[:button_icon],
          :color        => nil,
          :text_display => @button_set.set_data.key?(:display) ? @button_set.set_data[:display] : true,
          :buttons      => [expected_button1]
        }

        expect(toolbar_builder.get_custom_buttons(subject.class, subject, Mixins::CustomButtons::Result.new(:single))).to eq([expected_button_set])
      end

      it "#record_to_service_buttons" do
        expect(toolbar_builder.record_to_service_buttons(subject)).to be_blank
      end

      it "#custom_button_selects" do
        escaped_button1_text = CGI.escapeHTML(@button1.name.to_s)
        button1 = {
          :id        => "custom__custom_#{@button1.id}",
          :type      => :button,
          :icon      => "#{@button1.options[:button_icon]} fa-lg",
          :color     => nil,
          :title     => CGI.escapeHTML(@button1.description.to_s),
          :text      => escaped_button1_text,
          :enabled   => true,
          :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
          :url       => "button",
          :url_parms => "?id=#{subject.id}&button_id=#{@button1.id}&cls=#{subject.class.name}&pressed=custom_button&desc=#{escaped_button1_text}"
        }
        button_set_item1_items = [button1]
        button_set_item1 = {
          :id      => "custom_#{@button_set.id}",
          :type    => :buttonSelect,
          :icon    => "#{@button_set.set_data[:button_icon]} fa-lg",
          :color   => nil,
          :title   => @button_set.description,
          :text    => @button_set.name,
          :enabled => true,
          :items   => button_set_item1_items
        }
        items = [button_set_item1]
        name = "custom_buttons_#{@button_set.name}"
        result = toolbar_builder.custom_button_selects(subject.class, subject, Mixins::CustomButtons::Result.new(:single))
        expect(result).to eq([:name => name, :items => items])
      end

      it "#build_custom_toolbar_class" do
        escaped_button1_text = CGI.escapeHTML(@button1.name.to_s)
        button1 = {
          :id        => "custom__custom_#{@button1.id}",
          :type      => :button,
          :icon      => "#{@button1.options[:button_icon]} fa-lg",
          :color     => nil,
          :title     => CGI.escapeHTML(@button1.description.to_s),
          :text      => escaped_button1_text,
          :enabled   => true,
          :klass     => ApplicationHelper::Button::ButtonWithoutRbacCheck,
          :url       => "button",
          :url_parms => "?id=#{subject.id}&button_id=#{@button1.id}&cls=#{subject.class.name}&pressed=custom_button&desc=#{escaped_button1_text}"
        }
        button_set_item1_items = [button1]
        button_set_item1 = {
          :id      => "custom_#{@button_set.id}",
          :type    => :buttonSelect,
          :icon    => "#{@button_set.set_data[:button_icon]} fa-lg",
          :color   => nil,
          :title   => @button_set.description,
          :text    => @button_set.name,
          :enabled => true,
          :items   => button_set_item1_items
        }
        group_name = "custom_buttons_#{@button_set.name}"
        expect(toolbar_builder.build_custom_toolbar_class(subject.class, subject, Mixins::CustomButtons::Result.new(:single)).definition[group_name].buttons).to eq([button_set_item1])
      end
    end

    context "for VM" do
      let(:applies_to_class) { 'Vm' }
      subject { FactoryBot.create(:vm_vmware) }

      it_behaves_like "no custom buttons"
      it_behaves_like "with custom buttons"
    end

    context "for Service" do
      let(:applies_to_class) { 'ServiceTemplate' }
      let(:service_template) { FactoryBot.create(:service_template) }
      subject                { FactoryBot.create(:service, :service_template => service_template) }

      it_behaves_like "no custom buttons"
      it_behaves_like "with custom buttons"
    end

    context "for Service with ServiceTemplate" do
      let(:service_template) { FactoryBot.create(:service_template) }
      let!(:service)         { FactoryBot.create(:service, :service_template => service_template) }
      before do
        allow(MiqServer).to receive(:my_server) { FactoryBot.create(:miq_server) }
        login_as user
        @button = FactoryBot.create(:custom_button, :applies_to_class => "ServiceTemplate", :applies_to_id => service_template.id, :visibility => {:roles => ["_ALL_"]}, :options => {:button_icon => 'fa fa-star'})
      end

      it "#custom_button_add_related_buttons returns CustomButton without CustomButtonSet that applies to ServiceTemplate" do
        toolbar = Class.new(ApplicationHelper::Toolbar::Basic)
        toolbar_builder.custom_button_add_related_buttons(service.class, service, toolbar)
        buttons_in_toolbar = toolbar.definition["custom_buttons_"].buttons
        expect(buttons_in_toolbar.length).to eq(1)
        expect(buttons_in_toolbar.first[:id]).to eq("custom__custom_#{@button[:id]}")
      end
    end

    context "for GenericObject with GenericObjectDefinition" do
      let(:generic_object_definition) { FactoryBot.create(:generic_object_definition) }
      before do
        allow(MiqServer).to receive(:my_server) { FactoryBot.create(:miq_server) }
        login_as user
        @button = FactoryBot.create(:custom_button, :applies_to_class => "GenericObjectDefinition", :applies_to_id => generic_object_definition.id, :visibility => {:roles => ["_ALL_"]}, :options => {:button_icon => 'fa fa-star'})
        @goi = generic_object_definition.create_object(:name => "Test Load Balancer2")
      end

      it "#custom_button_add_related_buttons returns CustomButton without CustomButtonSet that applies to GenericObjectDefinition" do
        toolbar = Class.new(ApplicationHelper::Toolbar::Basic)
        toolbar_builder.custom_button_add_related_buttons(@goi.class, @goi, toolbar)
        buttons_in_toolbar = toolbar.definition["custom_buttons_"].buttons
        expect(buttons_in_toolbar.length).to eq(1)
        expect(buttons_in_toolbar.first[:id]).to eq("custom__custom_#{@button[:id]}")
      end
    end
  end

  describe "#twostate_button_selected" do
    before do
      @gtl_type = 'list'
      @settings = {
        :views => {
          :compare      => 'compressed',
          :drift        => 'compressed',
          :compare_mode => 'exists',
          :drift_mode   => 'exists',
        }
      }
    end
    subject { toolbar_builder.twostate_button_selected(id) }

    ['list', 'tile', 'grid'].each do |g|
      it "when with view_#{g}" do
        @gtl_type = g
        expect(toolbar_builder.twostate_button_selected("view_#{g}")).to be_truthy
      end
    end

    context "when with 'compare_compressed'" do
      let(:id) { "compare_compressed" }
      it { is_expected.to be_truthy }
    end

    context "when with 'drift_compressed'" do
      let(:id) { "drift_compressed" }
      it { is_expected.to be_truthy }
    end

    context "when with 'compare_all'" do
      let(:id) { "compare_all" }
      it { is_expected.to be_truthy }
    end

    context "when with 'drift_all'" do
      let(:id) { "drift_all" }
      it { is_expected.to be_truthy }
    end

    context "when with 'comparemode_exists" do
      let(:id) { "comparemode_exists" }
      it { is_expected.to be_truthy }
    end

    context "when with 'driftmode_exists" do
      let(:id) { "driftmode_exists" }
      it { is_expected.to be_truthy }
    end
  end

  describe "#apply_common_props" do
    before do
      @record = double(:id => 'record_id_xxx_001', :class => double(:name => 'record_xxx_class'))
      btn_num = "x_button_id_001"
      desc = 'the description for the button'
      @input = {:url       => "button",
                :url_parms => "?id=#{@record.id}&button_id=#{btn_num}&cls=#{@record.class.name}&pressed=custom_button&desc=#{desc}"}
      @tb_buttons = {}
      @button = {:id => "custom_#{btn_num}"}
      @button = ApplicationHelper::Button::Basic.new(nil, nil, {}, {:id => "custom_#{btn_num}"})
    end

    context "button visibility" do
      it "defaults to hidden false" do
        props = toolbar_builder.apply_common_props(@button, @input)
        expect(props[:hidden]).to be(false)
      end

      it "honors explicit input's hidden properties" do
        props = toolbar_builder.apply_common_props(@button, :hidden => true)
        expect(props[:hidden]).to be(true)
      end
    end

    context "saves the item info by the same key" do
      subject do
        toolbar_builder.apply_common_props(@button, @input)
      end

      it "when input[:hidden] exists" do
        @input[:hidden] = 1
        expect(subject).to have_key(:hidden)
      end

      it "when input[:url_parms] exists" do
        expect(subject).to have_key(:url_parms)
      end

      it "when input[:confirm] exists" do
        @input[:confirm] = 'Are you sure?'
        expect(subject).to have_key(:confirm)
      end

      it "when input[:onwhen] exists" do
        @input[:onwhen] = '1+'
        expect(subject).to have_key(:onwhen)
      end
    end

    context "internationalization" do
      it "does translation of text title and confirm strings" do
        %i(text title confirm).each do |key|
          @input[key] = 'Configuration' # common button string, translated into Japanese
        end
        FastGettext.locale = 'ja'
        toolbar_builder.apply_common_props(@button, @input)
        %i(text title confirm).each do |key|
          expect(@button[key]).not_to match('Configuration')
        end
        FastGettext.locale = 'en'
      end

      it "does delayed translation of text title and confirm strings" do
        %i(text title confirm).each do |key|
          @input[key] = proc do
            _("Add New %{table}") % {:table => 'Table'}
          end
        end
        FastGettext.locale = 'ja'
        toolbar_builder.apply_common_props(@button, @input)
        %i(text title confirm).each do |key|
          expect(@button[key]).not_to match('Add New Table')
        end
        FastGettext.locale = 'en'
      end
    end
  end

  describe "#update_common_props" do
    before do
      @record = double(:id => 'record_id_xxx_001', :class => 'record_xxx_class')
      btn_num = "x_button_id_001"
      desc = 'the description for the button'
      @item = {:button    => "custom_#{btn_num}",
               :url       => "button",
               :url_parms => "?id=#{@record.id}&button_id=#{btn_num}&cls=#{@record.class}&pressed=custom_button&desc=#{desc}"}
      @tb_buttons = {}
      @item_out = {}
    end

    context "when item[:url] exists" do
      subject do
        toolbar_builder.update_common_props(@item, @item_out)
      end

      it "saves the value as it is otherwise" do
        expect(subject).to have_key(:url)
      end

      it "calls url_for_button" do
        expect(toolbar_builder).to receive(:url_for_button).and_call_original
        toolbar_builder.update_common_props(@item, @item_out)
      end
    end
  end

  describe "url_for_button" do
    context "when restful routes" do
      before do
        allow(controller).to receive(:restful?) { true }
      end

      it "returns / when button is 'view_grid', 'view_tile' or 'view_list'" do
        result = toolbar_builder.url_for_button('view_list', '/1r2?', true)
        expect(result).to eq('/')
      end

      it "supports compressed ids" do
        result = toolbar_builder.url_for_button('view_list', '/1?', true)
        expect(result).to eq('/')
      end
    end
  end

  describe "update_url_parms", :type => :request do
    before do
      EvmSpecHelper.local_guid_miq_server_zone
    end

    context "when the given parameter exists in the request query string" do
      before do
        get "/vm/show_list/100", :params => "type=grid"
      end

      it "updates the query string with the given parameter value" do
        expect(toolbar_builder.update_url_parms("?type=list")).to eq("?type=list")
      end
    end

    context "when the given parameters do not exist in the request query string" do
      before do
        get "/vm/show_list/100"
      end

      it "adds the params in the query string" do
        expect(toolbar_builder.update_url_parms("?refresh=y&type=list")).to eq("?refresh=y&type=list")
      end
    end

    context "when the request query string has a few specific params to be retained" do
      before do
        get "/vm/show_list/100",
            :params => "bc=VMs+running+on+2014-08-25&menu_click=Display-VMs-on_2-6-5&sb_controller=host"
      end

      it "retains the specific parameters and adds the new one" do
        expect(toolbar_builder.update_url_parms("?type=list"))
          .to eq("?bc=VMs+running+on+2014-08-25&menu_click=Display-VMs-on_2-6-5&sb_controller=host&type=list")
      end
    end

    context "when the request query string has a few specific params to be excluded" do
      before do
        get "/vm/show_list/100", :params => "page=1"
      end

      it "excludes specific parameters and adds the new one" do
        expect(toolbar_builder.update_url_parms("?type=list")).to eq("?type=list")
      end
    end
  end

  context "toolbar_class" do
    before do
      controller.instance_variable_set(:@sb, :active_tree => :foo_tree)
      @pdf_button = {:id           => "download_choice__download_pdf",
                     :child_id     => "download_pdf",
                     :type         => :button,
                     :icon         => "fa fa-file-pdf-o fa-lg",
                     :color        => nil,
                     :text         => "Download as PDF",
                     :title        => "Download this report in PDF format",
                     :name         => "download_choice__download_pdf",
                     :hidden       => false,
                     :pressed      => nil,
                     :onwhen       => nil,
                     :enabled      => true,
                     :url          => "/download_data",
                     :url_parms    => "?download_type=pdf",
                     :send_checked => nil,
                     :data         => nil}
      @layout = "catalogs"
      stub_user(:features => :all)
      allow(helper).to receive(:x_active_tree).and_return(:ot_tree)
    end

    it "Enables edit and remove buttons for read-write orchestration templates" do
      @record = FactoryBot.create(:orchestration_template)
      buttons = helper.build_toolbar('orchestration_template_center_tb').first[:items]
      edit_btn = buttons.find { |b| b[:id].end_with?("_edit") }
      remove_btn = buttons.find { |b| b[:id].end_with?("_remove") }
      expect(edit_btn[:enabled]).to eq(true)
      expect(remove_btn[:enabled]).to eq(true)
    end

    it "Disables edit and remove buttons for read-only orchestration templates" do
      @record = FactoryBot.create(:orchestration_template_with_stacks)
      buttons = helper.build_toolbar('orchestration_template_center_tb').first[:items]
      edit_btn = buttons.find { |b| b[:id].end_with?("_edit") }
      remove_btn = buttons.find { |b| b[:id].end_with?("_remove") }
      expect(edit_btn[:enabled]).to eq(false)
      expect(remove_btn[:enabled]).to eq(false)
    end
  end

  describe "#build_toolbar" do
    context "when the toolbar to be built is a blank view" do
      let(:toolbar_to_build) { 'blank_view_tb' }

      it "returns nil" do
        expect(_toolbar_builder.build_toolbar(toolbar_to_build)).to be_nil
      end
    end

    context "when the toolbar is a generic object instances toolbar" do
      let(:toolbar_to_build) { 'generic_objects_center_tb' }

      before do
        go_def = FactoryBot.create(:generic_object_definition)
        @record = FactoryBot.create(:generic_object, :generic_object_definition_id => go_def.id)
        allow(Rbac).to receive(:role_allows?).and_return(true)
      end

      it "includes the 'send_checked' parameter" do
        items_hash = {:child_id     => "generic_object_tag",
                      :id           => "generic_object_policy_choice__generic_object_tag",
                      :type         => :button,
                      :hidden       => false,
                      :icon         => "pficon pficon-edit fa-lg",
                      :name         => "generic_object_policy_choice__generic_object_tag",
                      :onwhen       => "1+",
                      :send_checked => true,
                      :enabled      => false,
                      :title        => "Edit Tags for the selected Generic Object Instances",
                      :text         => "Edit Tags",
                      :url_parms    => "main_div"}

        expect(_toolbar_builder.build_toolbar(toolbar_to_build).first).to include(
          :id    => "generic_object_policy_choice",
          :icon  => "fa fa-shield fa-lg",
          :title => "Policy",
          :text  => "Policy",
          :items => [a_hash_including(items_hash)]
        )
      end
    end

    context "when the toolbar to be built is a generic object toolbar" do
      let(:toolbar_to_build) { 'generic_object_definitions_center_tb' }

      before do
        @record = FactoryBot.create(:generic_object_definition)
        allow(Rbac).to receive(:role_allows?).and_return(true)
      end

      it "includes the button group" do
        expect(_toolbar_builder.build_toolbar(toolbar_to_build).first).to include(
          :id    => "generic_object_definition_configuration",
          :type  => :buttonSelect,
          :icon  => "fa fa-cog fa-lg",
          :title => "Configuration",
          :text  => "Configuration"
        )
      end
      it "includes the correct button items in the show screen" do
        items = _toolbar_builder.build_toolbar(toolbar_to_build).first[:items]

        expect(items[0]).to include(
          :id      => "generic_object_definition_configuration__generic_object_definition_new",
          :type    => :button,
          :title   => "Add a new Generic Object Class",
          :text    => "Add a new Generic Object Class",
          :onwhen  => nil,
          :enabled => true,
        )
        expect(items[1]).to include(
          :id    => "generic_object_definition_configuration__generic_object_definition_edit",
          :type  => :button,
          :icon  => "pficon pficon-edit fa-lg",
          :title => "Edit selected Generic Object Class",
          :text  => "Edit selected Generic Object Class",
        )
        expect(items[2]).to include(
          :id      => "generic_object_definition_configuration__generic_object_definition_delete",
          :type    => :button,
          :icon    => "pficon pficon-delete fa-lg",
          :title   => "Remove selected Generic Object Classes from Inventory",
          :text    => "Remove selected Generic Object Classes from Inventory",
          :onwhen  => "1+",
          :enabled => false,
        )
      end
    end
  end
end
