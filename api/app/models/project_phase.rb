class ProjectPhase < ApplicationRecord
  STATUSES = %w[pending in_progress complete].freeze

  belongs_to :project
  has_many :cost_entries, dependent: :nullify

  validates :name, presence: true
  validates :status, inclusion: { in: STATUSES }
  validates :completion_pct, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }
  validates :billing_pct, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 100 }, allow_nil: true

  scope :ordered, -> { order(:sort_order) }
end
