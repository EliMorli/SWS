class ChangeOrder < ApplicationRecord
  STATUSES = %w[draft submitted approved rejected].freeze

  belongs_to :project

  validates :co_number, presence: true, uniqueness: { scope: :project_id }
  validates :title, presence: true
  validates :status, inclusion: { in: STATUSES }

  money_field :amount

  scope :approved, -> { where(status: "approved") }
  scope :pending, -> { where(status: %w[draft submitted]) }

  after_save :update_project_contract, if: -> { saved_change_to_status? && status == "approved" }

  private

  def update_project_contract
    project.recalculate_revised_contract!
  end
end
