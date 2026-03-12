class Api::V1::RegistrationsController < Devise::RegistrationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        user: {
          id: resource.id,
          email: resource.email,
          first_name: resource.first_name,
          last_name: resource.last_name,
          role: resource.role
        },
        message: "Signed up successfully."
      }, status: :ok
    else
      render json: {
        message: "Sign up failed.",
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  end

  def sign_up_params
    params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name, :phone, :role)
  end
end
