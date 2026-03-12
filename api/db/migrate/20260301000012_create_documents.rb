class CreateDocuments < ActiveRecord::Migration[7.1]
  def change
    create_table :documents, id: :uuid do |t|
      t.references :project, foreign_key: true, type: :uuid
      t.references :uploaded_by, foreign_key: { to_table: :users }, type: :uuid
      t.string :category, null: false  # contract, change_order, billing, insurance, lien_release, proposal, submittal, photo, check
      t.string :file_name, null: false
      t.string :content_type
      t.bigint :file_size
      t.string :s3_key
      t.integer :version, default: 1
      t.text :notes

      t.timestamps
    end

    add_index :documents, :category
  end
end
