class CreateInvoices < ActiveRecord::Migration[7.1]
  def change
    create_table :invoices, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true, type: :uuid
      t.string :invoice_number
      t.integer :pay_app_number
      t.date :period_from
      t.date :period_to
      t.date :invoice_date

      # AIA G702 fields (all in cents)
      t.bigint :original_contract_cents, default: 0
      t.bigint :change_order_total_cents, default: 0
      t.bigint :contract_total_cents, default: 0
      t.bigint :completed_previous_cents, default: 0
      t.bigint :completed_this_period_cents, default: 0
      t.bigint :materials_stored_cents, default: 0
      t.bigint :total_completed_cents, default: 0
      t.bigint :retention_held_cents, default: 0
      t.bigint :total_earned_less_retention_cents, default: 0
      t.bigint :less_previous_certificates_cents, default: 0
      t.bigint :current_payment_due_cents, default: 0

      # Payment tracking
      t.bigint :amount_paid_cents, default: 0
      t.date :paid_date
      t.string :check_number

      t.string :status, null: false, default: "draft"  # draft, submitted, approved, paid, partial, disputed
      t.datetime :submitted_at
      t.text :notes

      t.timestamps
    end

    add_index :invoices, :invoice_number, unique: true
    add_index :invoices, :status
    add_index :invoices, [:project_id, :pay_app_number], unique: true
  end
end
