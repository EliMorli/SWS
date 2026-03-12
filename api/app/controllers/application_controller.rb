class ApplicationController < ActionController::API
  include Pundit::Authorization
  include Pagy::Backend

  before_action :authenticate_user!

  rescue_from ActiveRecord::RecordNotFound, with: :not_found
  rescue_from ActiveRecord::RecordInvalid, with: :unprocessable
  rescue_from Pundit::NotAuthorizedError, with: :forbidden

  private

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end

  def unprocessable(exception)
    render json: { error: exception.record.errors.full_messages }, status: :unprocessable_entity
  end

  def forbidden
    render json: { error: "Not authorized" }, status: :forbidden
  end

  def pagy_metadata(pagy)
    {
      page: pagy.page,
      items: pagy.items,
      count: pagy.count,
      pages: pagy.pages
    }
  end
end
