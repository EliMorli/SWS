class CreateLienReleases < ActiveRecord::Migration[7.1]
  def change
    create_table :lien_releases, id: :uuid do |t|
      t.references :project, null: false, foreign_key: true, type: :uuid
      t.references :invoice, foreign_key: true, type: :uuid
      t.references :company, foreign_key: true, type: :uuid  # releasing party

      t.string :release_type, null: false  # conditional_waiver, unconditional_waiver
      t.string :direction, null: false     # outgoing (SWS to GC), incoming (sub/vendor to SWS)
      t.bigint :amount_cents, default: 0
      t.date :through_date
      t.string :status, default: "pending"  # pending, sent, signed, received

      t.string :docusign_envelope_id
      t.date :signed_date
      t.text :notes

      t.timestamps
    end

    add_index :lien_releases, :release_type
    add_index :lien_releases, :status
  end
end
