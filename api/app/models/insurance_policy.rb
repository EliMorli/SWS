class InsurancePolicy < ApplicationRecord
  TYPES = %w[general_liability workers_comp auto ocip].freeze
  STATUSES = %w[active expiring_soon expired renewed].freeze

  belongs_to :company

  validates :policy_type, inclusion: { in: TYPES }
  validates :status, inclusion: { in: STATUSES }

  money_field :coverage_amount

  scope :active, -> { where(status: %w[active expiring_soon]) }
  scope :expiring_within, ->(days) { where("expiry_date <= ?", days.days.from_now).where("expiry_date > ?", Date.current) }

  def days_until_expiry
    return -1 unless expiry_date
    (expiry_date - Date.current).to_i
  end

  def expiring_soon?
    days_until_expiry.between?(0, 60)
  end
end
