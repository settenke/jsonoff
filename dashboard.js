var state = 'OFF';
var client;

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

function showNotification(message) {
  iziToast.destroy();
  iziToast.show({
    id: 'jsonotif',
    title: 'Houston,',
    message: 'we have a problem: ' + message,
    position: 'topCenter',
    timeout: false,
    theme: 'dark',
    transitionIn: 'flipInX',
    transitionOut: 'flipOutX',
    progressBarColor: 'rgb(0, 255, 184)',
    image: '/jsonoff/lightbulb.jpg',
    imageWidth: 70,
    layout: 2,
    iconColor: 'rgb(0, 255, 184)'
  });
}


function goToConnect() {
    var uname = document.getElementById('uname').value;
    var upass = document.getElementById('upass').value;
    
    window.location.href = '/jsonoff/dashboard?username=' + uname + '&password=' + upass;
}

function connect() {
  client = new Paho.MQTT.Client('m23.cloudmqtt.com', 30392, 'web_' + parseInt(Math.random() * 100, 10));

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  var options = {
    useSSL: true,
    userName: getUrlParameter('username'),
    password: getUrlParameter('password'),
    onSuccess:onConnect,
    onFailure:doFail
  }

  client.connect(options);
}

function onConnect() {
  console.log('onConnect');
  client.subscribe('/jsonoff/lamp');
}

function doFail(e){
  showNotification(JSON.stringify(e));
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    showNotification('Connection lost: ' + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log('onMessageArrived: ' + message.payloadString);
  document.getElementsByClassName('fa-lightbulb')[0].setAttribute('data-prefix', (message.payloadString === 'ON' ? 'far' : 'fas'));
}


function toggleLamp() {
  if (getUrlParameter('username') == '' || getUrlParameter('password') == '') {
    showNotification('Username and Password is required!');
  } else {
    state = state === 'ON' ? 'OFF' : 'ON';

    message = new Paho.MQTT.Message(state);
    message.destinationName = '/jsonoff/lamp';
    message.retained = true;
    client.send(message);
  }
}

document.addEventListener("DOMContentLoaded", function(event) {
  if (getUrlParameter('username') == '' || getUrlParameter('password') == '') {
    showNotification('Username and Password is required!');
  } else {
    connect();
  }
});
