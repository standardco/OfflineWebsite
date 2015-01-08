class MainController < ApplicationController

  def index
    
  end

  def new_user
    
  end

  def application
    
  end

  def create_user
    UsersController.create(params)
    respond_to do |format|
      format.html { redirect_to home_path }
    end
  end
  
end
