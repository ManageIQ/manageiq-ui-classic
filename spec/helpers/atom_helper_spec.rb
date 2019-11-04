describe ExpAtomHelper do
  describe '#display_filter_details_for' do
    let(:has_many_tag_col) do
      ['Vm.Service.Users.MiqTemplates : My Company Tag clientes', 'Vm.service.user.miq_templates.managed-clientes']
    end

    let(:has_many_field_col) do
      ['Vm.Service.User.Miq Templates : Last Analysis Time', 'Vm.service.user.miq_templates-last_scan_attempt_on']
    end

    let(:cols) do
      [
        has_many_tag_col,
        has_many_field_col,
        ['Vm.Storage.Disks : My Company Tag Quota - Max  Storage', 'Vm.storage.managed-quota_max_storage'],
        ['Vm.Hardware : Hardware Guest OS', 'Vm.hardware-guest_os']
      ]
    end

    it 'is filtering tags with has many relations' do
      filtered_cols = described_class.display_filter_details_for(MiqExpression::Tag, cols)
      expect(filtered_cols).to match_array([has_many_tag_col])
    end

    it 'is filtering fields with has many relations' do
      filtered_cols = described_class.display_filter_details_for(MiqExpression::Field, cols)
      expect(filtered_cols).to match_array([has_many_field_col])
    end
  end
end
