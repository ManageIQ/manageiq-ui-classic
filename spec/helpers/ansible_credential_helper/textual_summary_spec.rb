describe AnsibleCredentialHelper::TextualSummary do
  include_examples "textual_group_smart_management"
  include_examples "textual_group", "Properties", %i(name type created updated)
  include_examples "textual_group", "Relationships", %i(repositories)

  class TestClass
    API_ATTRIBUTES = {
      :userid          => {
        :label     => N_('Username'),
        :help_text => N_('Username for this credential')
      },
      :password        => {
        :type      => :password,
        :label     => N_('Password'),
        :help_text => N_('Password for this credential')
      },
      :ssh_key_data    => {
        :type      => :password,
        :multiline => true,
        :label     => N_('Private key'),
        :help_text => N_('RSA or DSA private key to be used instead of password')
      },
      :become_method   => {
        :type      => :choice,
        :label     => N_('Privilege Escalation'),
        :help_text => N_('Privilege escalation method'),
        :choices   => ['', 'sudo', 'su', 'pbrun', 'pfexec']
      },
      :become_username => {
        :type       => :string,
        :label      => N_('Privilege Escalation Username'),
        :help_text  => N_('Privilege escalation username'),
        :max_length => 1024
      }
    }.freeze
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
    it "returns an attributes value" do
      rec = double(:thing => "stuff", :options => nil)
      expect(send(:attribute_value, :thing, rec)).to eq("stuff")
    end

    it "returns an options value" do
      rec = double(:options => {:thing => "stuff"})
      expect(send(:attribute_value, :thing, rec)).to eq("stuff")
    end

    it "returns nil if a key isn't present" do
      rec = double(:secret => "password", :options => nil)
      expect(send(:attribute_value, :thing, rec)).to be_nil
    end
  end
end
