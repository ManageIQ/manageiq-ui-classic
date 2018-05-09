describe OpsController do
  before(:each) do
    EvmSpecHelper.local_miq_server
    MiqRegion.seed
    MiqProductFeature.seed
    stub_admin

    controller.instance_variable_set(:@sb, {})
    allow(controller).to receive(:replace_right_cell)
    allow(controller).to receive(:load_edit).and_return(true)
    allow(controller).to receive(:render_flash)
    allow(controller).to receive(:get_node_info)
  end

  def new_user_edit(data)
    controller.rbac_user_add  # set up @edit for new user

    edit = controller.instance_variable_get(:@edit)
    edit[:new] = data
    controller.instance_variable_set(:@edit, edit)
  end

  context 'bz#1562828 - set record data before calling record.valid?' do
    let(:group) { FactoryGirl.create(:miq_group) }

    it "calls both record.valid? and rbac_user_set_record_vars or neither" do
      new_user_edit(
        :name => 'Full name',
        :userid => 'username',
        :group => group.id.to_s,
        :password => "foo",
        :verify => "bar",
      )

      user = User.new
      allow(User).to receive(:new).and_return(user)

      done_valid = false
      allow(user).to receive(:valid?) {
        done_valid = true
      }

      done_set = false
      allow(controller).to receive(:rbac_user_set_record_vars) {
        done_set = true
      }

      controller.send(:rbac_edit_save_or_add, 'user')

      expect(done_valid).to eq(done_set)
    end

    it "displays both validation failures from rails and from rbac_user_validate? at the same time" do
      new_user_edit(
        :name => '',  # fails user.valid?
        :userid => 'username',
        :group => group.id.to_s,
        :password => "foo", # fails rbac_user_validate
        :verify => "bar",
      )

      controller.send(:rbac_edit_save_or_add, 'user')

      messages = controller.instance_variable_get(:@flash_array).pluck(:message)
      expect(messages).to include(match(/password/i))
      expect(messages).to include(match(/name/i))
    end
  end

end
