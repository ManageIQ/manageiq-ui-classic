describe "ops/_zone_form.html.haml" do
  before do
    assign(:sb, :active_tab => "settings_evm_servers")
    @selected_zone = FactoryBot.create(:zone, :name => 'One Zone', :description => " One Description", :settings =>
                                                {:proxy_server_ip => '1.2.3.4', :concurrent_vm_scans => 0})
    @servers = []
  end

  context "zone selected" do
    before do
      @zone = FactoryBot.create(:zone)
      @edit = {:zone_id               => nil,
               :new                   => {:name                => nil,
                                          :description         => nil,
                                          :proxy_server_ip     => nil,
                                          :concurrent_vm_scans => '0',
                                          :userid              => nil,
                                          :password            => nil,
                                          :verify              => nil},
               :current               => {:name                => nil,
                                          :description         => nil,
                                          :proxy_server_ip     => nil,
                                          :concurrent_vm_scans => '0',
                                          :userid              => nil,
                                          :password            => nil,
                                          :verify              => nil},
               :key                   => 'zone_edit__new',
               :default_verify_status => true}
    end
    it "should show zone information" do
      render :partial => "ops/zone_form"
      expect(response).to include("<div id='flash_msg_div' style='display: none'>\n</div>")
    end
  end
end
