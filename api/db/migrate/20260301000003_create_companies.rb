class CreateCompanies < ActiveRecord::Migration[7.1]
  def change
    create_table :companies, id: :uuid do |t|
      t.string :name, null: false
      t.string :company_type, null: false  # gc, owner, architect, subcontractor, vendor, self
      t.string :license_number
      t.string :address
      t.string :city
      t.string :state
      t.string :zip
      t.string :phone
      t.string :email
      t.string :website
      t.text :notes
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :companies, :company_type
    add_index :companies, :name
  end
end
