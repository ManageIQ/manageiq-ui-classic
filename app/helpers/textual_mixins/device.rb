module TextualMixins
  Device = Struct.new(:name, :description, :units, :icon) do
    def description_value(record)
      method = description
      self.description = if record.hardware.respond_to?(method)
                           value = record.hardware.send(method).to_s
                           value += " #{units}" if value.present? && units
                           value
                         end
    end
  end
end
