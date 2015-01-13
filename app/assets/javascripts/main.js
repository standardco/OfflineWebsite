$(document).on('ready', function() {

  $('.post-submit').on('click', function() {
    var internet  = navigator.onLine,
        postData  = $('#new-post').serializeArray(),
        author    = postData[0].value,
        location  = postData[1].value,
        topic     = postData[2].value,
        message   = postData[3].value;
    if (internet == true) {
      // normalSubmit(author, location, topic, message);
      addPost(author, location, topic, message);
    } else {
      addPost(author, location, topic, message);
    }
    document.getElementById('new-post').reset();
  });

  // $('.user-clear').on('click', function() {
  //   var internet  = navigator.onLine,
  //       message   = '&#39;Clear All Users&#39; is only for offline mode.';
  //   if (internet == true) {
  //     flashNotice(message);
  //   } else {
  //     clearObjectStore();  
  //   }
  // });

  $('.post-delete').on('click', function() {
    var key       = $('#post-key').val(),
        internet  = navigator.onLine;
    if (internet == true) {
      // deleteDbPost(key);
      key = Number(key);
      deletePost(key);
    } else {
      key = Number(key);
      deletePost(key);
    }
    document.getElementById('delete-post').reset();
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

  // function clearObjectStore(store_name) {
  //   var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  //   var request = store.clear();
  //   request.onsuccess = function(event) {
  //     // display some notice
  //     $('#user-list').empty();
  //   };
  //   request.onerror = function (event) {
  //     console.error("clearObjectStore:", event.target.errorCode);
  //     // displayActionFailure(this.error);
  //   };
  // }

  function displayPosts() {
    var internet  = navigator.onLine;
    if (internet == true) {
      // databasePosts();
      webStoredPosts();
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
        appendTable(key, author, location, topic, message);
        cursor.continue();
      } else {
        // console.log("done")
      }
    }
  };

  function addPost(author, location, topic, message) {
    var obj     = { author: author, location: location, topic: topic, message: message},
        store   = getObjectStore(DB_STORE_NAME, 'readwrite'),
        request = store.add(obj);

    request.onsuccess = function(event) {
      // console.log('Insertion in DB successful');
      var notice    = 'Your post has been successfully added to web storage!';
          key       = event.target.result,
          author    = obj.author,
          location  = obj.location,
          topic     = obj.topic,
          message   = obj.message;
      appendTable(key, author, location, topic, message);
      flashNotice(notice);
    };

    request.onerror = function(event) {
      console.error('error');
    };
  };

  function deletePost(key, store) {
    if (typeof store == 'undefined') {
      store = getObjectStore(DB_STORE_NAME, 'readwrite');
    }

    // As per spec http://www.w3.org/TR/IndexedDB/#object-store-deletion-operation
    // the result of the Object Store Deletion Operation algorithm is
    // undefined, so it's not possible to know if some records were actually
    // deleted by looking at the request result.
    var request = store.get(key);
    request.onsuccess = function(event) {
      var record = event.target.result;
      if (typeof record == 'undefined') {
        var notice = 'A post with the given Post ID does not seem to exist! Please try a different one.';
        flashNotice(notice)
        return;
      }
    // Warning: The exact same key used for creation needs to be passed for
    // the deletion. If the key was a Number for creation, then it needs to
    // be a Number for deletion.
      request = store.delete(key);
      request.onsuccess = function(event) {
        var notice = 'The post has been successfully deleted from web storage!';
        $('#'+key).hide();
        flashNotice(notice);
      };
      request.onerror = function (event) {
        console.error("deletePost:", event.target.errorCode);
      };
    };

    request.onerror = function (event) {
      console.error("deletePost:", event.target.errorCode);
      };
  }

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
        // console.log("Done")
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
          appendTable(id, author, location, topic, message);
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
          appendTable(id, author, location, topic, message);
        });
      }
  });
};

function deleteDbPost(id) {
  var datastring  = { ID: id },
      notice     = 'The post has been successfully deleted from the database!';
  $.ajax({
      type: 'DELETE',
      data: datastring,
      dataType: 'json',
      url: '/posts/'+id,
        success: function(data) {
          $('#'+data.deleted_post.id).hide();
          flashNotice(notice);
        }
    });
}

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

function appendTable(id, author, location, topic, message) {
  var user  = "";
      user += '<tr id="'+id+'">',
      user += '  <td>'+id+'</td>',
      user += '  <td>'+author+'</td>',
      user += '  <td>'+location+'</td>',
      user += '  <td>'+topic+'</td>',
      user += '  <td>'+message+'</td>',
      user += '</tr>';
  $('#user-list').append(user);
};



