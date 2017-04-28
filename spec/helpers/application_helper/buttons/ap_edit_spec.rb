require 'shared/helpers/application_helper/buttons/ap'

describe ApplicationHelper::Button::ApEdit do
  include_context 'ApplicationHelper::Button::Ap'

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    include_examples 'ApplicationHelper::Button::Ap read-only with restriction', 'edited'
    include_examples 'ApplicationHelper::Button::Ap writable'
  end
end
