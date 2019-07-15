$(function () {
        $('.builderCartContent').load('index.php?route=product/dbuilder/cart', function () {
        $('#builder-selections').trigger("reset");
        var finalModelProduct = '';
    });
});

$('body').on('blur', 'input, select', function (e) {
	$(e.target).parent().parent().find('.text-danger').remove();
		e.target.checkValidity();
		$('<div class="text-danger text-center">' + e.target.validationMessage + '</div>').insertAfter(e.target);
});

$('#builder-selections').on('submit', function(e){
		e.preventDefault();

    $.ajax({
        url: 'index.php?route=product/dbuilder/generateModel',
        type: 'post',
        data: $('#builder-selections').serialize(),
        dataType: 'json',
        beforeSend: function () {
            $('.alert-danger').remove();
            $('.text-danger').remove();
            $('#button-cart').toggleClass('disabled');
            $('#button-cart').data('original-text', $('#button-cart').html());
            $('#button-cart').html($('#button-cart').data('loading-text'));
        },
        complete: function () {
            $('#button-cart').html($('#button-cart').data('original-text'));
            $('#button-cart').toggleClass('disabled');
        },
        success: function (json) {
            if (json['error']) {
                // Handle Errors
                $('#builder-toolbox').parent().parent().prepend('<div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> ' + json['error'] + '<button type="button" class="close" data-dismiss="alert">&times;</button></div>');

                $.each(json.errors, function (k, v) {
                    if ($('input[name="' + k + '"]').length) {
                        $('input[name="' + k + '"]').after('<div class="text-danger text-center" id="error_product_group">' + v + '</div>');
                    } else if ($('select[name="' + k + '"]').length) {
                        $('select[name="' + k + '"]').after('<div class="text-danger text-center" id="error_product_group">' + v + '</div>');
                    }
                });

                $('html, body').animate({scrollTop: $(".alert-danger").offset().top - 100}, 500);
            } else {
                // No Errors, Add to Cart
                $.each(json['items'], function (index) {
                    var product = json['items'][index];
                    product['product_group'] = $('input[name="product_group"]').val();

					if (product['quantity'] > 0) {
						product['quantity'] = product['quantity'] * $('input[name="quantity"]').val();
					} else {
						product['quantity'] = $('input[name="quantity"]').val();
					}

                    add = add_to_cart(product);
                });
            }

            $('html, body').animate({scrollTop: $("#product_builder_tabs").offset().top - 100}, 500);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            $('#builder-toolbox').parent().parent().prepend('<div class="alert alert-danger alert-dismissible"><i class="fa fa-exclamation-circle"></i> ' + thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText + '<button type="button" class="close" data-dismiss="alert">&times;</button></div>');
            $('html, body').animate({scrollTop: $("#product_builder_tabs").offset().top - 100}, 500);
        }
    });
});

$('body').on('change', 'select', function () {
    //$('#CartTopImages #img-' + $(this).attr('name')).fadeOut(300, function() { $(this).remove(); });

    var element = $(this);

//    var html = '<img class="img-responsive" src="' + $('option:selected', element).attr('image') + '"><p class="text-center">' + $('label[for="' + element.attr('name') + '"]').text() + '</p>';
//
//    if ($('option:selected', this).attr('image') && $('#CartWrapper #CartTopImages #img-' + element.attr('name')).length && element.val() == '') {
//        $('#CartWrapper #CartTopImages #img-' + element.attr('name')).fadeOut();
//    } else if ($('option:selected', this).attr('image') && $('#CartWrapper #CartTopImages #img-' + element.attr('name')).length) {
//        $('#CartWrapper #CartTopImages #img-' + element.attr('name')).html(html);
//    } else if ($('option:selected', this).attr('image')) {
//        $('#CartWrapper #CartTopImages').append('<div id="img-' + element.attr('name') + '" class="col-md-2 text-center" style="">' + html + '</div>');
//    }

    if ($('option:selected', this).attr('model_3d')) {
        // Load Model
        loadFurniture($('option:selected', this).attr('model_3d'));
    } else {
        // Update Model Layers
        update3D();
    }

});

function add_to_cart(product_data) {
    if (product_data['quantity'] == 0) {
        product_data['quantity'] = 1;
    }

    $.ajax({
        url: 'index.php?route=checkout/cart/add',
        type: 'post',
        data: product_data,
        dataType: 'json',
        beforeSend: function () {
            ////$('#button-cart').button('reset');
        },
        complete: function () {
            $('#button-cart').button('reset');
        },
        success: function (json) {
            if (json['error']) {
                if (json['error']['option']) {
                    for (i in json['error']['option']) {
                        var element = $('#OptionsModel #input-option' + i.replace('_', '-'));

                        if (element.parent().hasClass('input-group')) {
                            element.parent().after('<div class="text-danger text-center">' + json['error']['option'][i] + '</div>');
                        } else {
                            element.after('<div class="text-danger text-center">' + json['error']['option'][i] + '</div>');
                        }
                    }
                }

                if (json['error']['recurring']) {
                    $('select[name=\'recurring_id\']').after('<div class="text-danger text-center">' + json['error']['recurring'] + '</div>');
                }

                // Highlight any found errors
                $('.text-danger').parent().addClass('has-error');
            }

            if (json['success']) {
                $('#cart > button').html('<span id="cart-total"><i class="fa fa-shopping-cart"></i> ' + json['total'] + '</span>');

                $('#cart > ul').load('index.php?route=common/cart/info ul li');

                $('.builderCartContent').load('index.php?route=product/dbuilder/cart', function () {

                    // Any callback stuff...
                });

                $('#OptionsModel').modal('hide');
            }

            $(document).delegate('.product-info-link', 'click', function (e) {
                e.preventDefault();

                $('#modal-product-info').remove();

                var element = this;

                $.ajax({
                    url: $(element).attr('data-info'),
                    type: 'get',
                    dataType: 'html',
                    success: function (data) {
                        $('body').append(data);

                        $('#modal-product-info').modal('show');

                        $('.dc-pace-activity').remove();
                        //$('#content').removeClass('dc-blured');
                    }
                });
            });

        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(thrownError + "\r\n" + xhr.statusText + "\r\n" + xhr.responseText);
        }
    });
}

function update3D() {
    // Update Changes
    var layers = [];
    $('option:selected', '#dynamic-form').each(function () {
        layers.push($(this).parent().attr('name') + "-" + $(this).val());
    });
    updateFurniture(layers);
}

// Side customizer viewer
jQuery(document).ready(function ($) {
    "use strict";
    $(".customizer-toggle").on("click", function () {
        $(".customizer").toggleClass("open")
    });
});

// Side cart viewer
jQuery(document).ready(function ($) {
    "use strict";
    $(".offcanvas-shopping-cart-toggle").on("click", function () {
        $(".offcanvas-shopping-cart").toggleClass("open")
    });
});
