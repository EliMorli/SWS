class CostEntry < ApplicationRecord
  CATEGORIES = %w[material labor_own labor_sub equipment scaffold overhead].freeze

  belongs_to :project
  belongs_to :project_phase, optional: true

  validates :category, inclusion: { in: CATEGORIES }
  validates :entry_date, presence: true

  money_field :amount

  scope :by_category, ->(cat) { where(category: cat) }
end
