describe ApplicationHelper::Toolbar::Basic do
  describe "extension_classes_filtered" do
    it "filteres toolbar extensions using record_valid? if available" do
 
      # create a Vmdb plugin
      ext_name = 'MyExtension'
      Object.const_set(
        ext_name,
        Class.new(Rails::Engine) do
          def vmdb_plugin?
            true
          end
        end
      )
      # force reload of plugins to catch a new one
      Vmdb::Plugins.send(:instance).instance_eval { @all = nil }

      # create a toolbar under the plugin
      overrides = MyExtension.const_set('ToolbarOverrides', Module.new)
      toolbar_ext_name = 'Basic'
      overrides.const_set(
        toolbar_ext_name,
        Class.new(ApplicationHelper::Toolbar::Override) do
          def self.record_valid?(rec)
            true
          end
        end
      )

      expect(MyExtension::ToolbarOverrides::Basic).to receive(:record_valid?).with(record = 'foobar')
      described_class.definition(record)
    end
  end
end
