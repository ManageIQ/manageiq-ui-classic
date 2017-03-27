module Quadicons
  def self.for(record, context)
    klass_for(record).new(record, context)
  end

  def self.klass_for(record)
    name = record.kind_of?(ApplicationRecord) ? record.class.base_class : record.class
    "Quadicons::#{name}Quadicon".safe_constantize
  end
end
