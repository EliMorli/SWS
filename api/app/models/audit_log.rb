class AuditLog < ApplicationRecord
  belongs_to :user, optional: true

  validates :action, :auditable_type, :auditable_id, presence: true

  scope :recent, -> { order(created_at: :desc).limit(100) }
end
