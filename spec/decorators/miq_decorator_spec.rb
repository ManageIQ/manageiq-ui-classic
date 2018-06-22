describe MiqDecorator do
  described_class.descendants.each do |klass|
    next if klass == described_class # Skipping MiqDecorator

    # This spec is intended to test the decorators defined in the ui-classic repo
    # Any other decorator coming from e.g. the providers is allowed to inherit indirectly
    next unless File.exist?(ManageIQ::UI::Classic.root.join('app', 'decorators', "#{klass.to_s.underscore}.rb"))

    context "subclass #{klass}" do
      it "is directly inherited from #{described_class}" do
        expect(klass.superclass).to be(described_class)
      end
    end
  end
end
