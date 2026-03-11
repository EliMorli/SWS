class Api::V1::LienReleasesController < ApplicationController
  before_action :set_project, only: [:index, :create]
  before_action :set_lien_release, only: [:show, :update, :destroy, :pdf, :receive]

  def index
    releases = @project.lien_releases.includes(:invoice, :company).order(created_at: :desc)
    render json: releases.map { |lr| lr_data(lr) }
  end

  def show
    render json: lr_data(@lien_release)
  end

  def create
    lr = @project.lien_releases.new(lr_params)
    lr.save!
    render json: lr_data(lr), status: :created
  end

  def update
    @lien_release.update!(lr_params)
    render json: lr_data(@lien_release)
  end

  def destroy
    @lien_release.destroy!
    head :no_content
  end

  def pdf
    render json: { message: "PDF generation endpoint", lien_release_id: @lien_release.id }
  end

  def receive
    @lien_release.update!(status: "received")
    render json: lr_data(@lien_release)
  end

  private

  def set_project
    @project = Project.find(params[:project_id])
  end

  def set_lien_release
    @lien_release = LienRelease.find(params[:id])
  end

  def lr_params
    params.require(:lien_release).permit(
      :invoice_id, :company_id, :release_type, :direction,
      :amount_cents, :through_date, :status, :notes
    )
  end

  def lr_data(lr)
    {
      id: lr.id,
      project_id: lr.project_id,
      invoice_number: lr.invoice&.invoice_number,
      company_name: lr.company&.name,
      release_type: lr.release_type,
      direction: lr.direction,
      amount: lr.amount,
      through_date: lr.through_date,
      status: lr.status,
      signed_date: lr.signed_date,
      notes: lr.notes,
      created_at: lr.created_at
    }
  end
end
