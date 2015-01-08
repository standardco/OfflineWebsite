// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/sstephenson/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require_tree .
// (function () {
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
      normalSubmit(name, age, dob, height);
      // Used during testing to avoid having to 
      // switch internet on and off repeatedly
      // addUser(name, age, dob, height);
    } else {
      // addUser(name, age, dob, height);
    }
    document.getElementById('new-user').reset();
  });

  $('.user-clear').on('click', function() {
    clearObjectStore();
  });

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
      webStoredUsers();
    } else {
      webStoredUsers();
    }
  };

  function databaseUsers() {
    console.log('Get users from database');
    $.ajax({
      type: 'GET',
      dataType: 'json',
      url: '/users/get_user_list',
        success: function(data) {
          $.each(data.users, function () {
            var date = this.date_of_birth
            var formatted_date = date.substring(0,10);
            $('#user-list').append('<tr id="'+this.id+'"><td>'+this.id+'</td><td>'+this.name+'</td><td>'+this.age+'</td><td>'+formatted_date+'</td><td>'+this.height+'</td></tr>');
          });
        }
    });
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
        console.log('displayUsers cursor:', cursor);
        $('#user-list').append('<tr id="'+cursor.key+'"><td>'+cursor.key+'</td><td>'+cursor.value.name+'</td><td>'+cursor.value.age+'</td><td>'+cursor.value.date_of_birth+'</td><td>'+cursor.value.height+'</td></tr>');
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
      $('#user-list').append('<tr id="'+event.target.result+'"><td>'+event.target.result+'</td><td>'+obj.name+'</td><td>'+obj.age+'</td><td>'+obj.date_of_birth+'</td><td>'+obj.height+'</td></tr>');
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
        $('#'+key).hide();
      };
      request.onerror = function (event) {
        console.error("deleteUser:", event.target.errorCode);
      };
    };

    request.onerror = function (event) {
      console.error("deleteUser:", event.target.errorCode);
      };
  }
  
  openDb();
  // addEventListeners();

});
// })(); // Immediately-Invoked Function Expression (IIFE)

function normalSubmit(name, age, dob, height) {
  var datastring = {NAME: name, AGE: age, DATE_OF_BIRTH: dob, HEIGHT: height}
  $.ajax({
      type: 'POST',
      data: datastring,
      dataType: 'json',
      url: '/users',
        success: function(data) {
          console.log(data);
          var date = data.new_user.date_of_birth
          var formatted_date = date.substring(0,10);
          $('#user-list').append('<tr id="'+data.new_user.id+'"><td>'+data.new_user.id+'</td><td>'+data.new_user.name+'</td><td>'+data.new_user.age+'</td><td>'+formatted_date+'</td><td>'+data.new_user.height+'</td></tr>');
        }
    });
};

function deleteDbUser(id) {
  var datastring = { ID: id }
  $.ajax({
      type: 'DELETE',
      data: datastring,
      dataType: 'json',
      url: '/users/'+id,
        success: function(data) {
          // console.log(data);
          // var date = data.new_user.date_of_birth
          // var formatted_date = date.substring(0,10);
          // $('#user-list').append('<tr id="'+data.new_user.id+'"><td>'+data.new_user.id+'</td><td>'+data.new_user.name+'</td><td>'+data.new_user.age+'</td><td>'+formatted_date+'</td><td>'+data.new_user.height+'</td></tr>');
        }
    });
}

function formatDate(d) {
  console.log(d);
  // date = new Date(d)
  var dd = d.getDate(); 
  var mm = d.getMonth();
  var yyyy = d.getFullYear(); 
  if(dd<10){dd='0'+dd} 
  if(mm<10){mm='0'+mm};
  return d = yyyy+'-'+mm+'-'+dd
};



