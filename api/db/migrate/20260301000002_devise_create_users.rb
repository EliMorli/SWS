class DeviseCreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users, id: :uuid do |t|
      # Devise
      t.string :email, null: false, default: ""
      t.string :encrypted_password, null: false, default: ""
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :remember_created_at
      t.integer :sign_in_count, default: 0, null: false
      t.datetime :current_sign_in_at
      t.datetime :last_sign_in_at
      t.string :current_sign_in_ip
      t.string :last_sign_in_ip

      # Profile
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :phone
      t.string :role, null: false, default: "field_super"
      t.boolean :active, default: true

      # JWT revocation
      t.string :jti, null: false

      t.timestamps null: false
    end

    add_index :users, :email, unique: true
    add_index :users, :reset_password_token, unique: true
    add_index :users, :jti, unique: true
  end
end
