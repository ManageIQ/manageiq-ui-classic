describe MiqAeClassHelper do
  let(:dummy_class) { Class.new.include(MiqAeClassHelper).new }

  describe "#git_enabled?" do
    context "when the record is of class MiqAeDomain" do
      let(:record) { MiqAeDomain.new }

      before do
        allow(record).to receive(:git_enabled?).and_return(git_enabled?)
      end

      context "when the record is git enabled" do
        let(:git_enabled?) { true }

        it "returns true" do
          expect(dummy_class.git_enabled?(record)).to eq(true)
        end
      end

      context "when the record is not git enabled" do
        let(:git_enabled?) { false }

        it "returns false" do
          expect(dummy_class.git_enabled?(record)).to eq(false)
        end
      end
    end

    context "when the record is not of class MiqAeDomain" do
      let(:record) { nil }

      it "returns false" do
        expect(dummy_class.git_enabled?(record)).to eq(false)
      end
    end
  end

  describe '#ae_field_fonticon' do
    (MiqAeField::AVAILABLE_DATATYPES | MiqAeField::AVAILABLE_AETYPES).each do |field|
      context "field is #{field}" do
        it 'returns with not nil' do
          expect(ae_field_fonticon(field)).not_to be_nil
        end
      end
    end
  end

  describe '#row_data' do
    context 'with simple string value' do
      it 'returns correct hash structure' do
        result = dummy_class.send(:row_data, 'Test Label', 'Test Value')
        expect(result).to eq({:cells => {:label => 'Test Label', :value => 'Test Value', :color => ""}})
      end
    end

    context 'with array value' do
      it 'joins array elements with comma and space' do
        result = dummy_class.send(:row_data, 'Test Label', ['Value1', 'Value2'])
        expect(result).to eq({:cells => {:label => 'Test Label', :value => 'Value1, Value2', :color => ""}})
      end
    end

    context 'with style parameter' do
      it 'includes color in the result' do
        result = dummy_class.send(:row_data, 'Test Label', 'Test Value', 'red')
        expect(result).to eq({:cells => {:label => 'Test Label', :value => 'Test Value', :color => 'red'}})
      end
    end

    context 'with icon parameter set to true' do
      it 'uses icon key instead of value key' do
        result = dummy_class.send(:row_data, 'Test Label', 'icon-name', 'blue', :icon => true)
        expect(result).to eq({:cells => {:label => 'Test Label', :icon => 'icon-name', :color => 'blue'}})
      end

      it 'handles array values with icon parameter' do
        result = dummy_class.send(:row_data, 'Test Label', ['icon1', 'icon2'], '', :icon => true)
        expect(result).to eq({:cells => {:label => 'Test Label', :icon => 'icon1, icon2', :color => ''}})
      end
    end

    context 'with icon parameter set to false' do
      it 'uses value key' do
        result = dummy_class.send(:row_data, 'Test Label', 'Test Value', '', :icon => false)
        expect(result).to eq({:cells => {:label => 'Test Label', :value => 'Test Value', :color => ''}})
      end
    end
  end
end
