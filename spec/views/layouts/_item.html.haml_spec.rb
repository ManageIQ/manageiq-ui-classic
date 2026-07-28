describe "layouts/_item.html.haml" do
  it "check if correct items are being rendered for filesystem" do
    set_controller_for_view("host")
    fs = FactoryBot.create(:filesystem, :contents => "contents")
    assign(:view, FactoryBot.create(:miq_report_filesystem))
    assign(:item, fs)
    assign(:lastaction, 'filesystems')
    render :template => "layouts/_item"

    expect(rendered).to have_selector('label', :text => 'Name')
    expect(rendered).to have_selector('label', :text => 'File Name')
    expect(rendered).to have_selector('label', :text => 'File Version')
    expect(rendered).to have_selector('label', :text => 'Size')
    expect(rendered).to have_selector('label', :text => 'Contents Available')
    expect(rendered).to have_selector('label', :text => 'Permissions')
    expect(rendered).to have_selector('label', :text => 'Collected On')
    expect(rendered).to have_selector('label', :text => 'Contents')
    expect(rendered).to have_selector('a', :text => 'Download')
  end
end
