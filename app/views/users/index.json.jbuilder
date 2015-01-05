json.array!(@users) do |user|
  json.extract! user, :id, :name, :age, :date_of_birth, :height
  json.url user_url(user, format: :json)
end
