require 'ostruct'

describe TreeNode::Node do
  let(:parent) { nil }
  let(:options) { {} }
  subject { described_class.new(object, parent, options, nil) }

  describe '#escape' do
    let(:object) { nil }

    [nil, "", ViewHelper.content_tag(:strong, "x")].each do |string|
      context "input is #{string.inspect}" do
        let(:input) { string }

        it 'returns with the argument without any modification' do
          expect(subject.escape(input)).to eq(input)
        end
      end
    end

    context 'input is unsafe' do
      let(:input) { "<script>alert('hacked');</script>" }

      it 'returns with the escaped argument' do
        expect(subject.escape(input)).not_to eq(input)
        expect(subject.escape(input)).to eq("&lt;script&gt;alert(&#39;hacked&#39;);&lt;/script&gt;")
      end
    end
  end

  describe '#to_h' do
    before { allow(subject).to receive(:image).and_return('') }
    context 'text contains %2f' do
      let(:object) { OpenStruct.new(:name => 'foo %2f bar') }

      it 'does not escape' do
        expect(subject.to_h[:text]).to eq('foo %2f bar')
      end
    end

    context 'text contains /' do
      let(:object) { OpenStruct.new(:name => 'foo / bar') }

      it 'does not escape' do
        expect(subject.to_h[:text]).to eq('foo / bar')
      end
    end

    context 'text contains &nbsp;' do
      let(:object) { OpenStruct.new(:name => 'foo &nbsp; bar') }

      it 'escapes the & to &amp' do
        expect(subject.to_h[:text]).to eq('foo &amp;nbsp; bar')
      end
    end

    context 'text contains script' do
      let(:object) { OpenStruct.new(:name => '<script>alert("Hacked!");</script>') }

      it 'escapes the special characters' do
        expect(subject.to_h[:text]).to eq('&lt;script&gt;alert(&quot;Hacked!&quot;);&lt;/script&gt;')
      end
    end
  end

  describe '#text' do
    let(:object) { OpenStruct.new(:name => 'name') }
    it 'returns with the object name' do
      expect(subject.text).to eq('name')
    end
  end

  describe '#key' do
    context 'object id is nil' do
      let(:object) { OpenStruct.new(:key => nil, :name => 'foo') }
      it 'returns with -name' do
        expect(subject.key).to eq("-#{object.name}")
      end
    end
  end
end
