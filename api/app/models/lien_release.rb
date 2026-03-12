class LienRelease < ApplicationRecord
  RELEASE_TYPES = %w[conditional_waiver unconditional_waiver].freeze
  DIRECTIONS = %w[outgoing incoming].freeze
  STATUSES = %w[pending sent signed received].freeze

  belongs_to :project
  belongs_to :invoice, optional: true
  belongs_to :company, optional: true

  validates :release_type, inclusion: { in: RELEASE_TYPES }
  validates :direction, inclusion: { in: DIRECTIONS }
  validates :status, inclusion: { in: STATUSES }

  money_field :amount

  scope :outgoing, -> { where(direction: "outgoing") }
  scope :incoming, -> { where(direction: "incoming") }
  scope :pending, -> { where(status: %w[pending sent]) }
end
