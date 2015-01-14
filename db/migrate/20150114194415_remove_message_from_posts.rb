class RemoveMessageFromPosts < ActiveRecord::Migration
  def change
    remove_column :posts, :message, :string
    add_column :posts, :message, :text
  end
end
