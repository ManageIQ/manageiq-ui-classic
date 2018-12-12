describe TreeBuilderTimelines do
  let!(:report) do
    FactoryBot.create(:miq_report,
                       :name          => 'name',
                       :timeline      => 'something',
                       :template_type => 'report',
                       :rpt_group     => 'First - Second')
  end

  subject { TreeBuilderTimelines.new(:timelines_tree, :timelines, {}, true, :text => 'Menu') }
  let(:first_level) { subject.send(:x_get_tree_roots, false, nil) }

  describe '#tree_init_options' do
    it 'sets init options correctly' do
      tree_options = subject.send(:tree_init_options, :timelines)
      expect(tree_options).to eq(:lazy => false, :add_root => false)
    end
  end

  describe '#root_options' do
    it 'sets root to nothing' do
      roots = subject.send(:root_options)
      expect(roots).to eq({})
    end
  end

  describe '#x_get_tree_roots' do
    it 'sets first level nodes correctly' do
      first_level_node = first_level.first
      expect(first_level_node[:text]).to eq('First')
      expect(first_level_node[:icon]).to eq('pficon pficon-folder-close')
      expect(first_level_node[:tip]).to eq('First')
      expect(first_level_node[:selectable]).to be false
      expect(first_level_node[:expand]).to be true
    end
  end

  describe '#x_get_tree_hash_kids' do
    let(:second_level) { subject.send(:x_get_tree_hash_kids, first_level.first, false) }

    context 'for second level' do
      it 'sets nodes correctly' do
        second_level_node = second_level.first
        expect(second_level_node[:text]).to eq('Second')
        expect(second_level_node[:icon]).to eq('pficon pficon-folder-close')
        expect(second_level_node[:tip]).to eq('Group: Second')
        expect(second_level_node[:expand]).to be false
        expect(second_level_node[:selectable]).to be false
      end
    end

    context 'for third level' do
      let(:third_level) { subject.send(:x_get_tree_hash_kids, second_level.first, false) }

      it 'sets nodes correctly' do
        expect(third_level.length).to eq(1)
        expect(third_level).to eq([report])
      end
    end
  end
end
