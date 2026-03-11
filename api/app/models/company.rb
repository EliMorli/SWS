class Company < ApplicationRecord
  TYPES = %w[gc owner architect subcontractor vendor self].freeze

  has_many :contacts, dependent: :destroy
  has_many :insurance_policies, dependent: :destroy
  has_many :lien_releases, dependent: :nullify

  # Reverse associations for projects
  has_many :gc_projects, class_name: "Project", foreign_key: :gc_company_id
  has_many :owned_projects, class_name: "Project", foreign_key: :owner_company_id
  has_many :architect_projects, class_name: "Project", foreign_key: :architect_company_id

  validates :name, presence: true
  validates :company_type, presence: true, inclusion: { in: TYPES }

  scope :active, -> { where(active: true) }
  scope :general_contractors, -> { where(company_type: "gc") }
  scope :subcontractors, -> { where(company_type: "subcontractor") }
  scope :vendors, -> { where(company_type: "vendor") }
end
