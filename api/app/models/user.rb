class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :trackable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  ROLES = %w[owner admin pm field_super].freeze

  validates :first_name, :last_name, presence: true
  validates :role, inclusion: { in: ROLES }

  scope :active, -> { where(active: true) }

  def full_name
    "#{first_name} #{last_name}"
  end

  def owner?
    role == "owner"
  end

  def admin?
    role.in?(%w[owner admin])
  end

  def pm?
    role.in?(%w[owner admin pm])
  end
end
