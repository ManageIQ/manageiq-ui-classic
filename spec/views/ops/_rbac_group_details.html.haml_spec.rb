describe 'ops/_rbac_group_details.html.haml' do
  context 'add new group' do
    before do
      miq_server = FactoryBot.create(:miq_server)
      edit = {:new              => {:description => ''},
              :key              => "settings_authentication_edit__#{miq_server.id}",
              :roles            => %w(fred wilma),
              :projects_tenants => [["projects", %w(foo bar)]]}
      view.instance_variable_set(:@edit, edit)
      @group = FactoryBot.create(:miq_group, :description => 'flintstones')
      allow(view).to receive(:current_tenant).and_return(Tenant.seed)
      allow(view).to receive(:session).and_return(:assigned_filters => [])
      FactoryBot.create(:classification, :name => 'folder_selected', :show => true)

      sb = {
        :trees                 => {},
        :active_rbac_group_tab => 'rbac_customer_tags',
      }
      view.instance_variable_set(:@sb, sb)

      @ems_azure_network = FactoryBot.create(:ems_azure_network)
      @hac_tree = TreeBuilderBelongsToHac.new(:hac_tree,
                                              sb,
                                              true,
                                              :edit           => nil,
                                              :group          => @group,
                                              :selected_nodes => {})
      @vat_tree = TreeBuilderBelongsToVat.new(:vat_tree,
                                              sb,
                                              true,
                                              :edit           => nil,
                                              :group          => @group,
                                              :selected_nodes => {})
    end

    context 'choosing Role from the drop down while adding Group' do
      before { view.instance_variable_set(:@edit, :new => {}, :roles => {'<Choose a Role>' => nil}, :projects_tenants => []) }

      it 'disables Choose a Role option' do
        render :partial => 'ops/rbac_group_details'
        expect(rendered).to include('<option selected="selected" disabled="disabled" value="">&lt;Choose a Role&gt;</option>')
      end
    end
  end
end
