$(document).on('ready', function() {

  $('.post-submit').on('click', function() {
    var internet  = navigator.onLine,
        postData  = $('#new-post').serializeArray(),
        author    = postData[0].value,
        location  = postData[1].value,
        topic     = postData[2].value,
        message   = postData[3].value;

    if (internet == true) {
      normalSubmit(author, location, topic, message);
    } else {
      addPost(author, location, topic, message);
    }
    document.getElementById('new-post').reset();
  });

  $('.sync-database').on('click', function () {
    var internet  = navigator.onLine,
        notice   = 'Cannot sync databases without an internet connection. Please connect to the internet and try again!';

    if (internet == true) {
      syncDatabase();
    } else {
      flashNotice(notice);
    }
  });

  // Start of database interaction

  const DB_NAME = 'no-internet-prototype';
  const DB_VERSION = 1;
  const DB_STORE_NAME = 'posts';

  var db;

  function openDb() {
    // console.log('openDb...')
    var request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = function(event) {
      // Better use "this" than "req" to get the result to avoid problems with
      // garbage collection.
      // db = request.result;
      db = this.result;
      displayPosts();
      // console.log('openDb is done')
    };

    request.onerror = function(event) {
      console.error("Database error: " + event.target.errorCode);
    };

    request.onupgradeneeded = function(event) {
      var store = event.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    };
  }

  function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }

  function displayPosts() {
    var internet  = navigator.onLine;

    if (internet == true) {
      databasePosts();
    } else {
      webStoredPosts();
    }
  };

  function webStoredPosts(store) {
    $('#user-list').empty();

    if (typeof store == 'undefined') {
      store = getObjectStore(DB_STORE_NAME, 'readonly');
    }

    var request = store.openCursor()

    request.onsuccess = function(event) {
      var cursor = event.target.result;

      if (cursor) {
        var key       = cursor.key,
            author    = cursor.value.author,
            location  = cursor.value.location,
            topic     = cursor.value.topic,
            message   = cursor.value.message;

        appendPost(key, author, location, topic, message);
        cursor.continue();
      } else {
        // No more data entries
      }
    }
  };

  function addPost(author, location, topic, message) {
    var obj     = { author: author, location: location, topic: topic, message: message},
        store   = getObjectStore(DB_STORE_NAME, 'readwrite'),
        request = store.add(obj);

    request.onsuccess = function(event) {
      var notice    = 'Your post has been successfully added to web storage!';
          key       = event.target.result,
          author    = obj.author,
          location  = obj.location,
          topic     = obj.topic,
          message   = obj.message;

      appendPost(key, author, location, topic, message);
      flashNotice(notice);
    };

    request.onerror = function(event) {
      console.error('error');
    };
  };

  function syncDatabase() {
    var req;

    if (typeof store == 'undefined') {
      store = getObjectStore(DB_STORE_NAME, 'readonly');
    }

    var request = db.transaction('posts').objectStore('posts').openCursor()

    request.onsuccess = function(event) {
      var cursor = event.target.result;

      if (cursor) {    
        var author    = cursor.value.author,
            location  = cursor.value.location,
            topic     = cursor.value.topic,
            message   = cursor.value.message;

        normalSubmit(author, location, topic, message);
        deletePost(cursor.key);
        cursor.continue();
      } else {
        // No more data entries
      }
    }
  }
  
  openDb();

});

function normalSubmit(author, location, topic, message) {
  var datastring  = {author: author, location: location, topic: topic, message: message},
      notice     = 'Your post has been successfully added to the database!';

  $.ajax({
      type: 'POST',
      data: datastring,
      dataType: 'json',
      url: '/posts',
        success: function(data) {
          var id        = data.new_post.id,
              author    = data.new_post.author,
              location  = data.new_post.location,
              topic     = data.new_post.topic,
              message   = data.new_post.message;

          appendPost(id, author, location, topic, message);
          flashNotice(notice);
        }
    });
};

function databasePosts() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/posts/get_list_of_posts',
      success: function(data) {
        $.each(data.posts, function () {
          var id        = this.id,
              author    = this.author,
              location  = this.location,
              message   = this.message,
              topic     = this.topic

          appendPost(id, author, location, topic, message);
        });
      }
  });
};

function flashNotice(noticeMessage) {
  var notice       = "";
      notice      +=  '<div class="notice alert alert-warning alert-dismissable fade in" role="alert">',
      notice      +=  ' <button type="button" class="close" data-dismiss="alert" aria-label="Close">',
      notice      +=  '   <span aria-hidden="true">&times;</span>',
      notice      +=  ' </button>',
      notice      +=  ' <p><strong>Notice: </strong>'+noticeMessage+'</p>',
      notice      +=  '</div>';
  $('.notice-box').append(notice);
  // Find a wasy to count notices, then display the number in a badge
};

function appendPost(id, author, location, topic, message) {
  var post  = "";
      post += '<div class="panel panel-default" id="'+id+'">',
      post += '  <div data-toggle="collapse" data-parent="#accordion" href="#collapse'+id+'" aria-expanded="true" aria-controls="collapse'+id+'" class="panel-heading" role="tab" id="heading'+id+'">',
      post += '    <h4>'+topic+'<span class="pull-right text-opac">ID: '+id+'</span></h4>',
      post += '  </div>',
      post += '  <div id="collapse'+id+'" class="panel-collapse collapse in" role="tabpanel" aria-labelledby="heading'+id+'">'
      post += '    <div class="panel-body">',
      post += '      <p>'+message+'</p>',
      post += '      <div class="pull-right">',
      post += '        <p class="text-opac">Author: '+author+'</br>',
      post += '        Location: '+location+'</p>',
      post += '      </div>',
      post += '    </div>',
      post += '  </div>',
      post += '</div>',
  $('#post-container').append(post);
};


        
      
      
        
        
        
        
        
      



