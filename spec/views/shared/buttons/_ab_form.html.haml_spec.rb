describe "shared/buttons/_ab_form.html.haml" do
  before do
    set_controller_for_view("miq_ae_customization")
    assign(:sb, :active_tab => "ab_options_tab")
    assign(:edit, :new => {:target_class => "CloudNetwork"})
    assign(:resolve, :target_classes => [
             ["Availability Zone", "AvailabilityZone"],
             ["Cloud Network", "CloudNetwork"],
             ["VM Template and Image", "MiqTemplate"],
             ["VM and Instance", "Vm"]
           ])
    stub_template "shared/buttons/_ab_options_form.html.haml" => ""
    stub_template "shared/buttons/_ab_advanced_form.html.haml" => ""
  end

  describe "Paste button" do
    it "is enabled if the copied target class is the same as the current target class" do
      allow(view).to receive(:session)
        .and_return(:resolve_object => {:new => {:target_class => "CloudNetwork"}})
      render
      expect(rendered).to include("Paste object details for use in a Button.")
    end

    it "is disabled if the copied target class differs from the current target class" do
      allow(view).to receive(:session)
        .and_return(:resolve_object => {:new => {:target_class => "AvailabilityZone"}})
      render
      expect(rendered).to include("Paste is not available, target class differs from the target class of the object copied from the Simulation screen")
    end
  end
end
