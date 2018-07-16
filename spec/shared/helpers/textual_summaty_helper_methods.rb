shared_examples_for 'method_exists' do |methods|
  methods.each do |method|
    describe "##{method}" do
      it "method exists" do
        expect(respond_to?(method)).to be_truthy
      end
    end
  end
end
