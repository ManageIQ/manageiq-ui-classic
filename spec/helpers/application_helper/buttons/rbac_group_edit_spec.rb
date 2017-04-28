require 'shared/helpers/application_helper/buttons/rbac_group'

describe ApplicationHelper::Button::RbacGroupEdit do
  include_context 'ApplicationHelper::Button::RbacGroup'

  describe '#calculate_properties' do
    before { subject.calculate_properties }

    include_examples 'ApplicationHelper::Button::RbacGroup read-only record with restriction', 'edited'
    include_examples 'ApplicationHelper::Button::RbacGroup writable record'
  end
end
