// Initialize app
var app = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var serviceURL = 'https://okmlshub.com/judson/loan/api/v1/';
var storage = window.localStorage;

// Add view
var mainView = app.addView('.view-main', {
    dynamicNavbar: true
});

//deleteStorage('dllogin');
setStorage('user_id', 1);
setStorage('dllogin', 1);
//setStorage('max_accounts', 1);

//console.log("LOGGED IN: " + isLoggedIn());
if(isLoggedIn() !== true) {
	//mainView.router.load({pageName: 'dashboard'});
	mainView.router.loadPage('welcome.html');
}
else {
	$('.toolbar').show();
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //alert("READY");
	//Push Notify
	var push = PushNotification.init({
		"android": {
			"senderID": "1058444389453"
		},
		"browser": {},
		"ios": {
			"sound": true,
			"vibration": true,
			"badge": true
		},
		"windows": {}
	});
	
	oldRegId = getStorage('registrationId');
	push.on('registration', function(data) {   
		//alert("reg Data: " + data.registrationId);  //this function give registration id from the GCM server if you dont want to see it please comment it
		if(data.registrationId != oldRegId) {
			setStorage('registrationId', data.registrationId);
		}
	});
	
	push.on('error', function(e) {
		alert("push error = " + e.message);
	});

	push.on('notification', function(data) {
		alert('notification event');
		navigator.notification.alert(
			data.message,         // message
			null,                 // callback
			data.title,           // title
			'Ok'                  // buttonName
		);
	});
})

$$(document).on('pageReinit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	console.log("PAGE REINIT NAME: " + page.name);

})
// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
app.onPageInit('about', function (page) {
    // Do something here for "about" page
	
})

$(document).on('click', '#home-events li, #calendar-events li, .client_appointments li', function() {
	mainView.router.loadPage('event.html');
});

$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	/*console.log("PAGE NAME: " + page.name);*/
	if (page.name === 'index') {
		//console.log('INDEX, CHECK LOGGIN: ' + isLoggedIn());
		if($('#acct-id-input').val() == '') {
			$('#acct-id-input').val(getStorage('acct-id'));
			buildDashboard();
		}
	}
    
    if (page.name === 'amortization') {
		var amount = $('input[name="loan_amount"]').val().replace(/,/g, '');
		var rate = $('input[name="int_rate"]').val();
		var years = $('input[name="loan_years"]').val();
		var start_date = $('input[name="start_date"]').val();
		var current_month = $('input[name="current_month"]').val();
		var acct_id = $('input[name="id"]').val();
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'amort_table',
				'format': 'json',
				'amount': amount, 
				'rate': rate, 
				'years': years, 
				'start_date': start_date, 
				'current_month': current_month,
				'acct_id': acct_id,	
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
				/*console.log('Data: ' + data);*/ 
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code); */
				if(obj.code === 1) {
					$('#amort-container').html(obj.data);	
				}
				else {
					//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				}
				loading('hide');
			},
			error : function(request,error) {
				$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
	
	if (page.name === 'settings') {
		//get settings
		var id = getStorage('user_id');
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'settings',
				'format': 'json',
				'id': id,
			},
			dataType: 'html',
			beforeSend: function() {
				//loading('show');
		  	},
			success : function(data) {
				console.log('Data: ' + data);
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code); */
				if(obj.code === 1) {
					$('#settingsFrm input[name="first_name"]').val(obj.data.first_name);
					$('#settingsFrm input[name="last_name"]').val(obj.data.last_name);
					$('#settingsFrm input[name="email"]').val(obj.data.email);
					$('#settingsFrm input[name="cell_phone"]').val(obj.data.cell_phone);
					if(obj.data.email_optin == 1) {
						$('#settingsFrm input[name="email_optin"]').prop('checked', true);
					}
					if(obj.data.sms_optin == 1) {
						$('#settingsFrm input[name="sms_optin"]').prop('checked', true);
					}
				}
				else {
					
				}
			},
			error : function(request,error) {
				$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
	
	if (page.name === 'coupon') {
		$('#payment-amt').html(getStorage('payment-amt'));
		$('#acct-id').html(getStorage('acct-id'));
		
	}
	
	if (page.name === 'alerts') {
		
		var user_id = $('input[name="user_id"]').val();
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'alerts_table',
				'format': 'json',
				'user_id': user_id,	
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
			/*console.log('Data: ' + data);*/ 
				var obj = $.parseJSON(data);
				/*console.log('Resp: ' + obj.code);*/
				if(obj.code === 1) {
					$('#alerts-container').html(obj.data);	
				}
				else {
					//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				}
				loading('hide');
				$$('.page-content').on('scroll',function(e){
					$('.alert-tr').each(function( index ) {
						if(isScrolledIntoView($(this)) === true) {
							var id = $(this).attr('id').replace('alert-tr-', '');
							/*console.log("ID: " + id);*/
							//mark as read 
							if(!$(this).hasClass('read')) {
								$$.ajax({
									url : serviceURL,
									type : 'POST',
									data : {
										'method': 'post',
										'action': 'mark_alert_read',
										'format': 'json',
										'id' : id, 
									},
									dataType: 'html',
									beforeSend: function() {

									},
									success : function(data) {
									console.log("ALERT STATUS DATA: " + data);
										var obj = $.parseJSON(data);
										if(obj.code === 1) {
											$('#alert-tr-' + id).addClass('read');
										}
										else {

										}

									},
									error : function(request,error) {
										console.log("Request (error): "+JSON.stringify(request));
									}
								});
							}
						}
					});	
			
				});
			},
			error : function(request,error) {
				$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
})

$$(document).on('click', '.loginBtn', function() {
	$('alert').remove();
	var email = $$('input[name="email"]').val();
	var password = $$('input[name="password"]').val();
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'user_login',
			'format': 'json',
			'email': email,
			'password': password
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			/*console.log('Data: ' + data);*/ 
			var obj = $.parseJSON(data);
			/*console.log('Resp: ' + obj.code);*/
			if(obj.code === 1) {
				setStorage('email', obj.data.email);
				setStorage('user_id', obj.data.id);
				setStorage('dllogin', 1);
				setStorage('max_accounts', obj.data.max_accounts);
				mainView.router.loadPage('index.html');
				location.reload();
			}
			else {
				
				
			}
			loading('hide');
		},
		error : function(request,error) {
			$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});

})

function isLoggedIn() {
	//var logged_in = getStorage('dllogin');
	console.log(getStorage('user_id'));
	if(getStorage('dllogin') !== '' && getStorage('dllogin') !== null && getStorage('user_id') != null) {
		return true;
	}
	return false;	
}

function setStorage(name, value) {
	storage.setItem(name, value);
}

function getStorage(name) {
	var val = storage.getItem(name);
	return val;
}

function deleteStorage(name) {
	//alert("DELETED");
	storage.removeItem(name);
	if(name === 'dllogin') {
		storage.removeItem('id');
		storage.removeItem('user_id');
		storage.removeItem('first_name');
		storage.removeItem('last_name');
		storage.removeItem('email');
	}
}

function modalOpen(id) {
	$('.app-modal').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
}

function modalClose() {
	$('.app-modal').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function confirm_dialog(message, yesCallback, noCallback) {
	$('#confirm').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
	$('#confirm .title').html(message);
	//var confirm_dialog = $('#confirm').confirm_dialog();

	$('#btnYes').click(function() {
		confirm_dialog_close();
		yesCallback();
	});
	$('#btnNo').click(function() {
		confirm_dialog_close();
		noCallback();
	});
}

function confirm_dialog_close() {
	$('#confirm').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}