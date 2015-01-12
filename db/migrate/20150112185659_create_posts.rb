class CreatePosts < ActiveRecord::Migration
  def change
    create_table :posts do |t|
      t.string :author
      t.string :location
      t.string :message
      t.string :topic

      t.timestamps
    end
  end
end
