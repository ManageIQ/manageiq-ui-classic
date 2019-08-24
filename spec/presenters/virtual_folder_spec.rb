describe VirtualFolder do
  # This ID has to be unique to not break other tests as we delete it
  let(:folder_id) { "foo#{rand(512)}" }
  after { VirtualFolder.delete(folder_id) }

  describe '.new' do
    subject { VirtualFolder.new(folder_id, "bar") }

    context "no folders have been instantiated" do
      it "creates a new VirtualFolder object" do
        expect(subject).to be_an_instance_of(VirtualFolder)
      end
    end

    context "folder with the same ID already exists" do
      let!(:vf) { VirtualFolder.new(folder_id, "bar") }

      it "returns the already existing VirtualFolder" do
        expect(subject).to be(vf)
      end
    end
  end
end
