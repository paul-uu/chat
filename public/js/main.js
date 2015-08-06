$(function() {


	/* ====================================== */
	/*           Misc functionality           */
	Date.prototype.today = function () {  // today's date;
		return (((this.getMonth()+1) < 10) ? '0':'') + (this.getMonth()+1) +'/'+ ( (this.getDate() < 10) ? '0':'') + this.getDate() +'/'+ this.getFullYear();
	};	
	Date.prototype.timeNow = function () {  // current time
		return ((this.getHours() < 10) ? '0':'') + this.getHours() +':'+ ((this.getMinutes() < 10) ? '0':'') + this.getMinutes();
	};
	function current_time() {
		var today = new Date();
		var date = today.today();
		return today.timeNow();
	}


	/* ====================================== */
	/*                UI stuff                */
	$('#login').fadeIn('slow');
	$('#username_input').focus();


	/* ====================================== */
	/*        Basic Chat functionality        */
	var socket = io.connect();
	var $chat_message = $('#chat_input_form'),
		$chat_window  = $('#chat_window');

	$('#check_username').on('submit', function(e) {
		e.preventDefault();
		socket.emit('client -- new user', $('#username_input').val(), function(data) {
			if (data) {  // if username isn't taken...
				$('#login').hide();
				$('#chat_view').fadeIn('slow');
			} else {
				$('#login_error').html('Username already taken.');
			}
		});
		$('#username_input').val('');
	});
	$chat_message.on('submit', function(e) {
		e.preventDefault();
		var $message = $('#message_input');
		if ($message.val()) {
			var flag = ($message.val()).substr(0, 3);

			switch (flag) {	// check first three characters for flag

				// whisper
				case '-w ':

					var str = ($message.val()).substr(3);
					var recipient = str.substr(0, str.indexOf(' '));
					var msg = str.substr(str.indexOf(' ') + 1);


					socket.emit('client -- whisper', 
						{
							message: msg,
							recpient: recipent
						});
					$message.val('');
					break;

				// exlcude listed people from message
				case '-x ':
					var excluded = '';
					console.log('exclude');
					socket.emit('client -- exclude', msg);
					$message.val('');
					break;

				// regular message
				default:
					socket.emit('client -- send message', $message.val());
					$message.val('');
					break;
			}
		} else {
			return;
		}
	});
	socket.on('server -- new user', function(data) {
		$chat_window.append('<div class="msg_status">[' + current_time() + '] <span class="chat_username">' + data + '</span> has entered the room</div>');
	});
	socket.on('server -- new message', function(data) {
		$chat_window.append('<div class="msg">[' + current_time() + '] <span class="chat_username">' + data.username + '</span>: ' + data.message + '</div>');
	});
	socket.on('server -- whisper', function(data) {
		$chat_window.append('<div class="msg whisper">[' + current_time() + '] <span class="chat_username">' + data.username + '</span>: ' + data.message + '</div>');		
	});
	socket.on('server -- exclude', function(data) {

	});
	socket.on('server -- user left', function(data) {
		$chat_window.append('<div class="msg_status">[' + current_time() + '] <span class="chat_username">' + data + '</span> has left the room</div>');
	});
	socket.on('server -- update usernames', function(data) {
		var html_str = '', i = 0;
		for (; i < data.length; i++) {
			html_str += '<div class="username_list_iten">' + data[i] + '</div>';
		}
		$('#username_list').html(html_str);
	});


});
