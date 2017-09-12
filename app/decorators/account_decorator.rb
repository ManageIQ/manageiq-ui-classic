class AccountDecorator < MiqDecorator
  def self.fonticon
    'pficon pficon-user'
  end

  def fonticon
    accttype == 'group' ? 'ff ff-group' : super
  end
end
