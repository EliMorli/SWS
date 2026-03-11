Rails.application.routes.draw do
  devise_for :users, path: "auth", path_names: {
    sign_in: "login",
    sign_out: "logout",
    registration: "signup"
  }, controllers: {
    sessions: "api/v1/sessions",
    registrations: "api/v1/registrations"
  }

  namespace :api do
    namespace :v1 do
      # Dashboard
      get "dashboard", to: "dashboard#index"

      # Projects
      resources :projects do
        member do
          get :dashboard
        end
        resources :invoices, shallow: true do
          member do
            get :pdf
            post :submit
            post :record_payment
          end
        end
        resources :change_orders, shallow: true do
          member do
            post :submit
            post :approve
          end
        end
        resources :lien_releases, shallow: true do
          member do
            get :pdf
            post :receive
          end
        end
        resources :project_phases, shallow: true, path: "phases"
        resources :cost_entries, shallow: true, path: "costs"
      end

      # Companies & Contacts
      resources :companies do
        resources :contacts, shallow: true
      end

      # Insurance
      resources :insurance_policies, path: "insurance" do
        member do
          post :generate_coi
        end
      end

      # Documents
      resources :documents, only: [:index, :create, :show, :destroy] do
        member do
          get :url
        end
        collection do
          get :search
        end
      end

      # Users
      resources :users, only: [:index, :show, :update]
    end
  end

  # Health check
  get "up", to: proc { [200, {}, ["OK"]] }
end
