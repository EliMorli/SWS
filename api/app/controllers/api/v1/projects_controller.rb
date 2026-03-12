class Api::V1::ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :update, :destroy, :dashboard]

  def index
    projects = Project.includes(:gc_company, :owner_company)
                      .order(updated_at: :desc)

    projects = projects.where(status: params[:status]) if params[:status].present?

    render json: projects.map { |p| project_list_item(p) }
  end

  def show
    render json: project_detail(@project)
  end

  def create
    project = Project.new(project_params)
    project.save!
    render json: project_detail(project), status: :created
  end

  def update
    @project.update!(project_params)
    render json: project_detail(@project)
  end

  def destroy
    @project.destroy!
    head :no_content
  end

  def dashboard
    render json: {
      project: project_detail(@project),
      phases: @project.project_phases.ordered.map { |ph| phase_data(ph) },
      billing_summary: {
        original_contract: @project.original_contract,
        approved_cos: @project.approved_co_total_cents / 100.0,
        revised_contract: @project.revised_contract,
        total_billed: @project.total_billed,
        total_paid: @project.total_paid,
        outstanding: @project.outstanding,
        retention_held: @project.retention_held
      },
      recent_invoices: @project.invoices.order(pay_app_number: :desc).limit(5).map { |i| invoice_item(i) },
      change_orders: @project.change_orders.order(:co_number).map { |co| co_item(co) },
      cost_summary: cost_summary(@project)
    }
  end

  private

  def set_project
    @project = Project.find(params[:id])
  end

  def project_params
    params.require(:project).permit(
      :name, :project_number, :address, :city, :state, :zip,
      :description, :trade, :gc_company_id, :owner_company_id,
      :architect_company_id, :original_contract_cents, :revised_contract_cents,
      :retention_pct, :total_wall_sqyds, :total_ceiling_sqyds,
      :status, :start_date, :substantial_completion_date, :final_completion_date
    )
  end

  def project_list_item(p)
    {
      id: p.id,
      name: p.name,
      project_number: p.project_number,
      address: [p.address, p.city, p.state, p.zip].compact.join(", "),
      gc_name: p.gc_company&.name,
      status: p.status,
      revised_contract: p.revised_contract,
      total_billed: p.total_billed,
      total_paid: p.total_paid,
      outstanding: p.outstanding,
      retention_pct: p.retention_pct
    }
  end

  def project_detail(p)
    project_list_item(p).merge(
      description: p.description,
      trade: p.trade,
      original_contract: p.original_contract,
      owner_name: p.owner_company&.name,
      architect_name: p.architect_company&.name,
      total_wall_sqyds: p.total_wall_sqyds,
      total_ceiling_sqyds: p.total_ceiling_sqyds,
      total_area_sqyds: p.total_area_sqyds,
      start_date: p.start_date,
      created_at: p.created_at
    )
  end

  def phase_data(ph)
    {
      id: ph.id,
      name: ph.name,
      billing_pct: ph.billing_pct,
      completion_pct: ph.completion_pct,
      status: ph.status
    }
  end

  def invoice_item(i)
    {
      id: i.id,
      invoice_number: i.invoice_number,
      pay_app_number: i.pay_app_number,
      current_payment_due: i.current_payment_due,
      status: i.status,
      invoice_date: i.invoice_date
    }
  end

  def co_item(co)
    {
      id: co.id,
      co_number: co.co_number,
      title: co.title,
      amount: co.amount,
      status: co.status
    }
  end

  def cost_summary(project)
    entries = project.cost_entries.group(:category).sum(:amount_cents)
    total = entries.values.sum
    {
      by_category: entries.transform_values { |v| v / 100.0 },
      total: total / 100.0,
      budget: project.revised_contract,
      margin: project.revised_contract_cents > 0 ? ((project.revised_contract_cents - total).to_f / project.revised_contract_cents * 100).round(1) : 0
    }
  end
end
