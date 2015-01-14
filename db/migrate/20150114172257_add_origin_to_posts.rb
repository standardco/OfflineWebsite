class AddOriginToPosts < ActiveRecord::Migration
  def change
    add_column :posts, :origin, :string
  end
end
