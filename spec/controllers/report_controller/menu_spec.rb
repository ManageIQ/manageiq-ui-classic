describe ReportController do
  describe "#edit_folder" do
    before do
      controller.instance_variable_set(:@grid_folders, nil)
      session[:node_selected] = 'foo__bar'
      controller.instance_variable_set(:@edit, :new           => [['bar', ['baz', 'quux']], # match
                                                                  ['foo', ['frob']]], # no match
                                               :group_reports => [])
    end

    it "sets @folders to be of proper length" do
      controller.send(:edit_folder)
      expect(controller.instance_variable_get(:@folders).length).to eq(2)
    end

    it "sets @grid_folders" do
      expect(controller).to receive(:menu_folders).and_return({})
      controller.send(:edit_folder)
      expect(controller.instance_variable_get(:@grid_folders)).to_not be_nil
    end
  end

  describe "#menu_folders" do
    it "can handle nil" do
      controller.instance_variable_set(:@edit, :user_typ => true)
      out = controller.send(:menu_folders, [nil, 'foo'])

      expect(out.size).to eq(1)
      expect(out.first[:text]).to eq('foo')
    end

    it "prepends i_ to id for admins" do
      controller.instance_variable_set(:@edit, :user_typ => true)
      arr = %w(foo bar)
      out = controller.send(:menu_folders, arr)

      expect(out).to eq(arr.map do |s|
        {:id => "i_#{s}", :text => s}
      end)
    end

    it "prepends __|i_ when no reports" do
      controller.instance_variable_set(:@edit, :group_reports => [])
      arr = %w(foo bar)
      out = controller.send(:menu_folders, arr)

      expect(out).to eq(arr.map do |s|
        {:id => "__|i_#{s}", :text => s}
      end)
    end

    it "handles reports for b__" do
      session[:node_selected] = 'b__*'
      controller.instance_variable_set(:@edit, :group_reports => ['A/*'])
      out = controller.send(:menu_folders, %w(A B))

      expect(out).to eq([{:id => "i_A", :text => "A"},
                         {:id => "|-|i_B", :text => "B"}])
    end

    it "handles reports for non-b__" do
      session[:node_selected] = '*__*'
      controller.instance_variable_set(:@edit, :group_reports => ['*/A'])
      out = controller.send(:menu_folders, %w(A B))

      expect(out).to eq([{:id => "i_A", :text => "A"},
                         {:id => "|-|i_B", :text => "B"}])
    end
  end

  describe "#edit_reports" do
    before do
      MiqUserRole.seed

      role = MiqUserRole.find_by(:name => "EvmRole-administrator")
      current_group = FactoryBot.create(:miq_group, :miq_user_role => role, :description => "Current Group")
      @current_user = FactoryBot.create(:user, :userid => "Current User", :miq_groups => [current_group],
                                         :email => "current_user@test.com")

      login_as @current_user
      FactoryBot.create(:miq_report, :name => "VM 1", :rpt_group => "Configuration Management - Folder Foo", :rpt_type => "Default")
      FactoryBot.create(:miq_report, :name => "Provisioning 1", :rpt_group => "Provisioning - Folder Bar", :rpt_type => "Default")
      FactoryBot.create(:miq_report, :name => "Provisioning 2", :rpt_group => "Provisioning - Folder Bar", :rpt_type => "Default")
      FactoryBot.create(:miq_report, :name => "custom report 1", :rpt_group => "Custom", :rpt_type => "Custom")
      FactoryBot.create(:miq_report, :name => "custom report 2", :rpt_group => "Custom", :rpt_type => "Custom")

      controller.instance_variable_set(:@edit,
                                       :new => [
                                         ["Configuration Management", [["Folder Foo", ["VM 1"]]]],
                                         ["Provisioning", [["Folder Bar", ["Provisioning 1"]]]]
                                       ])
      session[:node_selected] = 'foo__bar'
      allow(controller).to receive(:replace_right_cell)
    end

    it "returns custom reports in available_reports array along with other default available reports" do
      controller.send(:edit_reports)
      expect(assigns(:available_reports)).to include("custom report 1", "custom report 2", "Provisioning 2")
    end
  end
end
