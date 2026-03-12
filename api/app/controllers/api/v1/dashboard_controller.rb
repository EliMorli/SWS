class Api::V1::DashboardController < ApplicationController
  def index
    projects = Project.all
    active_projects = projects.active

    render json: {
      summary: {
        total_projects: projects.count,
        active_projects: active_projects.count,
        total_contract_value: active_projects.sum(:revised_contract_cents) / 100.0,
        total_billed: active_projects.sum(:total_billed_cents) / 100.0,
        total_paid: active_projects.sum(:total_paid_cents) / 100.0,
        total_outstanding: (active_projects.sum(:total_billed_cents) - active_projects.sum(:total_paid_cents)) / 100.0
      },
      recent_invoices: Invoice.includes(:project)
        .order(created_at: :desc)
        .limit(5)
        .map { |inv| invoice_summary(inv) },
      pending_change_orders: ChangeOrder.includes(:project)
        .pending
        .order(created_at: :desc)
        .limit(5)
        .map { |co| co_summary(co) },
      expiring_insurance: InsurancePolicy.expiring_within(60)
        .includes(:company)
        .map { |p| policy_summary(p) },
      overdue_invoices: Invoice.includes(:project)
        .overdue
        .order(:invoice_date)
        .map { |inv| invoice_summary(inv) }
    }
  end

  private

  def invoice_summary(inv)
    {
      id: inv.id,
      invoice_number: inv.invoice_number,
      project_name: inv.project.name,
      current_payment_due: inv.current_payment_due,
      status: inv.status,
      days_outstanding: inv.days_outstanding,
      invoice_date: inv.invoice_date
    }
  end

  def co_summary(co)
    {
      id: co.id,
      co_number: co.co_number,
      title: co.title,
      project_name: co.project.name,
      amount: co.amount,
      status: co.status,
      created_at: co.created_at
    }
  end

  def policy_summary(p)
    {
      id: p.id,
      policy_type: p.policy_type,
      company_name: p.company.name,
      expiry_date: p.expiry_date,
      days_until_expiry: p.days_until_expiry
    }
  end
end
