describe Menu::CustomLoader do
  before do
    Singleton.__init__(Menu::Manager)
    Singleton.__init__(Menu::CustomLoader)
  end

  def register(item)
    engine = Object.new.tap do |engine|
      allow(engine).to receive(:menu).and_return([ item ])
    end

    allow(Vmdb::Plugins).to receive(:all).and_return([ engine ])

    Menu::CustomLoader.unload
    Menu::Manager.instance.send(:initialize)
  end

  context '.register' do
    it 'loads custom menu items' do
      # create custom section with 2 custom items
      register(
        Menu::Section.new(:spike, 'Plugin', 'fa fa-map-pin', [
                            Menu::Item.new('plug1', 'Test', 'miq_report', {:feature => 'miq_report', :any => true}, '/plug'),
                            Menu::Item.new('plug2', 'Demo', 'miq_report', {:feature => 'miq_report', :any => true}, '/demo')
                          ])
      )

      expect(Menu::Manager.item('plug1')).to be
      expect(Menu::Manager.item('plug2')).to be
    end

    it 'loads a custom menu item under an existing section' do
      # create custom item placed in an existing section 'vi' (Overview)
      register(
        Menu::Item.new('plug3', 'Plug Item', 'miq_report', {:feature => 'miq_report', :any => true}, '/demo', :default, :vi)
      )

      item = Menu::Manager.item('plug3')
      expect(item).to be
      expect(item.parent.id).to eq(:vi)
    end

    it 'loads a custom menu section and places it before an existing section' do
      # create custom section and place it before existing section 'compute' (Compute)
      register(
        Menu::Section.new(:spike3, 'Plugin 2', 'fa fa-map-pin', [
                            Menu::Item.new('plug4', 'Demo', 'miq_report', {:feature => 'miq_report', :any => true}, '/demo')
                          ], :default, :compute)
      )

      item = Menu::Manager.item('plug4')
      expect(item).to be

      menu = Menu::Manager.instance.instance_eval { @menu }
      compute_index = menu.find_index { |s| s.id == :compute }

      expect(menu[compute_index - 1].id).to eq(:spike3)
    end

    it 'loads a custom menu section and places it at a given position in inside an existing section' do
      # create custom section and place it inside an existing section 'compute' (Compute), before existing subsection 'clo' (Cloud)
      register(
        Menu::Section.new(:spike3, 'Nested section after', 'fa fa-map-pin', [
                            Menu::Item.new('plug5', 'Test item', 'miq_report', {:feature => 'miq_report', :any => true}, '/demo')
                          ], :default, :clo, :default, nil, :compute)
      )

      item = Menu::Manager.item('plug5')
      expect(item).to be

      compute_section = Menu::Manager.section(:compute)
      spike_index = compute_section.items.find_index { |i| i.id == :spike3 }
      clo_index   = compute_section.items.find_index { |i| i.id == :clo }
      expect(spike_index).to eq(clo_index - 1)
    end
  end
end
