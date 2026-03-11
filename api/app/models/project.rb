class Project < ApplicationRecord
  STATUSES = %w[active complete on_hold warranty].freeze

  belongs_to :gc_company, class_name: "Company", optional: true
  belongs_to :owner_company, class_name: "Company", optional: true
  belongs_to :architect_company, class_name: "Company", optional: true

  has_many :invoices, dependent: :destroy
  has_many :change_orders, dependent: :destroy
  has_many :lien_releases, dependent: :destroy
  has_many :project_phases, -> { order(:sort_order) }, dependent: :destroy
  has_many :cost_entries, dependent: :destroy
  has_many :documents, dependent: :nullify

  validates :name, presence: true
  validates :status, inclusion: { in: STATUSES }

  money_field :original_contract, :revised_contract, :total_billed, :total_paid

  scope :active, -> { where(status: "active") }

  def total_area_sqyds
    (total_wall_sqyds || 0) + (total_ceiling_sqyds || 0)
  end

  def outstanding_cents
    total_billed_cents - total_paid_cents
  end

  def outstanding
    outstanding_cents / 100.0
  end

  def retention_held_cents
    (total_billed_cents * (retention_pct / 100.0)).round
  end

  def retention_held
    retention_held_cents / 100.0
  end

  def approved_co_total_cents
    change_orders.where(status: "approved").sum(:amount_cents)
  end

  def recalculate_revised_contract!
    update!(revised_contract_cents: original_contract_cents + approved_co_total_cents)
  end
end
