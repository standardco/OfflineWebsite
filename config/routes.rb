Rails.application.routes.draw do

  root 'main#index', as: :home

  get 'posts/get_list_of_posts' => 'posts#get_list_of_posts', as: :get_list_of_posts

  if Rails.env.production?
    offline = Rack::Offline.configure :cache_interval => 120 do      
      cache ActionController::Base.helpers.asset_path("application.css")
      cache ActionController::Base.helpers.asset_path("application.js")
      network "/"  
    end
    match "/application.manifest" => offline, via: [:get, :post]
  elsif Rails.env.development?
    offline = Rack::Offline.configure do
      cache ActionController::Base.helpers.asset_path("application.css?body=1")
      cache ActionController::Base.helpers.asset_path("application.js?body=1")
      cache ActionController::Base.helpers.asset_path("main.js?body=1")
      cache ActionController::Base.helpers.asset_path("bootstrap.min.js?body=1")
      cache ActionController::Base.helpers.asset_path("turbolinks.js?body=1")
      cache ActionController::Base.helpers.asset_path("jquery_ujs.js?body=1")
      cache ActionController::Base.helpers.asset_path("jquery.js?body=1")
      cache ActionController::Base.helpers.asset_path("bootstrap.min.css?body=1")
      network "/"
    end
    match "/application.manifest" => offline, via: [:get, :post]
  end

  resources :posts, except: [:index, :show, :new, :edit, :update]

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
