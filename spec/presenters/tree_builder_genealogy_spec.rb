describe TreeBuilderGenealogy do
  let(:vm_without_kid) { FactoryBot.create(:vm) }
  let(:kid) { FactoryBot.create(:vm) }
  let(:vm_with_kid) do
    vm = FactoryBot.create(:vm)
    vm.add_child(kid)
    vm
  end
  let(:record) do
    vm = FactoryBot.create(:vm)
    vm.add_child(vm_with_kid)
    vm.add_child(vm_without_kid)
    vm
  end

  subject do
    described_class.new(:genealogy_tree, {}, true, :root => record)
  end

  describe '#tree_init_options' do
    it 'sets tree options correctly' do
      expect(subject.send(:tree_init_options)).to eq(
        :full_ids        => true,
        :checkboxes      => true,
        :open_all        => true,
        :silent_activate => true,
        :click_url       => "/vm/genealogy_tree_selected/",
        :onclick         => "miqOnClickGeneric",
        :oncheck         => "miqOnCheckGenealogy",
        :check_url       => "/vm/set_checked_items/"
      )
    end
  end

  describe '#set_locals_for_render' do
    it 'sets locals for render correctly' do
      expect(subject.send(:set_locals_for_render)).to include(:click_url => "/vm/genealogy_tree_selected/",
                                                              :onclick   => "miqOnClickGeneric",
                                                              :oncheck   => "miqOnCheckGenealogy",
                                                              :check_url => "/vm/set_checked_items/")
    end
  end

  describe '#root_options' do
    it 'sets root to empty one' do
      expect(subject.send(:root_options)).to eq(:text           => record.name,
                                                :tooltip        => "VM: %{name} (Click to view)" % {:name => record.name},
                                                :icon           => QuadiconHelper.machine_state(record.normalized_state)[:fonticon],
                                                :iconBackground => QuadiconHelper.machine_state(record.normalized_state)[:background])
    end
  end

  describe '#x_get_tree_roots' do
    it 'returns tree roots correctly' do
      expect(subject.send(:x_get_tree_roots, false)).to include(vm_with_kid, vm_without_kid)
      expect(subject.send(:x_get_tree_roots, true)).to eq(2)
    end
  end

  describe '#x_get_vm_or_template_kids' do
    it 'returns children for vm with children' do
      expect(subject.send(:x_get_vm_or_template_kids, vm_with_kid, false)).to include(kid)
      expect(subject.send(:x_get_vm_or_template_kids, vm_with_kid, true)).to eq(1)
    end

    it 'returns empty array for vm without children' do
      expect(subject.send(:x_get_vm_or_template_kids, vm_without_kid, false)).to eq([])
      expect(subject.send(:x_get_vm_or_template_kids, vm_without_kid, true)).to eq(0)
    end
  end
end
