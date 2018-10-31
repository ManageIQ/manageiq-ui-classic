describe MiqAeCustomizationController do
  context "::Dialogs" do
    context "#dialog_delete" do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryGirl.create(:user, :features => "dialog_delete")
        MiqProductFeature.seed
        allow(controller).to receive(:check_privileges).and_return(true)
      end

      it "flash message displays Dialog Label being deleted" do
        dialog = FactoryGirl.create(:dialog, :label       => "Test Label",
                                             :description => "Test Description",
                                             :buttons     => "submit,reset,cancel")

        controller.instance_variable_set(:@sb,
                                         :trees       => {
                                           :dlg_tree => {:active_node => dialog.id.to_s}
                                         },
                                         :active_tree => :dlg_tree)
        session[:settings] = {:display   => {:locale => 'default'}}

        controller.instance_variable_set(:@settings, :display => {:locale => 'default'})
        allow(controller).to receive(:replace_right_cell)

        # Now delete the Dialog
        controller.instance_variable_set(:@_params, :id => dialog.id)
        controller.send(:dialog_delete)

        # Check for Dialog Label to be part of flash message displayed
        flash_messages = assigns(:flash_array)
        expect(flash_messages.first[:message]).to include("Dialog \"Test Label\": Delete successful")

        expect(controller.send(:flash_errors?)).to be_falsey
      end
    end
  end
end
