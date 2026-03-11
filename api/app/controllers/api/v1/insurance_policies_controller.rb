class Api::V1::InsurancePoliciesController < ApplicationController
  before_action :set_policy, only: [:show, :update, :destroy, :generate_coi]

  def index
    policies = InsurancePolicy.includes(:company).order(:expiry_date)
    render json: policies.map { |p| policy_data(p) }
  end

  def show
    render json: policy_data(@policy)
  end

  def create
    policy = InsurancePolicy.new(policy_params)
    policy.save!
    render json: policy_data(policy), status: :created
  end

  def update
    @policy.update!(policy_params)
    render json: policy_data(@policy)
  end

  def destroy
    @policy.destroy!
    head :no_content
  end

  def generate_coi
    render json: { message: "COI generation endpoint", policy_id: @policy.id }
  end

  private

  def set_policy
    @policy = InsurancePolicy.find(params[:id])
  end

  def policy_params
    params.require(:insurance_policy).permit(
      :company_id, :policy_type, :policy_number, :carrier,
      :effective_date, :expiry_date, :coverage_amount_cents, :status, :notes
    )
  end

  def policy_data(p)
    {
      id: p.id,
      company_name: p.company.name,
      policy_type: p.policy_type,
      policy_number: p.policy_number,
      carrier: p.carrier,
      effective_date: p.effective_date,
      expiry_date: p.expiry_date,
      coverage_amount: p.coverage_amount,
      status: p.status,
      days_until_expiry: p.days_until_expiry,
      expiring_soon: p.expiring_soon?
    }
  end
end
