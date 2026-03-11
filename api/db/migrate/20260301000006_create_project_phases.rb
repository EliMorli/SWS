class CreateProjectPhases < ActiveRecord::Migration[7.1]
  def change
    create_table :project_phases, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true, type: :uuid
      t.string :name, null: false   # Lath, Scratch, Brown, Color
      t.integer :sort_order, default: 0
      t.decimal :billing_pct, precision: 5, scale: 2  # 35%, 20%, 25%, 20%
      t.decimal :completion_pct, precision: 5, scale: 2, default: 0
      t.string :status, default: "pending"  # pending, in_progress, complete
      t.date :started_at
      t.date :completed_at

      t.timestamps
    end
  end
end
