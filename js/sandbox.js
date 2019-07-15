// MOCK

var parameters = getAllUrlParams(window.location.href);
var output = '<p>formData = {<br>';
for (var property in parameters) {
  if (parameters[property]) {
    output += '&nbsp;&nbsp;&nbsp;&nbsp;"' + property + '": <strong>"' + parameters[property] + '",</strong><br>';
  }
}
output += '}</p>';

$('#results').append(output);

function getAllUrlParams(url) {

  // get query string from url (optional) or window
  var queryString = url ? url.split('?')[1] : window.location.search.slice(1);

  // we'll store the parameters here
  var obj = {};

  // if query string exists
  if (queryString) {

    // stuff after # is not part of query string, so get rid of it
    queryString = queryString.split('#')[0];

    // split our query string into its component parts
    var arr = queryString.split('&');

    for (var i = 0; i < arr.length; i++) {
      // separate the keys and the values
      var a = arr[i].split('=');

      // set parameter name and value (use 'true' if empty)
      var paramName = a[0];
      var paramValue = typeof (a[1]) === 'undefined' ? true : a[1];

      // if the paramName ends with square brackets, e.g. colors[] or colors[2]
      if (paramName.match(/\[(\d+)?\]$/)) {

        // create key if it doesn't exist
        var key = paramName.replace(/\[(\d+)?\]/, '');
        if (!obj[key]) obj[key] = [];

        // if it's an indexed array e.g. colors[2]
        if (paramName.match(/\[\d+\]$/)) {
          // get the index value and add the entry at the appropriate position
          var index = /\[(\d+)\]/.exec(paramName)[1];
          obj[key][index] = paramValue;
        } else {
          // otherwise add the value to the end of the array
          obj[key].push(paramValue);
        }
      } else {
        // we're dealing with a string
        if (!obj[paramName]) {
          // if it doesn't exist, create property
          obj[paramName] = paramValue;
        } else if (obj[paramName] && typeof obj[paramName] === 'string') {
          // if property does exist and it's a string, convert it to an array
          obj[paramName] = [obj[paramName]];
          obj[paramName].push(paramValue);
        } else {
          // otherwise add the property
          obj[paramName].push(paramValue);
        }
      }
    }
  }

  return obj;
}

var index = 0;

function send() {
  index++;
  var form = $("form").serializeArray();
  form[1].value = form[1].value + index;

  var output = '<p> { "form_data" : {<br>';
  for (var element in form) {
    if ((form[element].value)) {
      output += '&nbsp;&nbsp;&nbsp;&nbsp;"' + form[element].name + '": <strong>"' + form[element].value + '",</strong><br>';
    }
  }
  output += '},"response":{}},</p>';
  $('#form-data').append(output);
  var response = '';
  $('html, body').animate({scrollTop: 0}, 'fast');
}

var app;

$("#builder-type").change(function () {
  $("input[name='builder']").val($("#builder-type").val());
  console.log('$("input[name=\'builder\']").val() changed');

  app = new Vue({
    el: '#dynamic-form',
    data: {
      tree: []
    },
    methods: {
      getTree: function (data = null) {
        $.ajax({
          // url: 'http://127.0.0.1:8000/builder/form/',
          url: $("#builder-type").val() + '.json',
          // data: data,
          method: 'GET',
          success: function (data) {
            app.tree = data;
          },
          error: console.log
        });
      }
    }
  });

  app.getTree();

});


$(document).ready(function () {
  $('body').on('change', 'select', function () {
    if ($('option:selected', this).attr('model_3d')) {
      // Load Model
      loadFurniture($('option:selected', this).attr('model_3d'));
    } else {
      // Update Model Layers
      update3D();
    }
  });
});
