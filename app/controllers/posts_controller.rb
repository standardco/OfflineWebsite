class PostsController < ApplicationController
  before_action :set_post, only: [:destroy]

  def get_list_of_posts
    posts = Post.all
    respond_to do |format|
      format.js { render :json => { :posts => posts } } 
    end

  end

  # POST /posts
  # POST /posts.json
  def create
    post = Post.new
    post.author = params[:author]
    post.location = params[:location]
    post.message = params[:message]
    post.topic = params[:topic]
    post.save
    respond_to do |format|
      format.js { render :json => { :new_post => post } } 
    end
  end

  # DELETE /posts/1
  # DELETE /posts/1.json
  def destroy
    post = Post.find(params[:id])
    post.destroy
    respond_to do |format|
      format.js { render :json => { :deleted_post => post } }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_post
      @post = Post.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def post_params
      params.require(:post).permit(:author, :location, :message, :topic)
    end
end
