class UsersController < ApplicationController
  before_action :set_user, only: [:destroy]

  def get_user_list
    users = User.all
    respond_to do |format|
      format.js { render :json => { :users => users } } 
    end
  end

  def create
    user = User.new
    user.name = params[:NAME]
    user.age = params[:AGE]
    user.date_of_birth = params[:DATE_OF_BIRTH]
    user.height = params[:HEIGHT]
    user.save
    respond_to do |format|
      format.js { render :json => { :new_user => user } } 
    end
  end

  def destroy
    user = User.find(params[:id])
    user.destroy
    respond_to do |format|
      format.js { render :json => { :deleted_user => user } }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_user
      @user = User.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def user_params
      params.require(:user).permit(:name, :age, :date_of_birth, :height)
    end
end
