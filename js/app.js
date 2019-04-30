const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

var username;

const cleanInput = (input) => {
  return $('<div/>').text(input).html();
}

$(function() {

  var oscillator = initOscillator(audioContext);
  oscillator.start();
  var socket = io();
  $('form').submit(function(e) {
    e.preventDefault(); // prevents page reloading
    socket.emit('chat message', $('#m').val());
    $('#m').val('');
    return false;
  });

  socket.on('chat message', function(msg) {
    // oscillator.frequency.setValueAtTime(parseInt(msg), audioContext.currentTime);
    $('#messages').append($('<li>').text(msg));
  });

  $(window).keydown(event => {
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if ($('#usernameIn').is(':focus')) {
        username = $('#usernameIn').val();
        if (username) {
          socket.emit('add user', username);
        }
        console.log(username);
        $('#usernameForm').hide();
      }
    }
  });

  function success(pos) {
    var crd = pos.coords;
    socket.emit('new pos', crd.latitude);
    console.log(crd)

    navigator.geolocation.clearWatch(id);
  }

  function error(err) {
    console.warn('ERROR(' + err.code + '): ' + err.message);
  }

  options = {
    enableHighAccuracy: false,
    timeout: 1000,
    maximumAge: 0
  };

  id = navigator.geolocation.watchPosition(success, error, options);

});

function initOscillator(ctx) {
  var osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.connect(ctx.destination);
  return osc;
}
