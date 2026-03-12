class Contact < ApplicationRecord
  belongs_to :company

  validates :first_name, :last_name, presence: true

  def full_name
    "#{first_name} #{last_name}"
  end
end
