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

			<input class="form-control" v-if="item.type==='input' && item.inputType==='number'" step="0.01" v-bind:name="item.name" v-bind:min="item.min" v-bind:max="item.max" v-bind:required="item.requiredField" v-model="item.selected" v-bind:type="item.inputType">
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

function send() {
  var form = $("form").serializeArray();

  var output = '<p>{ "form_data" : {<br>';
  for (var element in form) {
    if ((form[element].value)) {
      output += '&nbsp;&nbsp;&nbsp;&nbsp;"' + form[element].name + '": <strong>"' + form[element].value + '",</strong><br>';
    }
  }
  output += '},</p>';
  $('#form-data').html(output);
  var response = '';
  $.ajax({
    'url': "http://127.0.0.1:8000/builder/process/",
    'method': 'POST',
    data: form,
    success: function (data, textStatus, jqXHR) {
      var response = document.createTextNode(JSON.stringify(data));
      $('#results').html('<p>"response": ' + response.wholeText + '<br>}</p>');
    }
  });
  $('html, body').animate({scrollTop: 0}, 'fast');
}
