describe Menu::SettingsLoader do
  include Spec::Support::MenuHelper
  it "loads custom menu items" do
    ::Settings.ui.custom_menu = settings_custom_items
    sections, items = described_class.load

    expect(sections.length).to be(0)
    expect(items.length).to be(2)
  end
end
