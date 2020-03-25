describe ConfigurationManagerController, "::AdvancedSearch" do
  let(:expr) { ApplicationController::Filter::Expression.new("=" => exp, :token => 1) }
  let(:exp) { {:field => "Some_field", :value => "123"} }

  describe '#adv_search_button_saveid' do
    before do
      stub_user(:features => :all)
      controller.instance_variable_set(:@edit, :new => {:expression => {"=" => exp}}, :new_search_name => 'filter', :expression => expr)
      controller.instance_variable_set(:@expkey, :expression)
    end

    subject { controller.instance_variable_get(:@edit)[:expression] }

    it 'sets only @edit[@expkey][:exp_last_loaded]' do
      controller.send(:adv_search_button_saveid)
      expect(subject[:selected]).to be_nil
      expect(subject[:exp_last_loaded]).to include(:name => "user_#{session[:userid]}_filter", :description => 'filter', :typ => 'user')
    end
  end
end

describe StorageController, "::AdvancedSearch" do
  describe '#adv_search_build' do
    let(:edit) { nil }
    let(:model) { "Storage" }
    let(:s) { {} }
    let(:sandbox) { {} }

    before do
      allow(controller).to receive(:exp_build_table).and_call_original
      allow(controller).to receive(:session).and_return(s)

      controller.instance_variable_set(:@edit, edit)
      controller.instance_variable_set(:@expkey, {})
      controller.instance_variable_set(:@sb, sandbox)
    end

    subject { controller.instance_variable_get(:@edit)[controller.instance_variable_get(:@expkey)][:exp_table] }

    context 'when session[:adv_search] is set, after using Advanced Search' do
      let(:expr) { ApplicationController::Filter::Expression.new.tap { |e| e.expression = {"???" => "???"} } }
      let(:s) { {:adv_search => {model => {:expression => expr}}} }

      context 'tagging action' do
        let(:edit) { {:new => {}} }
        let(:sandbox) { {:action => "tag"} }

        it 'sets @edit[@expkey] properly' do
          controller.send(:adv_search_build, model)
          expect(subject).not_to be_nil
        end
      end

      context 'not tagging action' do
        it 'sets @edit[@expkey] properly' do
          controller.send(:adv_search_build, model)
          expect(subject).not_to be_nil
        end
      end
    end
  end
end

describe VmOrTemplateController, "::AdvancedSearch" do
  before { stub_user(:features => :all) }

  describe "#adv_search_redraw_left_div" do
    before do
      allow(controller).to receive(:adv_search_redraw_listnav_and_main)
      controller.instance_variable_set(:@edit, :in_explorer => true)
      controller.instance_variable_set(:@sb, sb)
    end

    context 'Templates & Images accordion' do
      let(:sb) { {:active_tree => :templates_images_filter_tree} }

      it 'calls build_accordions_and_trees method when saving a filter' do
        expect(controller).to receive(:build_accordions_and_trees)
        controller.send(:adv_search_redraw_left_div)
      end

      it 'sets @explorer to true' do
        controller.send(:adv_search_redraw_left_div)
        expect(controller.instance_variable_get(:@explorer)).to be(true)
      end
    end
  end
end

describe AvailabilityZoneController, "::AdvancedSearch" do
  let(:expr) { ApplicationController::Filter::Expression.new("=" => exp, :token => 1) }
  let(:exp) { {:field => "Some_field", :value => "123"} }

  describe '#adv_search_button_saveid' do
    before do
      stub_user(:features => :all)
      controller.instance_variable_set(:@edit, :new => {:expression => {"=" => exp}}, :new_search_name => 'filter', :expression => expr)
      controller.instance_variable_set(:@expkey, :expression)
    end

    subject { controller.instance_variable_get(:@edit)[:expression] }

    it 'sets only @edit[@expkey][:exp_last_loaded]' do
      controller.send(:adv_search_button_saveid)
      expect(subject[:selected]).to be_nil
      expect(subject[:exp_last_loaded]).to include(:name => "user_#{session[:userid]}_filter", :description => 'filter', :typ => 'user')
    end
  end
end
