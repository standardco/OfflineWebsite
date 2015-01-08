task :generate_appcache_file => ['deploy:precompile_assets', 'html5_manifest']

desc "Create html5 manifest.appcache"
task :html5_manifest => :environment do
  puts 'Creating appcache manifest file...'

  File.open("public/manifest.appcache", "w") do |f|
    f.write("CACHE MANIFEST\n")
    f.write("# Version #{Time.now.to_i}\n\n")
    f.write("CACHE:\n")
    assets = Dir.glob(File.join(Rails.root, 'public/assets/**/*'))
    assets.each do |asset|
      if File.extname(asset) != '.gz' && File.extname(asset) != '' && File.extname(asset) != '.json'
        filename_path = /#{Rails.root.to_s}\/public\/(assets\/.*)/.match(File.absolute_path(asset))[1].to_s
        # f.write("assets/#{File.basename(asset)}\n")
        f.write(filename_path.concat("\n"))
      end
    end
    f.write("\nNETWORK:\n")
    f.write("*\n")
    f.write("http://*\n")
    f.write("https://*\n")
  end
  puts 'Done.'
end

namespace :deploy do
  task :precompile_assets do
    require 'fileutils'
    if File.directory?("#{Rails.root.to_s}/public/assets")
      FileUtils.rm_r "#{Rails.root.to_s}/public/assets"
    end

    puts 'Precompiling assets...'
    puts `RAILS_ENV=production bundle exec rake assets:precompile`
    puts 'Done.'
  end
end