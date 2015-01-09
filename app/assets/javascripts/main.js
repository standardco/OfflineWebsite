$(document).on('ready', function() {

  $('.user-submit').on('click', function() {
    var internet  = navigator.onLine,
        userData  = $('#new-user').serializeArray(),
        name      = userData[0].value,
        age       = userData[1].value,
        dob       = userData[2].value,
        height    = userData[3].value;
    console.log(userData);
    if (internet == true) {
      // normalSubmit(name, age, dob, height);
      // Used during testing to avoid having to 
      // switch internet on and off repeatedly
      addUser(name, age, dob, height);
    } else {
      addUser(name, age, dob, height);
    }
    document.getElementById('new-user').reset();
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

  $('.user-delete').on('click', function() {
    var key       = $('#user-key').val(),
        internet  = navigator.onLine;
    if (internet == true) {
      console.log('internet')
      deleteDbUser(key);
    } else {
      console.log('no internet')
      key = Number(key);
      deleteUser(key);
    }
    document.getElementById('delete-user').reset();
  });

  $('.sync-database').on('click', function () {
    console.log('Sync');
    var internet  = navigator.onLine,
        message   = 'Cannot sync databases without an internet connection. Please connect to the internet and try again!';
    if (internet == true) {
      syncDatabase();
    } else {
      flashNotice(message);
    }
  });

  // Start of database interaction

  const DB_NAME = 'no-internet-prototype';
  const DB_VERSION = 3;
  const DB_STORE_NAME = 'users';

  var db;

  function openDb() {
    console.log('openDb...')
    var request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onsuccess = function(event) {
      // Better use "this" than "req" to get the result to avoid problems with
      // garbage collection.
      // db = req.result;
      db = this.result;
      displayUsers();
      console.log('openDb is done')
    };

    request.onerror = function(event) {
      console.error("Database error: " + event.target.errorCode);
    };

    request.onupgradeneeded = function(event) {
      console.log('openDb.onupgradeneeded');
      var store = event.currentTarget.result.createObjectStore(
        DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });

      store.createIndex('age', 'age', { unique: false });
    };
  }

  function getObjectStore(store_name, mode) {
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
  }

  function clearObjectStore(store_name) {
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    var request = store.clear();
    request.onsuccess = function(event) {
      // display some notice
      $('#user-list').empty();
    };
    request.onerror = function (event) {
      console.error("clearObjectStore:", event.target.errorCode);
      // displayActionFailure(this.error);
    };
  }

  function displayUsers() {
    var internet  = navigator.onLine;

    if (internet == true) {
      databaseUsers();
      // Used during testing to avoid having to 
      // switch internet on and off repeatedly
      // webStoredUsers();
    } else {
      webStoredUsers();
    }
  };

  function webStoredUsers(store) {
    console.log('displayUsers');
    $('#user-list').empty();
    var req;

    if (typeof store == 'undefined') {
      store = getObjectStore(DB_STORE_NAME, 'readonly');
    }

    var request = db.transaction('users').objectStore('users').openCursor()
    request.onsuccess = function(event) {
      var cursor = event.target.result;

      if (cursor) {
        // console.log('displayUsers cursor:', cursor);
        var key     = cursor.key,
            name    = cursor.value.name,
            age     = cursor.value.age,
            dob     = cursor.value.date_of_birth,
            height  = cursor.value.height;
        appendTable(key, name, age, dob, height);
        cursor.continue();
      } else {
        console.log("Thats it")
      }
    }
  };

  function addUser(name, age, dob, height) {
    // console.log('addUser')
    var obj     = { name: name, age: age, date_of_birth: dob, height: height},
        store   = getObjectStore(DB_STORE_NAME, 'readwrite'),
        request = store.add(obj);

    request.onsuccess = function(event) {
      // console.log('Insertion in DB successful');
      var message = 'User has been successfully added to web storage!';
          key     = event.target.result,
          name    = obj.name,
          age     = obj.age,
          dob     = obj.date_of_birth,
          height  = obj.height;
      appendTable(key, name, age, dob, height);
      flashNotice(message);
    };

    request.onerror = function(event) {
      console.error('error');
    };
  };

  function deleteUser(key, store) {
    console.log("deleteUser:", arguments);

    if (typeof store == 'undefined')
      store = getObjectStore(DB_STORE_NAME, 'readwrite');

    // As per spec http://www.w3.org/TR/IndexedDB/#object-store-deletion-operation
    // the result of the Object Store Deletion Operation algorithm is
    // undefined, so it's not possible to know if some records were actually
    // deleted by looking at the request result.
    var request = store.get(key);
    request.onsuccess = function(event) {
      var record = event.target.result;
      console.log("record:", record);
      if (typeof record == 'undefined') {
        console.log("No matching record found");
        return;
      }
    // Warning: The exact same key used for creation needs to be passed for
    // the deletion. If the key was a Number for creation, then it needs to
    // be a Number for deletion.
      request = store.delete(key);
      request.onsuccess = function(event) {
        var message = 'User has been successfully deleted from web storage!';
        $('#'+key).hide();
        flashNotice(message);
      };
      request.onerror = function (event) {
        console.error("deleteUser:", event.target.errorCode);
      };
    };

    request.onerror = function (event) {
      console.error("deleteUser:", event.target.errorCode);
      };
  }

  function syncDatabase() {
    console.log('get users for syncing');
    var req;

    if (typeof store == 'undefined') {
      store = getObjectStore(DB_STORE_NAME, 'readonly');
    }

    var request = db.transaction('users').objectStore('users').openCursor()
    request.onsuccess = function(event) {
      var cursor = event.target.result;

      if (cursor) {
        console.log('displayUsers cursor:', cursor);
        var name    = cursor.value.name,
            age     = cursor.value.age,
            dob     = cursor.value.date_of_birth,
            height  = cursor.value.height;
        normalSubmit(name, age, dob, height);
        deleteUser(cursor.key);
        cursor.continue();
      } else {
        console.log("Thats it")
      }
    }
  }
  
  openDb();

});

function normalSubmit(name, age, dob, height) {
  var datastring  = {NAME: name, AGE: age, DATE_OF_BIRTH: dob, HEIGHT: height},
      message     = 'User has been successfully added to the database!'
  $.ajax({
      type: 'POST',
      data: datastring,
      dataType: 'json',
      url: '/users',
        success: function(data) {
          var date            = data.new_user.date_of_birth,
              formattedDate   = date.substring(0,10),
              id              = data.new_user.id,
              name            = data.new_user.name,
              age             = data.new_user.age,
              height          = data.new_user.height;
          appendTable(id, name, age, formattedDate, height);
          flashNotice(message);
        }
    });
};

function databaseUsers() {
  $.ajax({
    type: 'GET',
    dataType: 'json',
    url: '/users/get_user_list',
      success: function(data) {
        $.each(data.users, function () {
          var date            = this.date_of_birth,
              id              = this.id,
              name            = this.name,
              age             = this.age,
              height          = this.height,
              formattedDate   = date.substring(0,10);
          appendTable(id, name, age, formattedDate, height);
        });
      }
  });
};

function deleteDbUser(id) {
  var datastring  = { ID: id },
      message     = 'User has been successfully deleted from the database!';
  $.ajax({
      type: 'DELETE',
      data: datastring,
      dataType: 'json',
      url: '/users/'+id,
        success: function(data) {
          $('#'+data.deleted_user.id).hide();
          flashNotice(message);
        }
    });
}

function flashNotice(message) {
  var noticeCount  = $(".notice-box > div").length,
      notice       = "";
      notice      +=  '<div class="notice alert alert-warning alert-dismissable fade in" role="alert">',
      notice      +=  ' <button type="button" class="close" data-dismiss="alert" aria-label="Close">',
      notice      +=  '   <span aria-hidden="true">&times;</span>',
      notice      +=  ' </button>',
      notice      +=  ' <p class="pull-right">'+noticeCount+'</p>',
      notice      +=  '</div>';
  $('.notice-box').append(notice);
  // Find a wasy to count notices, then display the number in a badge
};

function appendTable(id, name, age, dob, height) {
  var user  = "";
      user += '<tr id="'+id+'">',
      user += '  <td>'+id+'</td>',
      user += '  <td>'+name+'</td>',
      user += '  <td>'+age+'</td>',
      user += '  <td>'+dob+'</td>',
      user += '  <td>'+height+'</td>',
      user += '</tr>';
  $('#user-list').append(user);
};



