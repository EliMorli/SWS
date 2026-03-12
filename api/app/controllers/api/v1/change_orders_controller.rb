class Api::V1::ChangeOrdersController < ApplicationController
  before_action :set_project, only: [:index, :create]
  before_action :set_change_order, only: [:show, :update, :destroy, :submit, :approve]

  def index
    cos = @project.change_orders.order(:co_number)
    render json: cos.map { |co| co_data(co) }
  end

  def show
    render json: co_data(@change_order)
  end

  def create
    co = @project.change_orders.new(co_params)
    co.save!
    render json: co_data(co), status: :created
  end

  def update
    @change_order.update!(co_params)
    render json: co_data(@change_order)
  end

  def destroy
    @change_order.destroy!
    head :no_content
  end

  def submit
    @change_order.update!(status: "submitted", submitted_date: Date.current)
    render json: co_data(@change_order)
  end

  def approve
    @change_order.update!(
      status: "approved",
      approved_date: Date.current,
      approved_by: params[:approved_by]
    )
    render json: co_data(@change_order)
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def set_change_order
    @change_order = ChangeOrder.find(params[:id])
  end

  def co_params
    params.require(:change_order).permit(
      :co_number, :title, :description, :scope_of_work,
      :amount_cents, :notes
    )
  end

  def co_data(co)
    {
      id: co.id,
      project_id: co.project_id,
      co_number: co.co_number,
      title: co.title,
      description: co.description,
      scope_of_work: co.scope_of_work,
      amount: co.amount,
      amount_cents: co.amount_cents,
      status: co.status,
      submitted_date: co.submitted_date,
      approved_date: co.approved_date,
      approved_by: co.approved_by,
      notes: co.notes,
      created_at: co.created_at
    }
  end
end
