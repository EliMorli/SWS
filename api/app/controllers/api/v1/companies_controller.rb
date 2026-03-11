class Api::V1::CompaniesController < ApplicationController
  before_action :set_company, only: [:show, :update, :destroy]

  def index
    companies = Company.active.order(:name)
    companies = companies.where(company_type: params[:type]) if params[:type].present?
    render json: companies.map { |c| company_data(c) }
  end

  def show
    render json: company_data(@company)
  end

  def create
    company = Company.new(company_params)
    company.save!
    render json: company_data(company), status: :created
  end

  def update
    @company.update!(company_params)
    render json: company_data(@company)
  end

  def destroy
    @company.destroy!
    head :no_content
  end

  private

  def set_company
    @company = Company.find(params[:id])
  end

  def company_params
    params.require(:company).permit(
      :name, :company_type, :license_number, :address, :city,
      :state, :zip, :phone, :email, :website, :notes
    )
  end

  def company_data(c)
    {
      id: c.id,
      name: c.name,
      company_type: c.company_type,
      license_number: c.license_number,
      address: [c.address, c.city, c.state, c.zip].compact.join(", "),
      phone: c.phone,
      email: c.email,
      active: c.active
    }
  end
end
