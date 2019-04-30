const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

var username;

const cleanInput = (input) => {
  return $('<div/>').text(input).html();
}

$(function() {

  var oscillator = initOscillator(audioContext);
  // oscillator.start();

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

  socket.on('play sound', function(baseFreq) {
    var intervals = [0, 2, 4, 5, 7, 9, 11];
    var i = intervals[Math.floor(Math.random() * intervals.length)];
    var freq = baseFreq * Math.pow(Math.pow(2, i), 1/12);
    playSoundSignal(oscillator, freq);
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
    console.log(crd);
    // navigator.geolocation.clearWatch(id);
    // playPosSoundSignal(oscillator);
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

function playSoundSignal(osc, freq) {
  // console.log(pos);
  // var freq = Math.random() * (8000 - 500) + 500;
  osc.frequency.setValueAtTime(freq, audioContext.currentTime);
  osc.start();
  // osc.stop(audioContext.currentTime + 2);
}
