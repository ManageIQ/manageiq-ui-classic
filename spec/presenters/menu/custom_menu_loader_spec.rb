describe Menu::YamlLoader do
  include Spec::Support::MenuHelper

  it "loads custom menu section" do
    temp_file = section_file
    begin
      expect(Dir).to receive(:glob).and_return([temp_file.path])

      sections, items = described_class.load
      expect(sections.length).to be(1)
      expect(items.length).to be(0)

      section = sections.first
      expect(section.name).to eq('Red Hat')
    ensure
      temp_file.unlink
    end
  end

  it "loads custom menu item" do
    temp_file  = section_file
    temp_file2 = item_file
    begin
      expect(Dir).to receive(:glob).and_return([temp_file2.path, temp_file.path])

      sections, items = described_class.load
      expect(sections.length).to be(1)
      expect(items.length).to be(1)

      item = items.first
      expect(item.name).to eq('courses')
    ensure
      temp_file.unlink
      temp_file2.unlink
    end
  end
end
