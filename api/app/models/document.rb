class Document < ApplicationRecord
  CATEGORIES = %w[contract change_order billing insurance lien_release proposal submittal photo check].freeze

  belongs_to :project, optional: true
  belongs_to :uploaded_by, class_name: "User", optional: true

  validates :file_name, :category, presence: true
  validates :category, inclusion: { in: CATEGORIES }
end
