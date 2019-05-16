describe 'travis.yml' do
  it "matches versions and excludes" do
    travis = YAML.safe_load(File.open(ManageIQ::UI::Classic::Engine.root.join('.travis.yml')))

    versions = travis['rvm']
    excludes = travis.dig('matrix', 'exclude').map { |ex| ex['rvm'] }.sort.uniq

    expect(excludes.length).to eq(1)
    expect(versions.first).to eq(excludes.first)
  end
end
