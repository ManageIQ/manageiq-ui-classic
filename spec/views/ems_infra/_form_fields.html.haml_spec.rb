describe "ems_infra/form_fields" do
  let(:partial) { |example| example.example_group.top_level_description }

  context "rendering fields in ems_infra new/edit form" do
    before do
      @edit = {:new => {:emstype => "vm_ware"}}
    end

    it "displays Host Name" do
      render :partial => partial, :locals => {:url => ""}
      expect(rendered).to match(/Hostname/)
    end

    it "doesn't display IP Address" do
      render :partial => partial, :locals => {:url => ""}
      expect(rendered).not_to start_with('IP Address')
    end
  end
end
