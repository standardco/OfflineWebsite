class UsersController < ApplicationController
  before_action :set_user, only: [:show, :edit, :update, :destroy]

  def get_user_list
    users = User.all
    respond_to do |format|
      format.js { render :json => { :users => users } } 
    end
  end

  # GET /users
  # GET /users.json
  def index
    @users = User.all
  end

  # GET /users/1
  # GET /users/1.json
  def show
  end

  # GET /users/new
  def new
    @user = User.new
  end

  # GET /users/1/edit
  def edit
  end

  # POST /users
  # POST /users.json
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

  # PATCH/PUT /users/1
  # PATCH/PUT /users/1.json
  def update
    respond_to do |format|
      if @user.update(user_params)
        format.html { redirect_to @user, notice: 'User was successfully updated.' }
        format.json { render :show, status: :ok, location: @user }
      else
        format.html { render :edit }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /users/1
  # DELETE /users/1.json
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
