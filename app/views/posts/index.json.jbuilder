json.array!(@posts) do |post|
  json.extract! post, :id, :author, :location, :message, :topic
  json.url post_url(post, format: :json)
end
