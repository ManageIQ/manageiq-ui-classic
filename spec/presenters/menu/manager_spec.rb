describe Menu::Manager do
  include Spec::Support::MenuHelper

  before do
    Singleton.__init__(Menu::Manager)
  end

  describe "#initialize" do
    it "loads default menu items" do
      section = Menu::Manager.section(:vi)
      expect(section).to be_truthy
      expect(section.items[0].id).to eq('dashboard')
    end

    it "loads custom menu items" do
      expect(Menu::YamlLoader).to receive(:new).and_call_original
      Menu::Manager.menu
    end
  end

  describe ".menu" do
    it "knows about custom section with items" do
      temp_file  = section_file
      temp_file2 = item_file
      begin
        expect(Dir).to receive(:glob).and_return([temp_file2.path, temp_file.path])

        section = nil
        Menu::Manager.menu.each do |a_section|
          section = a_section if a_section.name == 'Red Hat'
        end
        expect(section).to be_truthy
        expect(section.items.first).to be_truthy
      ensure
        temp_file.unlink
        temp_file2.unlink
      end
    end
  end

  describe ".reload" do
    before do
      stub_settings_merge(:product => {:consumption => nil})
    end

    it "reloads the menu" do
      expect(described_class.item(:cons)).to be_nil

      Settings.product.consumption = true
      described_class.reload

      expect(described_class.item(:cons)).to be_a(Menu::Section)

      Settings.product.consumption = nil
      described_class.reload

      expect(described_class.item(:cons)).to be_nil
    end
  end
end
