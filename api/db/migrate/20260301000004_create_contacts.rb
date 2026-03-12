class CreateContacts < ActiveRecord::Migration[7.1]
  def change
    create_table :contacts, id: :uuid do |t|
      t.references :company, null: false, foreign_key: true, type: :uuid
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :title
      t.string :email
      t.string :phone
      t.string :mobile
      t.boolean :primary, default: false
      t.text :notes

      t.timestamps
    end
  end
end
