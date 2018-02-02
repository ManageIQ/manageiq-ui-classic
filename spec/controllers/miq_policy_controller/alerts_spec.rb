describe MiqPolicyController do
  context "::Alerts" do
    describe '#alert_delete' do
      before do
        login_as FactoryGirl.create(:user, :features => "alert_delete")
      end

      let(:alert) { FactoryGirl.create(:miq_alert, :read_only => readonly) }

      context 'read only alert' do
        let(:readonly) { true }

        it 'renders a flash message' do
          controller.params[:id] = alert.id
          controller.instance_variable_set(:@sb, {})
          expect(controller).to receive(:x_node)
          expect(controller).to receive(:get_node_info)
          expect(controller).to receive(:replace_right_cell)
          expect(controller).not_to receive(:process_alerts)
          controller.send(:alert_delete)
        end
      end
    end

    context "alert edit" do
      before do
        login_as FactoryGirl.create(:user, :features => "alert_admin")
      end

      before :each do
        @miq_alert = FactoryGirl.create(:miq_alert)
        controller.instance_variable_set(:@sb,
                                         :trees       => {:alert_tree => {:active_node => "al-#{@miq_alert.id}"}},
                                         :active_tree => :alert_tree
                                        )
      end

      context "#alert_build_edit_screen" do
        it "it should skip id when copying all attributes of an existing alert" do
          controller.instance_variable_set(:@_params, :id => @miq_alert.id, :copy => "copy")
          controller.send(:alert_build_edit_screen)
          expect(assigns(:alert).id).to eq(nil)
        end

        it "it should select correct record when editing an existing alert" do
          controller.instance_variable_set(:@_params, :id => @miq_alert.id)
          controller.send(:alert_build_edit_screen)
          expect(assigns(:alert).id).to eq(@miq_alert.id)
        end
      end

      context "#alert_field_changed" do
        before :each do
          controller.params = {:id => 0, :exp_name => ""}
          session[:edit] = {:key => "alert_edit__0", :new => {}}
          allow(controller).to receive(:send_button_changes).and_return(nil)
          allow(controller).to receive(:build_snmp_options).and_return(nil)
        end

        it "does not reset repeat_time for most inputs" do
          expect(controller).to receive(:apply_default_repeat_time?).and_call_original
          expect(controller).not_to receive(:alert_default_repeat_time)
          controller.send(:alert_field_changed)
          expect(session[:edit][:new]).not_to include(:repeat_time)
        end

        it "resets repeat_time to defult for dwh events" do
          session[:edit][:new] = {:eval_method => 'dwh_generic'}
          expect(controller).to receive(:apply_default_repeat_time?).and_call_original
          expect(controller).to receive(:alert_default_repeat_time).and_call_original
          controller.send(:alert_field_changed)
          expect(session[:edit][:new]).to include(:repeat_time)
        end

        it "resets repeat_time to defult for hourly performance" do
          session[:edit][:new] = {:eval_method => 'hourly_performance'}
          expect(controller).to receive(:apply_default_repeat_time?).and_call_original
          expect(controller).to receive(:alert_default_repeat_time).and_call_original
          controller.send(:alert_field_changed)
          expect(session[:edit][:new]).to include(:repeat_time)
        end
      end

      context "#alert_edit_cancel" do
        before :each do
          allow(controller).to receive(:replace_right_cell).and_return(true)
        end

        it "it should correctly cancel edit screen of existing alert" do
          session[:edit] = {:alert_id => @miq_alert.id}
          controller.send(:alert_edit_cancel)
          expect(assigns(:flash_array).first[:message]).to match(/Edit of Alert \".+\" was cancelled/)
        end

        it "it should correctly cancel edit screen of new alert" do
          session[:edit] = {:alert_id => nil}
          controller.send(:alert_edit_cancel)
          expect(assigns(:flash_array).first[:message]).to include('Add of new Alert was cancelled')
        end
      end
    end

    context 'test click on toolbar button' do
      before do
        EvmSpecHelper.local_miq_server
        login_as FactoryGirl.create(:user, :features => %w(alert_edit alert_profile_assign alert_delete alert_copy alert_profile_new))
        #login_as FactoryGirl.create(:user, :features => "alert_admin")
        @miq_alert = FactoryGirl.create(:miq_alert)
        allow(controller).to receive(:x_active_tree).and_return(:alert_tree)
        controller.instance_variable_set(:@sb,
                                         :trees       => {:alert_tree => {:active_node => "al-#{@miq_alert.id}"}},
                                         :active_tree => :alert_tree,
                                        )
      end

      let(:alert) { FactoryGirl.create(:miq_alert, :read_only => false) }

      it "alert edit" do
        post :x_button, :pressed => 'alert_edit', :id => alert.id
        expect(response.status).to eq(200)
      end

      it "alert copy" do
        post :x_button, :pressed => 'alert_copy', :id => alert.id
        expect(response.status).to eq(200)
      end

      it "alert new" do
        post :x_button, :pressed => 'alert_profile_new'
        expect(response.status).to eq(200)
      end

      it "tree select" do
        post :tree_select, :id => "al-#{@miq_alert.id}"
        expect(response.status).to eq(200)
        expect(response).to render_template(:partial => 'miq_policy/_alert_details')
      end
    end
  end
end
