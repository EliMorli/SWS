class Invoice < ApplicationRecord
  STATUSES = %w[draft submitted approved paid partial disputed].freeze

  belongs_to :project
  has_many :lien_releases, dependent: :nullify

  validates :status, inclusion: { in: STATUSES }
  validates :pay_app_number, uniqueness: { scope: :project_id }, allow_nil: true

  money_field :original_contract, :change_order_total, :contract_total,
              :completed_previous, :completed_this_period, :materials_stored,
              :total_completed, :retention_held, :total_earned_less_retention,
              :less_previous_certificates, :current_payment_due, :amount_paid

  scope :by_status, ->(status) { where(status: status) }
  scope :overdue, -> { where(status: %w[submitted approved]).where("invoice_date < ?", 30.days.ago) }

  def overdue?
    status.in?(%w[submitted approved]) && invoice_date && invoice_date < 30.days.ago
  end

  def days_outstanding
    return 0 unless invoice_date
    (Date.current - invoice_date).to_i
  end
end
