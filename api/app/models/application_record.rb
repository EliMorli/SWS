class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  # All monetary values stored in cents
  def self.money_field(*fields)
    fields.each do |field|
      cents_field = :"#{field}_cents"

      define_method(field) do
        (send(cents_field) || 0) / 100.0
      end

      define_method(:"#{field}=") do |value|
        send(:"#{cents_field}=", (value.to_f * 100).round)
      end
    end
  end
end
