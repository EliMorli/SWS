class CreateInsurancePolicies < ActiveRecord::Migration[7.1]
  def change
    create_table :insurance_policies, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.string :policy_type, null: false  # general_liability, workers_comp, auto, ocip
      t.string :policy_number
      t.string :carrier
      t.date :effective_date
      t.date :expiry_date
      t.bigint :coverage_amount_cents, default: 0
      t.string :status, default: "active"  # active, expiring_soon, expired, renewed
      t.text :notes

      t.timestamps
    end

    add_index :insurance_policies, :expiry_date
    add_index :insurance_policies, :status
  end
end
