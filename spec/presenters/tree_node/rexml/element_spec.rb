describe TreeNode::REXML::Element do
  subject { described_class.new(object, nil, nil) }
  let(:object) { MiqXml.load(xml).root }

  context 'element is MiqAeObject' do
    let(:xml) { '<MiqAeObject namespace="foo" class="bar" instance="baz"></MiqAeObject>' }

    describe '#text' do
      it { expect(subject.text).to eq('foo / bar / baz') }
    end

    describe '#image' do
      it { expect(subject.image).to eq('svg/vendor-redhat.svg') }
    end

    include_examples 'TreeNode::Node#tooltip same as #text'
  end

  context 'element is MiqAeAttribute' do
    let(:xml) { '<MiqAeAttribute name="foo"></MiqAeAttribute>' }

    describe '#text' do
      it { expect(subject.text).to eq('foo') }
    end

    describe '#icon' do
      it { expect(subject.icon).to eq('ff ff-attribute') }
    end

    include_examples 'TreeNode::Node#tooltip same as #text'
  end

  context 'element is MiqAeService' do
    context 'Network' do
      let(:xml) { '<MiqAeServiceNetwork></MiqAeServiceNetwork>' }

      describe '#text' do
        it { expect(subject.text).to eq('MiqAeServiceNetwork') }
      end

      describe '#icon' do
        it { expect(subject.icon).to eq('pficon pficon-network') }
      end

      include_examples 'TreeNode::Node#tooltip same as #text'
    end

    context 'WindowsImage' do
      let(:xml) { '<MiqAeServiceWindowsImage></MiqAeServiceWindowsImage>' }

      describe '#text' do
        it { expect(subject.text).to eq('MiqAeServiceWindowsImage') }
      end

      describe '#image' do
        it { expect(subject.image).to eq('svg/os-windows_generic.svg') }
      end

      include_examples 'TreeNode::Node#tooltip same as #text'
    end

    context 'GuestApplication' do
      let(:xml) { '<MiqAeServiceGuestApplication></MiqAeServiceGuestApplication>' }

      describe '#text' do
        it { expect(subject.text).to eq('MiqAeServiceGuestApplication') }
      end

      describe '#icon' do
        it { expect(subject.icon).to eq('ff ff-software-package') }
      end

      include_examples 'TreeNode::Node#tooltip same as #text'
    end
  end

  context 'element is a string' do
    let(:xml) { '<string>foo</string>' }

    describe '#text' do
      it { expect(subject.text).to eq('foo') }
    end

    describe '#icon' do
      it { expect(subject.icon).to eq('ff ff-string') }
    end

    include_examples 'TreeNode::Node#tooltip same as #text'
  end
end
