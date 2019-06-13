describe ReportHelper do
  describe '#cb_entities_by_provider_id' do
    let(:project) { FactoryBot.create(:container_project) }
    let(:image) { FactoryBot.create(:container_image) }
    let(:provider) do
      FactoryBot.build(:ems_kubernetes).tap do |e|
        e.container_projects = [project]
        e.container_images = [image]
        e.save!
      end
    end

    it 'returns list of container_projects' do
      expect(helper.cb_entities_by_provider_id(provider.id, 'ContainerProject')).to eq([[project.name, project.id]])
    end

    it 'returns list of container_images' do
      expect(helper.cb_entities_by_provider_id(provider.id, 'ContainerImage')).to eq([[image.name, image.id]])
    end
  end
end
