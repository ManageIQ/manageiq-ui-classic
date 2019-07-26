describe 'travis.yml' do
  it "matches versions and excludes" do
    travis = YAML.safe_load(File.open(ManageIQ::UI::Classic::Engine.root.join('.travis.yml')))

    versions = travis['rvm']

    if versions.length > 1
      excludes = travis.dig('matrix', 'exclude').map { |ex| ex['rvm'] }.sort.uniq
      expect(excludes.length).to eq(versions.length - 1)
      expect(versions[0..-2]).to eq(excludes)
    end
  end
end
