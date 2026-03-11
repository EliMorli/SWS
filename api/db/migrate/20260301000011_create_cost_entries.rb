class CreateCostEntries < ActiveRecord::Migration[7.1]
  def change
    create_table :cost_entries, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true, type: :uuid
      t.references :project_phase, foreign_key: true, type: :uuid
      t.string :category, null: false  # material, labor_own, labor_sub, equipment, scaffold, overhead
      t.string :description
      t.bigint :amount_cents, null: false, default: 0
      t.date :entry_date, null: false
      t.string :vendor_name
      t.string :reference_number  # PO, invoice #, etc.
      t.text :notes

      t.timestamps
    end

    add_index :cost_entries, :category
    add_index :cost_entries, :entry_date
  end
end
