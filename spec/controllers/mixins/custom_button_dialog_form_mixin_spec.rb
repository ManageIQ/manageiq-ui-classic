class CustomButtonDialogFormMixinTestClass
  attr_accessor :edit
  include Mixins::CustomButtonDialogFormMixin

  def x_active_tree
    "test_active_tree"
  end

  # This is only here for simplicity of testing. Normally this method
  # renders the entire haml template
  def r
    @r ||= proc do |options|
      if options[:partial] == "shared/dialogs/dialog_provision"
        if options[:locals].present? && options[:locals][:force_old_dialog_use].to_s == "false"
          "main_div_with_new_dialog_runner"
        else
          "main_div"
        end
      else
        "form_buttons_div"
      end
    end
  end
end

describe Mixins::CustomButtonDialogFormMixin do
  let(:mixin) { CustomButtonDialogFormMixinTestClass.new }

  describe "#set_custom_button_dialog_presenter" do
    let(:presenter) { instance_double("ExplorerPresenter") }

    before do
      mixin.edit = {:rec_id => 123}
      allow(ExplorerPresenter).to receive(:new).and_return(presenter)
      allow(presenter).to receive(:show).and_return(presenter)
      allow(presenter).to receive(:hide)
      allow(presenter).to receive(:update)
      allow(presenter).to receive(:set_visibility)
      allow(presenter).to receive(:[]=)
    end

    context "when dialog locals are present" do
      context "when force_old_dialog_use is false" do
        let(:options) { {:dialog_locals => {:force_old_dialog_use => false}} }

        it "passes the locals through the render method" do
          allow(presenter).to receive(:update) do |_div, render_method|
            expect(render_method).to eq("main_div_with_new_dialog_runner")
          end
          mixin.set_custom_button_dialog_presenter(options)
        end

        it "does not update the form buttons div and does not show it" do
          mixin.set_custom_button_dialog_presenter(options)
          expect(presenter).not_to have_received(:update).with(:form_buttons_div, instance_of(String)).ordered
          expect(presenter).not_to have_received(:show).with(:form_buttons_div).ordered
        end
      end

      context "when force_old_dialog_use is true" do
        let(:options) { {:dialog_locals => {:force_old_dialog_use => true}} }

        before do
          mixin.set_custom_button_dialog_presenter(options)
        end

        it "updates the main div" do
          expect(presenter).to have_received(:update).with(:main_div, "main_div").ordered
        end

        it "updates the form_buttons_div and shows it" do
          expect(presenter).to have_received(:update).with(:form_buttons_div, "form_buttons_div").ordered
          expect(presenter).to have_received(:show).with(:form_buttons_div).ordered
        end
      end
    end

    context "when dialog locals are not present" do
      let(:options) { {} }

      before do
        mixin.set_custom_button_dialog_presenter(options)
      end

      it "updates the main div" do
        expect(presenter).to have_received(:update).with(:main_div, "main_div").ordered
      end

      it "updates the form_buttons_div and shows it" do
        expect(presenter).to have_received(:update).with(:form_buttons_div, "form_buttons_div").ordered
        expect(presenter).to have_received(:show).with(:form_buttons_div).ordered
      end
    end
  end
end
