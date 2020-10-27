describe AnsibleCredentialHelper::TextualSummary do
  include_examples "textual_group_smart_management"
  include_examples "textual_group", "Properties", %i(name type created updated)
  include_examples "textual_group", "Relationships", %i(repositories)

  class TestClass
    API_ATTRIBUTES = [
      {
        :component  => 'text-field',
        :label      => N_('Username'),
        :helperText => N_('Username for this credential'),
        :name       => 'userid',
        :id         => 'userid',
      },
      {
        :component  => 'password-field',
        :label      => N_('Password'),
        :helperText => N_('Password for this credential'),
        :name       => 'password',
        :id         => 'password',
        :type       => 'password',
      },
      {
        :component      => 'password-field',
        :label          => N_('Private key'),
        :helperText     => N_('RSA or DSA private key to be used instead of password'),
        :componentClass => 'textarea',
        :name           => 'ssh_key_data',
        :id             => 'ssh_key_data',
        :type           => 'password',
      },
      {
        :component  => 'password-field',
        :label      => N_('Private key passphrase'),
        :helperText => N_('Passphrase to unlock SSH private key if encrypted'),
        :name       => 'ssh_key_unlock',
        :id         => 'ssh_key_unlock',
        :maxLength  => 1024,
        :type       => 'password',
      },
      {
        :component        => 'select',
        :label            => N_('Privilege Escalation'),
        :helperText       => N_('Privilege escalation method'),
        :name             => 'become_method',
        :id               => 'become_method',
        :type             => 'choice',
        :isClearable      => true,
        :options          => %w[
          sudo
          su
          pbrum
          pfexec
          doas
          dzdo
          pmrun
          runas
          enable
          ksu
          sesu
          machinectl
        ].map { |item| {:label => item, :value => item} },
      },
      {
        :component  => 'text-field',
        :label      => N_('Privilege Escalation Username'),
        :helperText => N_('Privilege escalation username'),
        :name       => 'become_username',
        :id         => 'become_username',
        :maxLength  => 1024,
      },
      {
        :component  => 'password-field',
        :label      => N_('Privilege Escalation Password'),
        :helperText => N_('Password for privilege escalation method'),
        :name       => 'become_password',
        :id         => 'become_password',
        :maxLength  => 1024,
        :type       => 'password',
      },
    ].freeze
  end

  describe "#textual_group_options" do
    before { @record = TestClass.new }

    it "doesn't return options for password types" do
      expect(textual_group_options.items).to match_array(%i[userid become_method become_username])
    end

    context "defines the textual methods" do
      before { textual_group_options }

      include_examples "method_exists", %i[textual_userid textual_become_method textual_become_username]
    end
  end

  describe "#attribute_value (private)" do
    it "returns a sinmple value" do
      rec = { 'thing' => "stuff" }
      expect(send(:attribute_value, 'thing', rec)).to eq("stuff")
    end

    it "returns deeply stored value" do
      rec = { 'foo' => { 'bar' => 'baz' } }
      expect(send(:attribute_value, 'foo.bar', rec)).to eq("baz")
    end

    it "returns nil if a key isn't present" do
      rec = {}
      expect(send(:attribute_value, 'foo.bar', rec)).to be_nil
    end
  end
end
