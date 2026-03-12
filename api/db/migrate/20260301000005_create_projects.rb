class CreateProjects < ActiveRecord::Migration[7.1]
  def change
    create_table :projects, id: :uuid do |t|
      t.string :name, null: false
      t.string :project_number
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.text :description
      t.string :trade, default: "CSI 09-200 Lath & Plaster"

      # Relationships
      t.references :gc_company, foreign_key: { to_table: :companies }, type: :uuid
      t.references :owner_company, foreign_key: { to_table: :companies }, type: :uuid
      t.references :architect_company, foreign_key: { to_table: :companies }, type: :uuid

      # Financials (stored in cents)
      t.bigint :original_contract_cents, default: 0
      t.bigint :revised_contract_cents, default: 0
      t.decimal :retention_pct, precision: 5, scale: 2, default: 10.0
      t.bigint :total_billed_cents, default: 0
      t.bigint :total_paid_cents, default: 0

      # Areas
      t.decimal :total_wall_sqyds, precision: 12, scale: 2, default: 0
      t.decimal :total_ceiling_sqyds, precision: 12, scale: 2, default: 0

      # Status
      t.string :status, null: false, default: "active"  # active, complete, on_hold, warranty
      t.date :start_date
      t.date :substantial_completion_date
      t.date :final_completion_date

      t.timestamps
    end

    add_index :projects, :status
    add_index :projects, :project_number, unique: true
  end
end
