// Define a new component called button-counter
Vue.component('dynamic-form-field', {
  data: function () {
    return {}
  },
  props: ['item'],
  methods: {
    hasChildren: function (item) {
      var value = this.getSelectedValue(item);
      return value && value.children && value.children.length;
    },
    getSelectedValue: function (item) {
      var value;
      if (item && item.values)
        item.values.forEach(function (val) {
          if (val.name == item.selected)
            value = val;
        });
      return value;
    }
  },

  template: `
	<div class="text-center">
		<h4 v-if="item.section" class="text-muted text-normal text-uppercase text-center">{{item.section}}</h4>
		<hr v-if="item.section" class="margin-bottom-1x">
		<div v-if="item.name" class="form-group" v-bind:class="{ required: item.requiredField, 'text-danger': item.hasError }">
			<label class="control-label text-center" v-bind:for="item.name"> {{item.title}} </label>
			<select class="form-control select2 select2-hidden-accessible" v-if="item.type=='select'" v-bind:name="item.name" v-bind:id="item.name" v-bind:required="item.requiredField" v-model="item.selected">
				<option value="" selected> --- Please Select --- </option>
				  <template v-for="value in item.values">
				  <optgroup v-if="value.optgroup_title" v-bind:label="value.optgroup_title"></optgroup>
				  <option v-if="value.name" v-bind:value="value.name" v-bind:image="value.image">{{value.title}}</option>
				  </template>
			</select>

			<input class="form-control" v-if="item.type==='input' && item.inputType==='number'" step="1" v-bind:name="item.name" v-bind:min="item.min" v-bind:max="item.max" v-bind:required="item.requiredField" v-model="item.selected" v-bind:type="item.inputType">
			<input class="form-control" v-else-if="item.type==='input'" v-bind:name="item.name" v-bind:min="item.min" v-bind:max="item.max" v-bind:required="item.requiredField" v-model="item.selected" v-bind:type="item.inputType">
			
		</div>

		<div v-if="hasChildren(item)">
			<dynamic-form-field v-for="item in getSelectedValue(item).children" v-bind:item="item"/>
		</div>

	</div>
    `


});

var app = new Vue({
  el: '#dynamic-form',
  data: {
    tree: []
  },
  methods: {
    getTree: function (data = null) {
      data = {builder: "DESK"};
      $.ajax({
        // url: 'http://127.0.0.1:8000/builder/form/',
        url: 'form.json',
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
// MOCK

var parameters = getAllUrlParams(window.location.href);
var output = '<p>formData = {<br>';
for (var property in parameters) {
  if (parameters[property]) {
    output += '&nbsp;&nbsp;&nbsp;&nbsp;"' + property + '": <strong>"' + parameters[property] + '",</strong><br>';
  }
}
output += '}</p>';

$('#results').html(output);

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
