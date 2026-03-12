class CreateChangeOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :change_orders, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true, type: :uuid
      t.integer :co_number, null: false
      t.string :title, null: false
      t.text :description
      t.text :scope_of_work
      t.bigint :amount_cents, null: false, default: 0

      t.string :status, null: false, default: "draft"  # draft, submitted, approved, rejected
      t.date :submitted_date
      t.date :approved_date
      t.string :approved_by

      t.string :docusign_envelope_id
      t.text :notes

      t.timestamps
    end

    add_index :change_orders, [:project_id, :co_number], unique: true
    add_index :change_orders, :status
  end
end
