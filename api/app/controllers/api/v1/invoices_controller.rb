class Api::V1::InvoicesController < ApplicationController
  before_action :set_project, only: [:index, :create]
  before_action :set_invoice, only: [:show, :update, :destroy, :pdf, :submit, :record_payment]

  def index
    invoices = @project.invoices.order(pay_app_number: :desc)
    render json: invoices.map { |i| invoice_data(i) }
  end

  def show
    render json: invoice_data(@invoice)
  end

  def create
    invoice = @project.invoices.new(invoice_params)
    invoice.save!
    render json: invoice_data(invoice), status: :created
  end

  def update
    @invoice.update!(invoice_params)
    render json: invoice_data(@invoice)
  end

  def destroy
    @invoice.destroy!
    head :no_content
  end

  def pdf
    # Placeholder - will generate AIA G702/G703 PDF
    render json: { message: "PDF generation endpoint", invoice_id: @invoice.id }
  end

  def submit
    @invoice.update!(status: "submitted", submitted_at: Time.current)
    render json: invoice_data(@invoice)
  end

  def record_payment
    @invoice.update!(
      amount_paid_cents: params[:amount_cents],
      paid_date: params[:paid_date],
      check_number: params[:check_number],
      status: params[:amount_cents].to_i >= @invoice.current_payment_due_cents ? "paid" : "partial"
    )

    # Update project totals
    project = @invoice.project
    project.update!(total_paid_cents: project.invoices.sum(:amount_paid_cents))

    render json: invoice_data(@invoice)
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def set_invoice
    @invoice = Invoice.find(params[:id])
  end

  def invoice_params
    params.require(:invoice).permit(
      :invoice_number, :pay_app_number, :period_from, :period_to, :invoice_date,
      :original_contract_cents, :change_order_total_cents, :contract_total_cents,
      :completed_previous_cents, :completed_this_period_cents, :materials_stored_cents,
      :total_completed_cents, :retention_held_cents, :total_earned_less_retention_cents,
      :less_previous_certificates_cents, :current_payment_due_cents, :notes
    )
  end

  def invoice_data(i)
    {
      id: i.id,
      project_id: i.project_id,
      invoice_number: i.invoice_number,
      pay_app_number: i.pay_app_number,
      period_from: i.period_from,
      period_to: i.period_to,
      invoice_date: i.invoice_date,
      original_contract: i.original_contract,
      change_order_total: i.change_order_total,
      contract_total: i.contract_total,
      completed_previous: i.completed_previous,
      completed_this_period: i.completed_this_period,
      materials_stored: i.materials_stored,
      total_completed: i.total_completed,
      retention_held: i.retention_held,
      total_earned_less_retention: i.total_earned_less_retention,
      less_previous_certificates: i.less_previous_certificates,
      current_payment_due: i.current_payment_due,
      amount_paid: i.amount_paid,
      paid_date: i.paid_date,
      check_number: i.check_number,
      status: i.status,
      days_outstanding: i.days_outstanding,
      overdue: i.overdue?,
      submitted_at: i.submitted_at,
      notes: i.notes
    }
  end
end
