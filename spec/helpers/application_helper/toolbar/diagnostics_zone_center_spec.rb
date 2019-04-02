describe ApplicationHelper::Toolbar::MiqAeDomainCenter do
  describe "definition of class" do
    it "contains the server delete button" do
      diagnostics_zone_center = Kernel.const_get("ApplicationHelper::Toolbar::DiagnosticsZoneCenter")
      buttons = diagnostics_zone_center.definition["ldap_domain_vmdb"].buttons
      button_names = []
      buttons.each do |button|
        button_names += button[:items].pluck(:id) if button[:items]
      end
      expect(button_names).to include("zone_delete_server")
    end
  end
end
