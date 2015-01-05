class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :name
      t.integer :age
      t.datetime :date_of_birth
      t.float :height

      t.timestamps
    end
  end
end
